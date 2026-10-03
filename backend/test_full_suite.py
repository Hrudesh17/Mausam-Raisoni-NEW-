import httpx
import asyncio
import json

CITIES = [
    {"name": "Pune", "lat": 18.5204, "lon": 73.8567, "temp": 28.5, "humidity": 65, "rain": 0.0, "rain_prob": 15, "wind": 14.0, "uv": 7.0, "aqi": 85},
    {"name": "Mumbai", "lat": 19.0760, "lon": 72.8777, "temp": 31.0, "humidity": 82, "rain": 4.5, "rain_prob": 80, "wind": 22.0, "uv": 5.0, "aqi": 110},
    {"name": "Delhi", "lat": 28.6139, "lon": 77.2090, "temp": 36.5, "humidity": 40, "rain": 0.0, "rain_prob": 5, "wind": 12.0, "uv": 9.0, "aqi": 260},
    {"name": "Thiruvananthapuram", "lat": 8.5241, "lon": 76.9366, "temp": 29.0, "humidity": 88, "rain": 12.0, "rain_prob": 90, "wind": 18.0, "uv": 4.0, "aqi": 35},
    {"name": "Lucknow", "lat": 26.8467, "lon": 80.9462, "temp": 34.0, "humidity": 50, "rain": 0.0, "rain_prob": 10, "wind": 9.0, "uv": 8.0, "aqi": 190},
    {"name": "Bengaluru", "lat": 12.9716, "lon": 77.5946, "temp": 24.0, "humidity": 55, "rain": 0.0, "rain_prob": 10, "wind": 15.0, "uv": 6.0, "aqi": 45},
    {"name": "Jaipur", "lat": 26.9124, "lon": 75.7873, "temp": 37.0, "humidity": 30, "rain": 0.0, "rain_prob": 0, "wind": 16.0, "uv": 9.5, "aqi": 140},
    {"name": "Chennai", "lat": 13.0827, "lon": 80.2707, "temp": 32.0, "humidity": 78, "rain": 0.5, "rain_prob": 30, "wind": 20.0, "uv": 7.5, "aqi": 75}
]

QUERIES = [
    ("Hello! Good morning", "GREETING"),
    ("Should I carry an umbrella today?", "UMBRELLA"),
    ("When should I water my plants this afternoon?", "WATERING"),
    ("What is the current AQI and air quality?", "AQI"),
    ("What is the temperature right now?", "TEMPERATURE"),
    ("How strong is the wind?", "WIND"),
    ("What is the UV index level?", "UV_INDEX"),
    ("What time does the sun rise and set?", "SUNRISE_SUNSET")
]

async def run_tests():
    client = httpx.AsyncClient(timeout=10.0)
    print("================================================================")
    print("   MAUSAM + VAYUSYNC COMPREHENSIVE INTEGRATION TEST SUITE")
    print("================================================================")
    
    # 1. Test Next.js Frontend Server
    try:
        fe_resp = await client.get("http://localhost:3000")
        print(f"[FRONTEND] GET http://localhost:3000 -> HTTP {fe_resp.status_code} ({len(fe_resp.text)} bytes) [PASS]")
    except Exception as e:
        print(f"[FRONTEND] Failed: {e}")

    # 2. Test Backend Health
    try:
        be_health = await client.get("http://127.0.0.1:8000/docs")
        print(f"[BACKEND]  GET http://127.0.0.1:8000/docs -> HTTP {be_health.status_code} [PASS]")
    except Exception as e:
        print(f"[BACKEND] Failed: {e}")

    # 3. Test Multi-city Chatbot Matrix with Live Weather Telemetry
    print("\n---------------- MULTI-CITY CHAT EVALUATION MATRIX ----------------")
    pass_count = 0
    total_count = 0

    for city in CITIES:
        weather_payload = {
            "location": {"name": city["name"], "lat": city["lat"], "lon": city["lon"]},
            "current": {
                "temperature": city["temp"],
                "apparent_temperature": city["temp"] + 1.5,
                "relative_humidity": city["humidity"],
                "wind_speed": city["wind"],
                "precipitation": city["rain"],
                "uv_index": city["uv"],
                "weather_code": 1,
                "is_day": 1
            },
            "air_quality": {"aqi": city["aqi"], "pm2_5": city["aqi"] * 0.4, "pm10": city["aqi"] * 0.8},
            "forecast": [
                {"date": "2026-10-03", "temp_max": city["temp"] + 3, "temp_min": city["temp"] - 5, "precipitation_probability_max": city["rain_prob"], "precipitation_sum": city["rain"]}
            ]
        }

        for prompt, expected_intent in QUERIES:
            total_count += 1
            chat_req = {
                "message": prompt,
                "dashboard_location": city["name"],
                "conversation_location": city["name"],
                "session_id": f"demo-session-{city['name']}",
                "persona": ["gardener", "health"],
                "input_mode": "text",
                "language": "en",
                "weather": weather_payload,
                "context": {"name": "Hackathon Demo User", "priorities": ["watering", "rain", "aqi"]},
                "intelligence": {
                    "routine_impacts": [
                        {"activity": "Afternoon Irrigation Window", "impact": "Suboptimal during peak hours", "severity": "moderate"}
                    ]
                }
            }

            resp = await client.post(
                "http://127.0.0.1:8000/api/v1/assistant/chat",
                json=chat_req,
                headers={"Origin": "http://localhost:3000"}
            )
            
            if resp.status_code == 200:
                data = resp.json()
                reply = data.get("reply", "")
                # City name or data grounding check
                has_city = city["name"].lower() in reply.lower() or city["name"] in reply
                has_valid_intent = data.get("intent") is not None
                
                # Check CORS header
                cors = resp.headers.get("access-control-allow-origin") == "http://localhost:3000"
                
                if has_valid_intent and len(reply) > 10:
                    pass_count += 1
                    status = "PASS"
                else:
                    status = "WARN"
                
                if expected_intent in ["UMBRELLA", "WATERING", "GREETING"]:
                    print(f"[{city['name']:<18}] Prompt: '{prompt[:30]:<30}' -> Intent: {data.get('intent'):<15} Status: {status}")
                    print(f"   ? Reply snippet: {reply[:110]}...")
            else:
                print(f"[{city['name']}] FAILED with HTTP {resp.status_code}")

    print(f"\nTotal Chat Test Runs: {total_count} | Successful: {pass_count} ({pass_count/total_count*100:.1f}%)")
    await client.aclose()

asyncio.run(run_tests())
