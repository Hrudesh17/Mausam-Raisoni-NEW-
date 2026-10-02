from datetime import datetime
from typing import Optional, List
from .base import BaseWeatherProvider
from ..models.weather import (
    WeatherResponse,
    Location,
    CurrentWeather,
    HourlyForecast,
    DailyForecast,
    SevereWeatherAlert,
    MarineData,
)

SCENARIOS = {
    "mumbai_monsoon": {
        "city": "Mumbai",
        "state": "Maharashtra",
        "lat": 19.0760,
        "lon": 72.8777,
        "temp": 28.0,
        "feels_like": 34.0,
        "humidity": 92,
        "wind_speed": 34.0,
        "wind_gust": 55.0,
        "rain_prob": 90,
        "rain_mm": 28.4,
        "condition": "Heavy Monsoon Downpour",
        "wmo": 65,
        "aqi": 35,
        "aqi_cat": "Good",
        "pm2_5": 18.0,
        "pm10": 30.0,
        "visibility": 2.5,
        "alert": SevereWeatherAlert(
            id="imd-red-mumbai",
            severity="warning",
            title="IMD Red Warning: Intense Rainfall & Urban Flooding",
            description="Extremely heavy spells expected over the next 4 hours. Low-lying railway lines (Hindmata, Kurla, Sion) report water stagnation. Avoid two-wheeler commute.",
            impact_level="severe",
            affected_area="Mumbai Metropolitan Region (MMR)",
            effective_from="Now",
            effective_to="21:00 IST",
            source="IMD Regional Meteorological Centre, Mumbai",
        ),
        "marine": MarineData(
            is_coastal=True,
            wave_height_meters=4.2,
            tide_type="High Tide (Spring Tide)",
            tide_height_meters=4.65,
            next_tide_time="14:40 IST",
            sea_surface_temp=29.0,
            sea_condition="Very Rough",
            fishermen_warning=True,
            coastal_advisory="Fishermen strictly advised not to venture into East-Central Arabian Sea.",
        ),
    },
    "delhi_smog": {
        "city": "New Delhi",
        "state": "Delhi NCR",
        "lat": 28.6139,
        "lon": 77.2090,
        "temp": 14.5,
        "feels_like": 13.0,
        "humidity": 78,
        "wind_speed": 6.0,
        "wind_gust": 9.0,
        "rain_prob": 5,
        "rain_mm": 0.0,
        "condition": "Dense Smog / Shallow Fog",
        "wmo": 45,
        "aqi": 385,
        "aqi_cat": "Severe",
        "pm2_5": 295.0,
        "pm10": 420.0,
        "visibility": 0.8,
        "alert": SevereWeatherAlert(
            id="cpcb-delhi-smog",
            severity="warning",
            title="CPCB / IMD Health Warning: GRAP Stage IV Severe Smog",
            description="AQI has crossed 380 (Severe). Surface inversion is trapping vehicular emissions. Outdoor strenuous exercise strongly discouraged. N95 respirator mandatory.",
            impact_level="severe",
            affected_area="Delhi NCR, Noida, Gurugram",
            effective_from="Now",
            effective_to="11:00 AM Tomorrow",
            source="Central Pollution Control Board & IMD Safdarjung",
        ),
        "marine": None,
    },
    "bengaluru_pleasant": {
        "city": "Bengaluru",
        "state": "Karnataka",
        "lat": 12.9716,
        "lon": 77.5946,
        "temp": 23.5,
        "feels_like": 23.0,
        "humidity": 52,
        "wind_speed": 14.0,
        "wind_gust": 20.0,
        "rain_prob": 10,
        "rain_mm": 0.0,
        "condition": "Partly Cloudy & Pleasant",
        "wmo": 2,
        "aqi": 42,
        "aqi_cat": "Good",
        "pm2_5": 14.0,
        "pm10": 32.0,
        "visibility": 10.0,
        "alert": None,
        "marine": None,
    },
    "rajasthan_heatwave": {
        "city": "Jaipur",
        "state": "Rajasthan",
        "lat": 26.9124,
        "lon": 75.7873,
        "temp": 43.8,
        "feels_like": 46.2,
        "humidity": 18,
        "wind_speed": 22.0,
        "wind_gust": 38.0,
        "rain_prob": 0,
        "rain_mm": 0.0,
        "condition": "Severe Heatwave & Hot Loo Winds",
        "wmo": 0,
        "aqi": 115,
        "aqi_cat": "Moderate",
        "pm2_5": 62.0,
        "pm10": 160.0,
        "visibility": 8.0,
        "alert": SevereWeatherAlert(
            id="imd-orange-heatwave",
            severity="warning",
            title="IMD Orange Alert: Severe Heatwave Conditions",
            description="Peak surface temperature reaching 44°C. Severe heat illness threat for vulnerable populations and outdoor laborers. Avoid exposure between 11:30 AM and 16:00 PM.",
            impact_level="high",
            affected_area="Western & North-Eastern Rajasthan",
            effective_from="11:00 IST",
            effective_to="17:00 IST",
            source="IMD Meteorological Centre, Jaipur",
        ),
        "marine": None,
    },
    "chennai_cyclone": {
        "city": "Chennai",
        "state": "Tamil Nadu",
        "lat": 13.0827,
        "lon": 80.2707,
        "temp": 26.5,
        "feels_like": 31.0,
        "humidity": 88,
        "wind_speed": 48.0,
        "wind_gust": 72.0,
        "rain_prob": 95,
        "rain_mm": 45.0,
        "condition": "Cyclonic Squalls & Thunderstorms",
        "wmo": 95,
        "aqi": 28,
        "aqi_cat": "Good",
        "pm2_5": 11.0,
        "pm10": 22.0,
        "visibility": 3.0,
        "alert": SevereWeatherAlert(
            id="imd-cyclone-chennai",
            severity="warning",
            title="IMD Cyclone Warning: Deep Depression Approaching Coast",
            description="Gale wind speeds 55-65 km/h gusting to 75 km/h. High sea swell and tidal surge of 1.0m. Localized inundation expected.",
            impact_level="severe",
            affected_area="North Tamil Nadu & South Andhra Coast",
            effective_from="Now",
            effective_to="Next 12 Hours",
            source="Cyclone Warning Centre, IMD Chennai",
        ),
        "marine": MarineData(
            is_coastal=True,
            wave_height_meters=4.8,
            tide_type="High Tide with Storm Surge",
            tide_height_meters=3.9,
            next_tide_time="16:10 IST",
            sea_surface_temp=29.5,
            sea_condition="Rough to Very Rough",
            fishermen_warning=True,
            coastal_advisory="Complete suspension of all fishing and beach recreational operations.",
        ),
    }
}

