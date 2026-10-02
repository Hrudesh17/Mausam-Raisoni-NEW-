from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_and_root():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

    res_root = client.get("/")
    assert res_root.status_code == 200
    assert "Mausam" in res_root.json()["project"] or "VayuSync" in res_root.json()["project"]

def test_weather_endpoints():
    res_cities = client.get("/api/v1/weather/cities")
    assert res_cities.status_code == 200
    assert len(res_cities.json()["cities"]) > 5

    res_weather = client.get("/api/v1/weather?city=Mumbai&provider=mock&scenario=mumbai_monsoon")
    assert res_weather.status_code == 200
    data = res_weather.json()
    assert data["location"]["name"] == "Mumbai"
    assert data["current"]["temperature"] == 28.0
    assert len(data["hourly"]) == 24
    assert len(data["daily"]) == 7

def test_intelligence_summary_with_calendar():
    weather_res = client.get("/api/v1/weather?city=Mumbai&provider=mock&scenario=mumbai_monsoon")
    weather_data = weather_res.json()

    payload = {
        "weather": weather_data,
        "context": {
            "name": "Ameya",
            "is_personalized": True,
            "interests": ["commute", "running", "events"],
            "priorities": ["rain", "heat"],
            "preferred_transit": "two_wheeler",
            "calendar_events": [
                {
                    "id": "ev-1",
                    "title": "Outdoor Cricket Match",
                    "start_hour": 17,
                    "end_hour": 19,
                    "is_outdoor": True
                }
            ]
        }
    }
    res = client.post("/api/v1/intelligence/summary", json=payload)
    assert res.status_code == 200
    summary = res.json()
    assert summary["is_personalized"] is True
    assert summary["mausam_score"]["score"] < 50
    assert len(summary["calendar_conflicts"]) > 0
    assert "precipitation" in summary["calendar_conflicts"][0]["conflict_summary"].lower()

def test_should_i_endpoint():
    weather_res = client.get("/api/v1/weather?city=Mumbai&provider=mock&scenario=mumbai_monsoon")
    weather_data = weather_res.json()

    payload = {
        "query": "Should I carry an umbrella today?",
        "weather": weather_data,
        "context": {"interests": ["commute"]}
    }
    res = client.post("/api/v1/intelligence/should-i", json=payload)
    assert res.status_code == 200
    ans = res.json()
    assert ans["verdict"] == "YES"
    assert "umbrella" in ans["headline"].lower()
