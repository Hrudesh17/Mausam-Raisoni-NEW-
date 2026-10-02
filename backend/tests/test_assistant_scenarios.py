import asyncio
import sys
import os

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.models.weather import WeatherResponse, Location, CurrentWeather, HourlyForecast, DailyForecast
from app.models.user_context import UserContext
from app.models.intelligence import IntelligenceSummary, MausamScore
from app.ai.assistant import AIAssistantService
from app.services.weather_service import WeatherService, WeatherServiceError

def create_mock_pune_weather() -> WeatherResponse:
    """Mock weather object representing Pune dashboard location."""
    hourly = [
        HourlyForecast(time=f"{h:02d}:00", hour=h, temperature=27.5, feels_like=29.0, precipitation_probability=15, precipitation=0.0, humidity=65, wind_speed=12.0, uv_index=5, aqi=60, condition_code=1, condition_text="Mainly Clear", is_day=True)
        for h in range(24)
    ]
    daily = [
        DailyForecast(date="2026-09-16", day_name="Today", temp_max=31.0, temp_min=22.0, precipitation_probability=20, precipitation_sum=0.0, condition_code=1, condition_text="Partly Cloudy", uv_index_max=7, sunrise="06:12", sunset="18:48"),
        DailyForecast(date="2026-09-17", day_name="Tomorrow", temp_max=32.5, temp_min=23.0, precipitation_probability=45, precipitation_sum=2.5, condition_code=61, condition_text="Slight Rain", uv_index_max=6, sunrise="06:12", sunset="18:47"),
    ]
    return WeatherResponse(
        location=Location(name="Pune", state="Maharashtra", country="India", lat=18.5204, lon=73.8567),
        current=CurrentWeather(
            temperature=27.8,
            feels_like=29.8,
            humidity=68,
            wind_speed=14.0,
            wind_direction=240,
            wind_gust=22.0,
            precipitation=0.0,
            precipitation_probability=25,
            uv_index=6,
            aqi=68,
            aqi_category="Satisfactory",
            pm2_5=22.4,
            pm10=48.0,
            visibility=8.5,
            pressure=1012,
            condition_code=2,
            condition_text="Partly Cloudy",
            is_day=True,
            observation_time="03:30 PM IST",
            sunrise="06:12",
            sunset="18:48",
        ),
        hourly=hourly,
        daily=daily,
        alerts=[],
        provider="Open-Meteo",
    )

def create_mock_context() -> UserContext:
    return UserContext(name="Bhavesh", interests=["commute", "running"], preferred_transit="two_wheeler")

def create_mock_intelligence() -> IntelligenceSummary:
    from app.models.intelligence import MausamScoreBreakdown
    breakdown = MausamScoreBreakdown(
        temperature_score=90,
        precipitation_penalty=0,
        aqi_penalty=5,
        uv_penalty=3,
        wind_penalty=0
    )
    return IntelligenceSummary(
        is_personalized=True,
        mausam_score=MausamScore(score=82, rating="Ideal", headline="Good conditions", subtext="Calculated for your routine", primary_risk=None, breakdown=breakdown),
        top_recommendations=["Stay hydrated"],
        critical_alerts=[],
        activities=[],
        routine_impacts=[],
        calendar_conflicts=[],
    )