class MockWeatherProvider(BaseWeatherProvider):
    @property
    def name(self) -> str:
        return "VayuSync Indian Scenario Engine (Mock)"

    async def get_weather(
        self,
        lat: float,
        lon: float,
        city_name: Optional[str] = None,
        scenario: Optional[str] = None,
    ) -> WeatherResponse:
        # Match scenario or match by city
        key = scenario or "bengaluru_pleasant"
        if not scenario and city_name:
            c_low = city_name.lower()
            if "mumbai" in c_low:
                key = "mumbai_monsoon"
            elif "delhi" in c_low or "noida" in c_low or "gurugram" in c_low:
                key = "delhi_smog"
            elif "jaipur" in c_low or "rajasthan" in c_low or "ahmedabad" in c_low:
                key = "rajasthan_heatwave"
            elif "chennai" in c_low or "visakhapatnam" in c_low:
                key = "chennai_cyclone"
            else:
                key = "bengaluru_pleasant"

        sc = SCENARIOS.get(key, SCENARIOS["bengaluru_pleasant"])

        # Generate 24-hour realistic hourly
        hourly_list: List[HourlyForecast] = []
        base_temp = sc["temp"]
        for h in range(24):
            temp_variation = -3.0 if 2 <= h <= 6 else (4.0 if 12 <= h <= 15 else 0.0)
            rain_prob = sc["rain_prob"]
            if key == "mumbai_monsoon" and 15 <= h <= 19:
                rain_prob = 95
            elif key == "bengaluru_pleasant":
                rain_prob = 25 if 16 <= h <= 18 else 5

            hourly_list.append(
                HourlyForecast(
                    time=f"{h:02d}:00",
                    hour=h,
                    temperature=round(base_temp + temp_variation, 1),
                    feels_like=round(sc["feels_like"] + temp_variation, 1),
                    precipitation_probability=rain_prob,
                    precipitation=sc["rain_mm"] if rain_prob > 70 else 0.0,
                    humidity=sc["humidity"],
                    wind_speed=sc["wind_speed"],
                    uv_index=8.5 if (11 <= h <= 14 and sc["rain_prob"] < 50) else (1.5 if (8 <= h <= 16) else 0.0),
                    aqi=sc["aqi"],
                    condition_code=sc["wmo"],
                    condition_text=sc["condition"],
                    is_day=6 <= h <= 18,
                )
            )

        # 7-day daily
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        daily_list: List[DailyForecast] = []
        for i, d in enumerate(days):
            daily_list.append(
                DailyForecast(
                    date=f"2026-09-{7+i:02d}",
                    day_name=d,
                    temp_max=round(base_temp + 3.0, 1),
                    temp_min=round(base_temp - 4.0, 1),
                    precipitation_probability=sc["rain_prob"],
                    precipitation_sum=round(sc["rain_mm"] * 1.5, 1),
                    condition_code=sc["wmo"],
                    condition_text=sc["condition"],
                    uv_index_max=7.5,
                    sunrise="06:05",
                    sunset="18:32",
                )
            )

        alerts = [sc["alert"]] if sc["alert"] else []

        return WeatherResponse(
            location=Location(
                name=sc["city"],
                state=sc["state"],
                country="India",
                lat=sc["lat"],
                lon=sc["lon"],
            ),
            current=CurrentWeather(
                temperature=sc["temp"],
                feels_like=sc["feels_like"],
                humidity=sc["humidity"],
                wind_speed=sc["wind_speed"],
                wind_direction=230.0,
                wind_gust=sc["wind_gust"],
                precipitation=sc["rain_mm"],
                precipitation_probability=sc["rain_prob"],
                uv_index=4.5,
                aqi=sc["aqi"],
                aqi_category=sc["aqi_cat"],
                pm2_5=sc["pm2_5"],
                pm10=sc["pm10"],
                visibility=sc["visibility"],
                pressure=1008.5,
                condition_code=sc["wmo"],
                condition_text=sc["condition"],
                is_day=True,
                observation_time=datetime.now().isoformat(),
                sunrise="06:05",
                sunset="18:32",
            ),
            hourly=hourly_list,
            daily=daily_list,
            alerts=alerts,
            marine=sc["marine"],
            provider=f"VayuSync Scenarios ({key})",
            cached=False,
            simulated_scenario=key,
        )

    async def get_radar_layers(self, lat: float, lon: float) -> dict:
        return {
            "radar_available": True,
            "layer_type": "simulated_imd_doppler",
            "scenario": "active_radar_sweep",
        }
