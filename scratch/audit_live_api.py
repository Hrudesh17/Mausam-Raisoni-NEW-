import httpx
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

cities = [
    {"name": "Pune", "lat": 18.5204, "lon": 73.8567},
    {"name": "Delhi", "lat": 28.6139, "lon": 77.2090},
    {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777},
    {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
]

print("=== AUDITING LIVE OPEN-METEO API DIRECTLY ===")
for c in cities:
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={c['lat']}&longitude={c['lon']}"
        f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,uv_index"
        f"&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index,visibility"
        f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,uv_index_max,sunrise,sunset,daylight_duration"
        f"&timezone=auto"
    )
    try:
        r = httpx.get(url, timeout=10.0)
        data = r.json()
        curr = data.get("current", {})
        daily = data.get("daily", {})
        print(f"\nCity: {c['name']} (lat={c['lat']}, lon={c['lon']})")
        print(f"  API Status: {r.status_code}")
        print(f"  API Coords: lat={data.get('latitude')}, lon={data.get('longitude')}")
        print(f"  Timezone: {data.get('timezone')} ({data.get('timezone_abbreviation')})")
        print(f"  Elevation: {data.get('elevation')} m")
        print(f"  Current Time (API): {curr.get('time')}")
        print(f"  Temperature: {curr.get('temperature_2m')} °C")
        print(f"  Feels Like: {curr.get('apparent_temperature')} °C")
        print(f"  Humidity: {curr.get('relative_humidity_2m')} %")
        print(f"  Wind Speed: {curr.get('wind_speed_10m')} km/h")
        print(f"  Surface Pressure: {curr.get('surface_pressure')} hPa")
        print(f"  Visibility: {curr.get('visibility')} m ({round(float(curr.get('visibility', 0))/1000, 1)} km)")
        print(f"  UV Index: {curr.get('uv_index')}")
        print(f"  Weather Code: {curr.get('weather_code')}")
        print(f"  Sunrise: {daily.get('sunrise', [''])[0]}")
        print(f"  Sunset: {daily.get('sunset', [''])[0]}")
        print(f"  Daylight Duration: {daily.get('daylight_duration', [''])[0]} s")
    except Exception as e:
        print(f"Error fetching {c['name']}: {e}")
