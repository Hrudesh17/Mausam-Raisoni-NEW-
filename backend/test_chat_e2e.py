import httpx, asyncio

async def test():
    client = httpx.AsyncClient(timeout=15)
    payload = {
        "message": "",
        "dashboard_location": "Pune",
        "conversation_location": None,
        "session_id": "test-001",
        "persona": ["health"],
        "input_mode": "text",
        "language": "en",
        "weather": None,
        "context": {"name": "Demo", "interests": ["health"], "priorities": ["aqi"]},
        "intelligence": None
    }
    
    queries = [
        "Check Air Quality Index",
        "Should I carry an umbrella?",
        "What is the weather in Pune?",
    ]
    
    for msg in queries:
        payload["message"] = msg
        r = await client.post(
            "http://127.0.0.1:8000/api/v1/assistant/chat",
            json=payload,
            headers={"Origin": "http://localhost:3000"}
        )
        data = r.json()
        print("=== Query:", msg[:50], "===")
        print("  HTTP:", r.status_code, " success:", data.get("success"), " intent:", data.get("intent"))
        reply = data.get("reply", "")
        print("  Reply:", reply[:150])
        acao = r.headers.get("access-control-allow-origin", "MISSING")
        print("  CORS Access-Control-Allow-Origin:", acao)
        print()
    
    await client.aclose()

asyncio.run(test())
