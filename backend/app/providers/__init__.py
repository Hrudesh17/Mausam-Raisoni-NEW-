from .base import BaseWeatherProvider
from .open_meteo import OpenMeteoProvider
from .imd import IMDWeatherProvider
from .mock import MockWeatherProvider
from ..core.config import settings

def get_weather_provider(provider_name: str | None = None) -> BaseWeatherProvider:
    name = (provider_name or settings.ACTIVE_PROVIDER).lower()
    if name in ("mock", "scenario"):
        return MockWeatherProvider()
    elif name == "imd":
        return IMDWeatherProvider()
    else:
        return OpenMeteoProvider()

__all__ = [
    "BaseWeatherProvider",
    "OpenMeteoProvider",
    "IMDWeatherProvider",
    "MockWeatherProvider",
    "get_weather_provider",
]
