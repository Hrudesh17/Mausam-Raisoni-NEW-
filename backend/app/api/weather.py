from typing import Optional, List
from fastapi import APIRouter, Query
from ..models.weather import WeatherResponse
from ..providers import get_weather_provider

router = APIRouter(prefix="/weather", tags=["Weather Data"])

INDIAN_CITIES = [
    {"name": "New Delhi", "state": "Delhi NCR", "lat": 28.6139, "lon": 77.2090, "default_persona": "commuter"},
    {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "default_persona": "commuter"},
    {"name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "default_persona": "runner"},
    {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "default_persona": "coastal"},
    {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "default_persona": "commuter"},
    {"name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567, "default_persona": "student"},
    {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "default_persona": "commuter"},
    {"name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "default_persona": "commuter"},
    {"name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "default_persona": "farmer"},
    {"name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "default_persona": "commuter"},
    {"name": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126, "default_persona": "student"},
    {"name": "Chandigarh", "state": "Punjab & Haryana", "lat": 30.7333, "lon": 76.7794, "default_persona": "runner"},
    {"name": "Shimla", "state": "Himachal Pradesh", "lat": 31.1048, "lon": 77.1734, "default_persona": "runner"},
    {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673, "default_persona": "coastal"},
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lon": 83.2185, "default_persona": "coastal"},
]

@router.get("", response_model=WeatherResponse)
async def get_weather(
    lat: float = Query(28.6139, description="Latitude"),
    lon: float = Query(77.2090, description="Longitude"),
    city: Optional[str] = Query(None, description="City name"),
    provider: Optional[str] = Query(None, description="Provider: open_meteo, mock, imd"),
    scenario: Optional[str] = Query(None, description="Scenario for demo: mumbai_monsoon, delhi_smog, etc."),
):
    """
    Fetches weather data using the active WeatherProvider abstraction.
    Supports real-time open live feeds and extreme Indian scenario simulations.
    """
    weather_provider = get_weather_provider(provider)
    return await weather_provider.get_weather(lat=lat, lon=lon, city_name=city, scenario=scenario)

@router.get("/cities")
async def get_indian_cities():
    """Returns a curated list of major Indian cities for fast switching."""
    return {"cities": INDIAN_CITIES}

@router.get("/reverse-geocode")
async def reverse_geocode(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """
    Resolves GPS coordinates to authentic Indian city and state names.
    Prevents placeholder strings and unifies the location propagation pipeline.
    """
    best_city = None
    min_dist = float("inf")
    for c in INDIAN_CITIES:
        dist = (c["lat"] - lat) ** 2 + (c["lon"] - lon) ** 2
        if dist < 0.25 and dist < min_dist:
            min_dist = dist
            best_city = c

    if best_city:
        return {
            "name": best_city["name"],
            "state": best_city["state"],
            "country": "India",
            "lat": lat,
            "lon": lon,
            "default_persona": best_city.get("default_persona", "commuter"),
        }

    try:
        import httpx
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.get(
                f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&zoom=10",
                headers={"User-Agent": "MausamVayuSync/1.0"},
            )
            if res.status_code == 200:
                data = res.json()
                addr = data.get("address", {})
                city = addr.get("city") or addr.get("town") or addr.get("district") or addr.get("county") or "Local Station"
                state = addr.get("state") or "India"
                country = addr.get("country") or "India"
                return {
                    "name": city,
                    "state": state,
                    "country": country,
                    "lat": lat,
                    "lon": lon,
                    "default_persona": "commuter",
                }
    except Exception:
        pass

    return {
        "name": f"Station ({lat:.2f}°, {lon:.2f}°)",
        "state": "GPS Telemetry",
        "country": "India",
        "lat": lat,
        "lon": lon,
        "default_persona": "commuter",
    }

@router.get("/radar")
async def get_radar_layers(
    lat: float = Query(28.6139),
    lon: float = Query(77.2090),
    provider: Optional[str] = None,
):
    """Returns available radar layer tiles and Doppler station coverage."""
    weather_provider = get_weather_provider(provider)
    return await weather_provider.get_radar_layers(lat=lat, lon=lon)
