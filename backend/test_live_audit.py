import asyncio
import sys
from app.providers.open_meteo import OpenMeteoProvider
from app.api.weather import INDIAN_CITIES

async def audit_locations():
    provider = OpenMeteoProvider()
    test_cities = [
        {"name": "Pune", "lat": 18.5204, "lon": 73.8567, "expected_state": "Maharashtra"},
        {"name": "New Delhi", "lat": 28.6139, "lon": 77.2090, "expected_state": "Delhi NCR"},
        {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777, "expected_state": "Maharashtra"},
        {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946, "expected_state": "Karnataka"},
    ]

    print(f"Executing Live Open-Meteo Audit for {len(test_cities)} Indian metropolitan locations...\n")
    results = []
    all_ok = True

    for tc in test_cities:
        city = tc["name"]
        lat = tc["lat"]
        lon = tc["lon"]
        expected_state = tc["expected_state"]

        try:
            res = await provider.get_weather(lat=lat, lon=lon, city_name=city)
            loc = res.location
            curr = res.current
            
            # Checks
            coords_match = abs(loc.lat - lat) < 0.1 and abs(loc.lon - lon) < 0.1
            state_match = loc.state == expected_state
            tz_match = loc.timezone == "Asia/Kolkata" and loc.timezone_abbreviation == "IST"
            has_live_obs = bool(curr.observation_time)
            valid_temp = -10.0 <= curr.temperature <= 55.0
            valid_humidity = 0 <= curr.humidity <= 100
            
            passed = coords_match and state_match and tz_match and has_live_obs and valid_temp and valid_humidity
            if not passed:
                all_ok = False

            print(f"=== {city} ===")
            print(f"  Selected: {city} ({lat}° N, {lon}° E)")
            print(f"  API Location: {loc.name}, State: '{loc.state}', Country: {loc.country}")
            print(f"  API Coordinates: ({loc.lat:.4f}° N, {loc.lon:.4f}° E) [Coords Match: {coords_match}]")
            print(f"  Timezone: {loc.timezone} ({loc.timezone_abbreviation}) [TZ Match: {tz_match}]")
            print(f"  Obs Time: {curr.observation_time}")
            print(f"  Temp: {curr.temperature}°C (Feels like: {curr.feels_like}°C)")
            print(f"  Humidity: {curr.humidity}%, Wind: {curr.wind_speed} km/h, Pressure: {curr.pressure} hPa")
            print(f"  Visibility: {curr.visibility} km ({curr.visibility_category})")
            print(f"  UV Index: {curr.uv_index}, Rain Prob: {curr.precipitation_probability}%")
            print(f"  Sunrise: {curr.sunrise}, Sunset: {curr.sunset}, Daylight: {curr.daylight_duration}")
            print(f"  AQI: {curr.aqi} ({curr.aqi_category}), PM2.5: {curr.pm2_5} µg/m³")
            print(f"  Status: {'[PASS]' if passed else '[FAIL]'}\n")

            results.append({
                "city": city,
                "lat": loc.lat,
                "lon": loc.lon,
                "state": loc.state,
                "temp": curr.temperature,
                "feels_like": curr.feels_like,
                "humidity": curr.humidity,
                "wind": curr.wind_speed,
                "pressure": curr.pressure,
                "visibility": curr.visibility,
                "uv": curr.uv_index,
                "rain_prob": curr.precipitation_probability,
                "sunrise": curr.sunrise,
                "sunset": curr.sunset,
                "obs_time": curr.observation_time,
                "passed": passed
            })
        except Exception as e:
            all_ok = False
            print(f"=== {city} FAILED ===")
            print(f"  Error: {e}\n")

    print(f"AUDIT SUMMARY: {'ALL 4 LOCATIONS VERIFIED & PASSING' if all_ok else 'AUDIT ENCOUNTERED FAILURES'}")
    return all_ok

if __name__ == "__main__":
    success = asyncio.run(audit_locations())
    sys.exit(0 if success else 1)
