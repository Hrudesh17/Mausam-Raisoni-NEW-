import asyncio
import sys
import os
import time
import subprocess
import httpx

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

async def main():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    venv_py = os.path.join(root, ".venv", "Scripts", "python.exe")
    if not os.path.exists(venv_py):
        venv_py = sys.executable

    print("Starting Uvicorn backend server on port 8005...")
    proc = subprocess.Popen(
        [venv_py, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8005"],
        cwd=root,
    )

    try:
        # Wait up to 10s for server to start
        async with httpx.AsyncClient(timeout=5.0) as client:
            healthy = False
            for _ in range(20):
                try:
                    res = await client.get("http://127.0.0.1:8005/health")
                    if res.status_code == 200:
                        healthy = True
                        print("[OK] Health endpoint returned:", res.json())
                        break
                except Exception:
                    pass
                time.sleep(0.5)

            if not healthy:
                print("[FAIL] Health endpoint failed to respond!")
                sys.exit(1)

            # Test Assistant Endpoint
            payload = {
                "message": "temperature in Hyderabad",
                "weather": {
                    "location": {"name": "Pune", "state": "Maharashtra", "country": "India", "lat": 18.5204, "lon": 73.8567},
                    "current": {
                        "temperature": 27.8, "feels_like": 29.8, "humidity": 68, "wind_speed": 14.0, "wind_direction": 240,
                        "wind_gust": 22.0, "precipitation": 0.0, "precipitation_probability": 25, "uv_index": 6, "aqi": 68,
                        "aqi_category": "Satisfactory", "pm2_5": 22.4, "pm10": 48.0, "visibility": 8.5, "pressure": 1012,
                        "condition_code": 2, "condition_text": "Partly Cloudy", "is_day": True, "observation_time": "03:30 PM IST",
                        "sunrise": "06:12", "sunset": "18:48"
                    },
                    "hourly": [],
                    "daily": [],
                    "alerts": [],
                    "provider": "Open-Meteo"
                },
                "context": {"name": "Bhavesh", "interests": ["commute"]},
                "intelligence": {
                    "is_personalized": True,
                    "mausam_score": {"score": 82, "rating": "Ideal", "headline": "Good", "subtext": "Good", "primary_risk": None, "breakdown": {"temperature_score": 90, "precipitation_penalty": 0, "aqi_penalty": 5, "uv_penalty": 3, "wind_penalty": 0}},
                    "top_recommendations": ["Stay hydrated"],
                    "critical_alerts": [],
                    "activities": [],
                    "routine_impacts": [],
                    "calendar_conflicts": []
                }
            }

            chat_res = await client.post("http://127.0.0.1:8005/api/v1/assistant/chat", json=payload)
            if chat_res.status_code == 200:
                data = chat_res.json()
                print("[OK] Assistant endpoint responded successfully!")
                print("  Location:", data.get("location"))
                print("  Intent:", data.get("intent"))
                print("  Reply:", data.get("reply", "").encode("ascii", "ignore").decode("ascii")[:100], "...")
            else:
                print(f"[FAIL] Assistant endpoint returned status {chat_res.status_code}: {chat_res.text}")
                sys.exit(1)

    finally:
        proc.terminate()
        proc.wait()
        print("Server shutdown cleanly.")

if __name__ == "__main__":
    asyncio.run(main())
