from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class MausamScoreBreakdown(BaseModel):
    temperature_score: int
    precipitation_penalty: int
    aqi_penalty: int
    uv_penalty: int
    wind_penalty: int

class MausamScore(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Personalized suitability score 0-100")
    rating: str = Field(..., description="Ideal, Favorable, Moderate, Unfavorable, Hazardous")
    headline: str
    subtext: str
    primary_risk: Optional[str] = None
    breakdown: Optional[MausamScoreBreakdown] = None

class ActivityScore(BaseModel):
    name: str
    category: str
    score: int = Field(..., ge=0, le=100)
    status: str  # "Optimal", "Good", "Moderate", "Not Recommended", "Hazardous"
    best_time: str
    recommendation: str
    icon_key: str

class RoutineWeatherImpact(BaseModel):
    event_id: str
    event_title: str
    time_window: str
    is_outdoor: bool
    risk_level: str  # "green", "yellow", "amber", "red"
    impact_title: str
    impact_details: str
    proactive_action: str

class CalendarConflict(BaseModel):
    event_id: str
    event_title: str
    scheduled_time: str
    risk_type: str  # "rain", "heat", "air_quality", "storm"
    severity: str   # "high", "moderate", "low"
    conflict_summary: str
    suggested_alternate_time: Optional[str] = None
    suggested_action: str

class ShouldIResponse(BaseModel):
    query: str
    verdict: str  # "YES", "NO", "CAUTION", "CONDITIONAL"
    headline: str
    reason: str
    tip: str
    confidence: float
    data_points: Dict[str, str] = Field(default_factory=dict)


class KrishiIntelligence(BaseModel):
    spray_conditions: str          # Favorable, Unfavorable, Critical
    spray_score: int               # 0-100
    soil_moisture_estimate: str    # Wet, Optimal, Dry
    irrigation_needed: bool
    irrigation_advice: str
    pest_disease_risk: str         # Low, Medium, High
    harvesting_window: str
    storage_warning: Optional[str] = None
    recommended_crops: List[str] = Field(default_factory=list)
    crop_reasoning: Optional[str] = None

class HealthAQIIntelligence(BaseModel):
    health_index: int              # 0-100
    respiratory_risk: str          # Low, Moderate, High, Severe
    mask_recommended: bool
    uv_safe_hours: str
    hydration_target_liters: float
    outdoor_exercise_verdict: str

class SunlightWindow(BaseModel):
    sunrise: str
    sunset: str
    daylight_duration: str
    morning_golden_hour: str
    peak_sunlight_window: str
    evening_golden_hour: str
    twilight_window: str

class EventSuitabilityWindow(BaseModel):
    time_window: str
    suitability: str               # "Ideal", "Moderate", "Challenging"
    color: str                     # "green", "amber", "red"
    temperature: float
    rain_prob: int
    uv_index: float
    wind_speed: float
    visibility: float
    recommendation: str

class EventPlanningIntelligence(BaseModel):
    sunlight: SunlightWindow
    outdoor_comfort_rating: str
    suitability_score: int
    optimal_event_window: str
    windows: List[EventSuitabilityWindow]
    recommendations: List[str]

class EnvironmentalPollenData(BaseModel):
    available: bool = False
    tree_pollen: Optional[float] = None
    grass_pollen: Optional[float] = None
    weed_pollen: Optional[float] = None
    dominant_pollen: Optional[str] = None
    status_text: str = "Pollen data unavailable for this location."

class AllergyFactor(BaseModel):
    factor: str
    severity: str                  # "low", "moderate", "high"
    description: str

class AllergyOutlook(BaseModel):
    risk_level: str                # "Low", "Moderate", "Elevated", "High"
    risk_color: str                # "green", "blue", "amber", "red"
    peak_period: str
    summary: str
    vayusync_guidance: str
    factors: List[AllergyFactor]
    pollen: EnvironmentalPollenData
    precautions: List[str]
    disclaimer: str = "This environmental intelligence provides general meteorological insights and is not a medical diagnosis or medical advice."

class VisibilityIntelligence(BaseModel):
    visibility_km: float
    risk_level: str                # "Excellent", "Good", "Moderate", "Poor", "Hazardous"
    risk_color: str                # "blue", "green", "amber", "red"
    trend: str                     # "Stable", "Improving", "Decreasing"
    commuter_advisory: str
    delivery_advisory: str
    traveler_advisory: str
    athlete_advisory: str
    event_planner_advisory: str
    is_available: bool = True

class IntelligenceSummary(BaseModel):
    is_personalized: bool = True
    mausam_score: MausamScore
    top_recommendations: List[str]
    critical_alerts: List[str]
    activities: List[ActivityScore]
    routine_impacts: List[RoutineWeatherImpact]
    calendar_conflicts: List[CalendarConflict] = Field(default_factory=list)

    krishi: Optional[KrishiIntelligence] = None
    health: Optional[HealthAQIIntelligence] = None
    event_planning: Optional[EventPlanningIntelligence] = None
    allergy_outlook: Optional[AllergyOutlook] = None
    visibility_intel: Optional[VisibilityIntelligence] = None