async def run_tests():
    pune_weather = create_mock_pune_weather()
    context = create_mock_context()
    intelligence = create_mock_intelligence()

    print("=" * 70)
    print("RUNNING VAYUSYNC SAHAYAK COMPLETE 15-SCENARIO SUITE")
    print("=" * 70)

    # ── TEST 1: Dashboard = Pune, Query = "weather in Delhi"
    print("\n[TEST 1] Dashboard = Pune, Query = 'weather in Delhi'")
    res1 = await AIAssistantService.answer_query("weather in Delhi", pune_weather, context, intelligence, dashboard_location="Pune")
    loc_name = res1["location"]["name"] if isinstance(res1["location"], dict) else res1["location"]
    assert "Delhi" in loc_name, f"Expected Delhi, got {loc_name}"
    assert "Delhi" in res1["reply"], f"Expected Delhi in reply: {res1['reply']}"
    print(f"[PASS] Resolved location: {loc_name}")

    # ── TEST 2: Dashboard = Pune, Query = "temperature in Hyderabad"
    print("\n[TEST 2] Dashboard = Pune, Query = 'temperature in Hyderabad'")
    res2 = await AIAssistantService.answer_query("temperature in Hyderabad", pune_weather, context, intelligence, dashboard_location="Pune")
    loc_name = res2["location"]["name"] if isinstance(res2["location"], dict) else res2["location"]
    assert "Hyderabad" in loc_name, f"Expected Hyderabad, got {loc_name}"
    print(f"[PASS] Resolved location: {loc_name}")

    # ── TEST 3: Query = "weather in Delhi", Then: "will it rain?"
    print("\n[TEST 3] Follow-up: 'weather in Delhi' -> 'will it rain?'")
    res3a = await AIAssistantService.answer_query("weather in Delhi", pune_weather, context, intelligence)
    conv_loc = res3a["conversation_location"]
    res3b = await AIAssistantService.answer_query("will it rain?", pune_weather, context, intelligence, conversation_location=conv_loc)
    loc_name = res3b["location"]["name"] if isinstance(res3b["location"], dict) else res3b["location"]
    assert "Delhi" in loc_name, f"Expected Delhi, got {loc_name}"
    assert res3b["intent"] in ["RAIN", "UMBRELLA", "PRECIPITATION"], f"Expected rain intent, got {res3b['intent']}"
    print(f"[PASS] Follow-up location: {loc_name}, Intent: {res3b['intent']}")

    # ── TEST 4: Query = "weather in Delhi", Then: "what about tomorrow?"
    print("\n[TEST 4] Time follow-up: 'weather in Delhi' -> 'what about tomorrow?'")
    res4a = await AIAssistantService.answer_query("weather in Delhi", pune_weather, context, intelligence)
    conv_loc = res4a["conversation_location"]
    res4b = await AIAssistantService.answer_query("what about tomorrow?", pune_weather, context, intelligence, conversation_location=conv_loc)
    loc_name = res4b["location"]["name"] if isinstance(res4b["location"], dict) else res4b["location"]
    assert "Delhi" in loc_name, f"Expected Delhi, got {loc_name}"
    assert "Tomorrow" in res4b["requested_time"], f"Expected Tomorrow, got {res4b['requested_time']}"
    print(f"[PASS] Location: {loc_name}, Time: {res4b['requested_time']}")

    # ── TEST 5: Query = "weather in Delhi", Then: "how strong is the wind?"
    print("\n[TEST 5] Parameter follow-up: 'weather in Delhi' -> 'how strong is the wind?'")
    res5a = await AIAssistantService.answer_query("weather in Delhi", pune_weather, context, intelligence)
    conv_loc = res5a["conversation_location"]
    res5b = await AIAssistantService.answer_query("how strong is the wind?", pune_weather, context, intelligence, conversation_location=conv_loc)
    assert res5b["intent"] == "WIND", f"Expected WIND intent, got {res5b['intent']}"
    print(f"[PASS] Intent: {res5b['intent']}, Response: {res5b['reply']}")

    # ── TEST 6: Query = "temperature in Mumbai", Then: "what is the temperature?"
    print("\n[TEST 6] Memory retention: 'temperature in Mumbai' -> 'what is the temperature?'")
    res6a = await AIAssistantService.answer_query("temperature in Mumbai", pune_weather, context, intelligence)
    conv_loc = res6a["conversation_location"]
    res6b = await AIAssistantService.answer_query("what is the temperature?", pune_weather, context, intelligence, conversation_location=conv_loc)
    loc_name = res6b["location"]["name"] if isinstance(res6b["location"], dict) else res6b["location"]
    assert "Mumbai" in loc_name, f"Expected Mumbai, got {loc_name}"
    print(f"[PASS] Location maintained: {loc_name}")

    # ── TEST 7: Query = "weather in Delhi" -> "weather in Pune" -> "will it rain?"
    print("\n[TEST 7] Sequential switch: Delhi -> Pune -> 'will it rain?'")
    res7a = await AIAssistantService.answer_query("weather in Delhi", pune_weather, context, intelligence)
    res7b = await AIAssistantService.answer_query("weather in Pune", pune_weather, context, intelligence, conversation_location=res7a["conversation_location"])
    res7c = await AIAssistantService.answer_query("will it rain?", pune_weather, context, intelligence, conversation_location=res7b["conversation_location"])
    loc_name = res7c["location"]["name"] if isinstance(res7c["location"], dict) else res7c["location"]
    assert "Pune" in loc_name, f"Expected Pune, got {loc_name}"
    print(f"[PASS] Location correctly switched to: {loc_name}")

    # ── TEST 8: Query = "hourly temperature in Hyderabad"
    print("\n[TEST 8] Hourly query: 'hourly temperature in Hyderabad'")
    res8 = await AIAssistantService.answer_query("hourly temperature in Hyderabad", pune_weather, context, intelligence)
    assert res8["intent"] == "HOURLY_FORECAST", f"Expected HOURLY_FORECAST, got {res8['intent']}"
    print(f"[PASS] Intent: {res8['intent']}")

    # ── TEST 9: Query = "UV tomorrow afternoon in Pune"
    print("\n[TEST 9] Complex query: 'UV tomorrow afternoon in Pune'")
    res9 = await AIAssistantService.answer_query("UV tomorrow afternoon in Pune", pune_weather, context, intelligence)
    assert res9["intent"] == "UV", f"Expected UV intent, got {res9['intent']}"
    print(f"[PASS] Intent: {res9['intent']}")

    # ── TEST 10: Forced API failure error handling
    print("\n[TEST 10] Forced API Failure Error Handling")
    res10 = await AIAssistantService.answer_query("weather in InvalidCity999", pune_weather, context, intelligence, dashboard_location="Pune")
    assert res10["success"] is False, "Expected success=False for unresolvable location"
    assert "identify" in res10["reply"].lower() or "did you mean" in res10["reply"].lower(), f"Expected unresolvable prompt, got {res10['reply']}"
    print(f"[PASS] Correct unresolvable response: {res10['reply']}")

    # ── TEST 11: Misspelled location "temperature in heydrabad"
    print("\n[TEST 11] Misspelled location: 'temperature in heydrabad'")
    res11 = await AIAssistantService.answer_query("temperature in heydrabad", pune_weather, context, intelligence)
    loc_name = res11["location"]["name"] if isinstance(res11["location"], dict) else res11["location"]
    assert "Hyderabad" in loc_name, f"Expected Hyderabad alias resolution, got {loc_name}"
    print(f"[PASS] Typo 'heydrabad' resolved to: {loc_name}")

    # ── TEST 12: Voice input simulation
    print("\n[TEST 12] Voice input simulation: input_mode='voice'")
    res12 = await AIAssistantService.answer_query("What is the temperature in Delhi?", pune_weather, context, intelligence, input_mode="voice")
    assert res12["input_mode"] == "voice", f"Expected voice input_mode, got {res12['input_mode']}"
    print(f"[PASS] Input mode confirmed: {res12['input_mode']}")

    # ── TEST 13: Voice follow-up conversation
    print("\n[TEST 13] Voice follow-up: 'What is the weather in Hyderabad?' -> 'Will it rain tomorrow?'")
    res13a = await AIAssistantService.answer_query("What is the weather in Hyderabad?", pune_weather, context, intelligence, input_mode="voice")
    conv_loc13 = res13a["conversation_location"]
    res13b = await AIAssistantService.answer_query("Will it rain tomorrow?", pune_weather, context, intelligence, conversation_location=conv_loc13, input_mode="voice")
    loc_name = res13b["location"]["name"] if isinstance(res13b["location"], dict) else res13b["location"]
    assert "Hyderabad" in loc_name, f"Expected Hyderabad, got {loc_name}"
    print(f"[PASS] Voice follow-up maintained location: {loc_name}")

    # ── TEST 14: Unresolvable location prompt
    print("\n[TEST 14] Unresolvable city prompt")
    res14 = await AIAssistantService.answer_query("weather in AtlantisCity", pune_weather, context, intelligence)
    assert res14["confidence"] == 0.0, f"Expected 0.0 confidence, got {res14['confidence']}"
    print(f"[PASS] Handled unresolvable city cleanly: {res14['reply']}")

    # ── TEST 15: Weather comparison "compare Pune and Mumbai weather"
    print("\n[TEST 15] Weather comparison: 'compare Pune and Mumbai weather'")
    res15 = await AIAssistantService.answer_query("compare Pune and Mumbai weather", pune_weather, context, intelligence)
    assert res15["intent"] == "WEATHER_COMPARISON", f"Expected WEATHER_COMPARISON, got {res15['intent']}"
    print(f"[PASS] Comparison intent: {res15['intent']}")

    print("\n" + "=" * 70)
    print("ALL 15 TEST SCENARIOS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_tests())
