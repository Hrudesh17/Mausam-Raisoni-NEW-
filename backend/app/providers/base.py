from abc import ABC, abstractmethod
from typing import Optional
from ..models.weather import WeatherResponse

class BaseWeatherProvider(ABC):
    """Abstract Base Class for Weather Providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider identifier name."""
        pass

    @abstractmethod
    async def get_weather(
        self,
        lat: float,
        lon: float,
        city_name: Optional[str] = None,
        scenario: Optional[str] = None
    ) -> WeatherResponse:
        """Fetch complete current, forecast, alerts, and marine weather data."""
        pass

    @abstractmethod
    async def get_radar_layers(self, lat: float, lon: float) -> dict:
        """Fetch available radar and satellite layer metadata."""
        pass
