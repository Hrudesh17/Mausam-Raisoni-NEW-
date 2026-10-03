import httpx, asyncio

async def test():
    client = httpx.AsyncClient(timeout=10)
    for city in ["Thiruvananthapuram", "Lucknow", "Pune"]:
        payload = {
            "message": "Should I carry an umbrella today?",
            "dashboard_location": city,
            "conversation_location": city,
            "session_id": "test-fix",
            "persona": ["health"],
            "input_mode": "text",
            "language": "en"
        }
        r = await client.post("http://127.0.0.1:8000/api/v1/assistant/chat", json=payload, headers={"Origin": "http://localhost:3000"})
        d = r.json()
        loc = d.get("location", {})
        reply = d.get("reply", "")
        print(f"CITY={city} HTTP={r.status_code} intent={d.get('intent')}")
        print(f"  Location: {loc.get('name', 'UNKNOWN')}")
        print(f"  Reply: {reply[:120]}")
        print()
    await client.aclose()

asyncio.run(test())
