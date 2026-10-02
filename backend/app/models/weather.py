from typing import Optional, List
from pydantic import BaseModel, Field

class Location(BaseModel):
    name: str = Field(..., description="City or observatory name")
    state: Optional[str] = Field(None, description="State or territory name")
    country: str = Field("India", description="Country name")
    lat: float = Field(..., description="Latitude coordinate")
    lon: float = Field(..., description="Longitude coordinate")
    timezone: str = Field("Asia/Kolkata", description="Timezone name e.g. Asia/Kolkata")
    timezone_abbreviation: Optional[str] = Field("IST", description="Timezone abbreviation e.g. IST")
    elevation: Optional[float] = Field(None, description="Elevation in meters")

class CurrentWeather(BaseModel):
    temperature: float = Field(..., description="Temperature in Celsius")
    feels_like: float = Field(..., description="Apparent temperature in Celsius")
    humidity: int = Field(..., description="Relative humidity %")
    wind_speed: float = Field(..., description="Wind speed in km/h")
    wind_direction: float = Field(0.0, description="Wind direction in degrees")
    wind_gust: Optional[float] = Field(None, description="Wind gust speed in km/h")
    precipitation: float = Field(0.0, description="Precipitation in mm")
    precipitation_probability: int = Field(0, description="Precipitation probability %")
    uv_index: float = Field(0.0, description="UV Index (0-12+)")
    aqi: int = Field(50, description="Air Quality Index (Indian AQI scale)")
    aqi_category: str = Field("Satisfactory", description="Good, Satisfactory, Moderate, Poor, Very Poor, Severe")
    pm2_5: Optional[float] = Field(None, description="PM2.5 concentration µg/m³")
    pm10: Optional[float] = Field(None, description="PM10 concentration µg/m³")
    visibility: Optional[float] = Field(10.0, description="Visibility in km")
    visibility_category: str = Field("Good", description="Excellent, Good, Moderate, Poor, Hazardous")
    visibility_available: bool = Field(True, description="True if real API visibility is available")
    pressure: float = Field(1013.25, description="Atmospheric pressure in hPa")
    condition_code: int = Field(0, description="WMO weather interpretation code")
    condition_text: str = Field("Clear Sky", description="Human readable condition")
    is_day: bool = Field(True, description="Daytime indicator")
    observation_time: str = Field(..., description="ISO 8601 timestamp")
    sunrise: str = Field("06:00", description="Sunrise time HH:MM")
    sunset: str = Field("18:30", description="Sunset time HH:MM")
    daylight_duration: Optional[str] = Field("12h 30m", description="Formatted daylight duration")

class HourlyForecast(BaseModel):
    time: str = Field(..., description="ISO 8601 or HH:MM timestamp")
    hour: int = Field(..., description="0-23 hour")
    temperature: float
    feels_like: float
    precipitation_probability: int
    precipitation: float = 0.0
    humidity: int
    wind_speed: float
    uv_index: float = 0.0
    aqi: int = 50
    visibility: Optional[float] = 10.0
    condition_code: int = 0
    condition_text: str = "Clear"
    is_day: bool = True

class DailyForecast(BaseModel):
    date: str = Field(..., description="YYYY-MM-DD")
    day_name: str = Field(..., description="Mon, Tue, etc.")
    temp_max: float
    temp_min: float
    precipitation_probability: int
    precipitation_sum: float = 0.0
    condition_code: int = 0
    condition_text: str = "Clear"
    uv_index_max: float = 5.0
    sunrise: str = "06:00"
    sunset: str = "18:30"
    daylight_duration_seconds: Optional[float] = None
    daylight_duration: Optional[str] = "12h 30m"

class SevereWeatherAlert(BaseModel):
    id: str
    severity: str = Field("advisory", description="advisory, watch, warning, emergency")
    title: str
    description: str
    impact_level: str = Field("moderate", description="low, moderate, high, severe")
    affected_area: str
    effective_from: str
    effective_to: str
    source: str = "IMD Nowcast / MoES"

class MarineData(BaseModel):
    is_coastal: bool = False
    wave_height_meters: Optional[float] = None
    tide_type: Optional[str] = None  # High Tide, Low Tide
    tide_height_meters: Optional[float] = None
    next_tide_time: Optional[str] = None
    sea_surface_temp: Optional[float] = None
    sea_condition: Optional[str] = None  # Calm, Moderate, Rough, Very Rough
    fishermen_warning: bool = False
    coastal_advisory: Optional[str] = None

class WeatherResponse(BaseModel):
    location: Location
    current: CurrentWeather
    hourly: List[HourlyForecast]
    daily: List[DailyForecast]
    alerts: List[SevereWeatherAlert]
    marine: Optional[MarineData] = None
    provider: str = "VayuSync Hybrid (IMD Spec / Open-Meteo)"
    cached: bool = False
    simulated_scenario: Optional[str] = None
