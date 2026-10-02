import asyncio
from app.providers.mock import MockWeatherProvider
from app.models.user_context import UserContext, CalendarEvent
from app.intelligence.scoring import calculate_mausam_score
from app.intelligence.calendar import detect_calendar_conflicts
from app.intelligence.should_i import evaluate_should_i

def test_mock_provider_scenarios():
    async def run():
        provider = MockWeatherProvider()
        
        # Test Mumbai Monsoon scenario
        mumbai_weather = await provider.get_weather(19.07, 72.87, scenario="mumbai_monsoon")
        assert mumbai_weather.location.name == "Mumbai"
        assert mumbai_weather.current.precipitation_probability >= 80
        assert len(mumbai_weather.alerts) > 0
        assert mumbai_weather.marine is not None

        # Test Delhi Smog scenario
        delhi_weather = await provider.get_weather(28.61, 77.20, scenario="delhi_smog")
        assert delhi_weather.location.name == "New Delhi"
        assert delhi_weather.current.aqi > 300
        assert delhi_weather.current.aqi_category == "Severe"

    asyncio.run(run())

def test_mausam_scoring_algorithm():
    async def run():
        provider = MockWeatherProvider()
        mumbai_weather = await provider.get_weather(19.07, 72.87, scenario="mumbai_monsoon")
        
        # User with commute and rain sensitivity in Mumbai monsoon should have low score
        ctx = UserContext(
            interests=["commute", "running"],
            priorities=["rain", "heat"],
            preferred_transit="two_wheeler",
        )
        score = calculate_mausam_score(mumbai_weather, ctx)
        assert score.score < 50
        assert score.rating in ("Unfavorable", "Hazardous")

        # Bengaluru pleasant weather should yield high suitability
        blr_weather = await provider.get_weather(12.97, 77.59, scenario="bengaluru_pleasant")
        blr_score = calculate_mausam_score(blr_weather, ctx)
        assert blr_score.score >= 70

    asyncio.run(run())

def test_calendar_conflict_detection():
    async def run():
        provider = MockWeatherProvider()
        mumbai_weather = await provider.get_weather(19.07, 72.87, scenario="mumbai_monsoon")
        
        # User has an outdoor cricket event at 5 PM (17:00-19:00) during heavy rain
        ctx = UserContext(
            calendar_events=[
                CalendarEvent(id="ev-1", title="Outdoor Cricket Match", start_hour=17, end_hour=19, is_outdoor=True)
            ]
        )
        conflicts = detect_calendar_conflicts(mumbai_weather, ctx)
        assert len(conflicts) > 0
        assert conflicts[0].risk_type == "rain"
        assert "precipitation" in conflicts[0].conflict_summary.lower()

    asyncio.run(run())

def test_should_i_engine():
    async def run():
        provider = MockWeatherProvider()
        mumbai_weather = await provider.get_weather(19.07, 72.87, scenario="mumbai_monsoon")
        ctx = UserContext()

        res_umbrella = evaluate_should_i("Should I take an umbrella?", mumbai_weather, ctx)
        assert res_umbrella.verdict == "YES"

        res_car = evaluate_should_i("Should I wash my car today?", mumbai_weather, ctx)
        assert res_car.verdict == "NO"

        delhi_weather = await provider.get_weather(28.61, 77.20, scenario="delhi_smog")
        res_run = evaluate_should_i("Should I go for an outdoor run?", delhi_weather, ctx)
        assert res_run.verdict == "NO"

    asyncio.run(run())
