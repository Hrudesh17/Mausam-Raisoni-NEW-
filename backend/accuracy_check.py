import asyncio
import httpx
from app.services.crop_service import crop_service

CITIES = [
    ("Pune", 18.5204, 73.8567),
    ("Mumbai", 19.0760, 72.8777),
    ("Delhi", 28.6139, 77.2090),
    ("Lucknow", 26.8467, 80.9462),
    ("Jaipur", 26.9124, 75.7873),
    ("Chennai", 13.0827, 80.2707),
    ("Visakhapatnam", 17.6868, 83.2185),
]

async def check():
    print("| City           | Temp (API vs App)   | Humidity (API vs App)   | Rainfall (API vs App)   | Diff (T/H/R) | Status |")
    print("|----------------|---------------------|-------------------------|-------------------------|--------------|--------|")
    for name, lat, lon in CITIES:
        # Raw API
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum&past_days=23&forecast_days=7&timezone=auto"
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(url)
            d = res.json().get("daily", {})
        
        raw_temps = [t for t in d.get("temperature_2m_mean", []) if t is not None]
        raw_hums = [h for h in d.get("relative_humidity_2m_mean", []) if h is not None]
        raw_precips = [p for p in d.get("precipitation_sum", []) if p is not None]

        t_raw = round(sum(raw_temps) / len(raw_temps), 1)
        h_raw = round(sum(raw_hums) / len(raw_hums), 1)
        r_raw = round(sum(raw_precips), 1)

        # App Service
        crop_service._climate_cache.clear()
        app_res = await crop_service.fetch_climate_telemetry(lat, lon, name)

        diff_t = round(abs(t_raw - app_res.temperature), 1)
        diff_h = round(abs(h_raw - app_res.humidity), 1)
        diff_r = round(abs(r_raw - app_res.rainfall), 1)
        
        t_str = f"{t_raw:.1f}°C vs {app_res.temperature:.1f}°C"
        h_str = f"{h_raw:.1f}% vs {app_res.humidity:.1f}%"
        r_str = f"{r_raw:.1f}mm vs {app_res.rainfall:.1f}mm"
        d_str = f"{diff_t:.1f}/{diff_h:.1f}/{diff_r:.1f}"
        status = "EXACT MATCH (0.0 diff)" if (diff_t == 0.0 and diff_h == 0.0 and diff_r == 0.0) else "DIFF"

        print(f"| {name:14} | {t_str:19} | {h_str:23} | {r_str:23} | {d_str:12} | {status:6} |")

if __name__ == "__main__":
    asyncio.run(check())
