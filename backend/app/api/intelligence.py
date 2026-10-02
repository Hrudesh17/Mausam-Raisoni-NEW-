from pydantic import BaseModel
from fastapi import APIRouter
from ..models.weather import WeatherResponse
from ..models.user_context import UserContext
from ..models.intelligence import IntelligenceSummary, ShouldIResponse
from ..intelligence.scoring import (
    calculate_mausam_score,
    calculate_activities,
    calculate_krishi_intelligence,
    calculate_health_intelligence,
    calculate_event_planning_intelligence,
    calculate_allergy_outlook,
    calculate_visibility_intelligence,
)
from ..intelligence.timeline import analyze_routine_impacts
from ..intelligence.calendar import detect_calendar_conflicts
from ..intelligence.should_i import evaluate_should_i

router = APIRouter(prefix="/intelligence", tags=["VayuSync Intelligence"])

class SummaryRequest(BaseModel):
    weather: WeatherResponse
    context: UserContext

class ShouldIRequest(BaseModel):
    query: str
    weather: WeatherResponse
    context: UserContext

@router.post("/summary", response_model=IntelligenceSummary)
async def get_intelligence_summary(req: SummaryRequest):
    """
    Computes complete personalized intelligence:
    - VayuSync Mausam Score (0-100) based on user's active interests
    - Activity Suitability Index
    - Schedule and Calendar Conflict Detection
    - Routine vs Forecast Schedule Impacts
    - Commute, Krishi, Health, Event Planning, Allergy, and Visibility advisories
    """
    w = req.weather
    c = req.context

    score = calculate_mausam_score(w, c)
    activities = calculate_activities(w, c)
    routine_impacts = analyze_routine_impacts(w, c)
    calendar_conflicts = detect_calendar_conflicts(w, c)
    krishi = calculate_krishi_intelligence(w)
    health = calculate_health_intelligence(w, c)
    event_planning = calculate_event_planning_intelligence(w)
    allergy = calculate_allergy_outlook(w, c)
    visibility_intel = calculate_visibility_intelligence(w, c)

    # Top personalized recommendations
    top_recs = []
    if calendar_conflicts:
        top_recs.append(f"Calendar Alert: {calendar_conflicts[0].conflict_summary}")
    if score.score < 50:
        top_recs.append("Caution: Current weather conditions will create friction with your scheduled activities.")
    if w.current.precipitation_probability > 50:
        top_recs.append(f"Precipitation alert ({w.current.precipitation_probability}%). Carry rain gear and plan for transit delays.")
    if w.current.aqi > 200:
        top_recs.append(f"High particulate smog (AQI {w.current.aqi}). Wear an N95 respirator during outdoor transit.")
    if visibility_intel.risk_level in ["Poor", "Hazardous"]:
        top_recs.append(f"Visibility hazard: {visibility_intel.commuter_advisory}")
    if not top_recs:
        top_recs.append("Skies are clear and favorable. All scheduled activities can proceed normally.")

    critical_alerts = [a.title for a in w.alerts] if w.alerts else []

    return IntelligenceSummary(
        is_personalized=c.is_personalized,
        mausam_score=score,
        top_recommendations=top_recs,
        critical_alerts=critical_alerts,
        activities=activities,
        routine_impacts=routine_impacts,
        calendar_conflicts=calendar_conflicts,
        krishi=krishi,
        health=health,
        event_planning=event_planning,
        allergy_outlook=allergy,
        visibility_intel=visibility_intel,
    )

@router.post("/should-i", response_model=ShouldIResponse)
async def ask_should_i(req: ShouldIRequest):
    """Answers concrete decision queries."""
    return evaluate_should_i(req.query, req.weather, req.context)
