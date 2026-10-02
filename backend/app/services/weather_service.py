import logging
import time
from typing import Optional, Dict, Any, Tuple
from ..models.weather import WeatherResponse
from ..providers import get_weather_provider

logger = logging.getLogger(__name__)

class WeatherServiceError(Exception):
    def __init__(self, message: str, error_type: str = "WEATHER_API_ERROR", location: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.error_type = error_type
        self.location = location

class WeatherService:
    """
    Centralized Weather Service for VayuSync Sahayak.
    Coordinates live data fetching, cache management, and strict validation.
    Guarantees no stale location fallbacks, no fabricated weather values, and complete telemetry integrity.
    """
    _cache: Dict[str, Tuple[float, WeatherResponse]] = {}
    _CACHE_TTL_SECONDS = 60  # Short-lived server-side cache

    @classmethod
    def _make_cache_key(cls, lat: float, lon: float, location_name: str, time_range: str) -> str:
        return f"{location_name.strip().lower()}:{round(lat, 2)}:{round(lon, 2)}:{time_range.lower()}"

    @classmethod
    async def fetch_weather(
        cls,
        lat: float,
        lon: float,
        location_name: str,
        time_range: str = "current",
        provider_name: Optional[str] = None,
        force_refresh: bool = False
    ) -> WeatherResponse:
        cache_key = cls._make_cache_key(lat, lon, location_name, time_range)
        now = time.time()

        if not force_refresh and cache_key in cls._cache:
            cached_time, cached_data = cls._cache[cache_key]
            if now - cached_time < cls._CACHE_TTL_SECONDS:
                logger.info(f"[WEATHER_SERVICE] Cache hit for '{location_name}' ({cache_key})")
                return cached_data

        logger.info(f"[WEATHER_SERVICE] Querying provider for '{location_name}' (lat={lat}, lon={lon})")
        provider = get_weather_provider(provider_name)

        try:
            weather_data = await provider.get_weather(lat=lat, lon=lon, city_name=location_name)
            
            # Validation: Ensure essential weather fields are populated
            if not weather_data or not weather_data.current:
                raise WeatherServiceError(
                    f"I couldn't retrieve live weather data for {location_name} right now. Please try again in a moment.",
                    error_type="INVALID_WEATHER_RESPONSE",
                    location=location_name
                )
            
            # Store in short-lived cache
            cls._cache[cache_key] = (now, weather_data)
            return weather_data

        except WeatherServiceError:
            raise
        except Exception as err:
            logger.error(f"[WEATHER_SERVICE] Live fetch failed for '{location_name}': {err}")
            raise WeatherServiceError(
                f"I couldn't retrieve live weather data for {location_name} right now. Please try again in a moment.",
                error_type="WEATHER_API_ERROR",
                location=location_name
            ) from err
