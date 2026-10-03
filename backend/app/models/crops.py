from typing import List, Optional, Literal, Dict
from pydantic import BaseModel, Field, ConfigDict, field_validator
import math

class CropPredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nitrogen: float = Field(..., ge=0.0, le=200.0, description="Nitrogen content in soil (kg/ha)")
    phosphorus: float = Field(..., ge=0.0, le=200.0, description="Phosphorus content in soil (kg/ha)")
    potassium: float = Field(..., ge=0.0, le=200.0, description="Potassium content in soil (kg/ha)")
    temperature: float = Field(..., ge=-10.0, le=50.0, description="Ambient temperature in °C")
    humidity: float = Field(..., ge=0.0, le=100.0, description="Relative humidity in %")
    ph: float = Field(..., ge=0.0, le=14.0, description="Soil pH value (0-14 scale)")
    rainfall: float = Field(..., ge=0.0, le=3000.0, description="Annual/seasonal rainfall in mm")
    location_name: Optional[str] = Field(None, max_length=100, description="Optional city or observatory name")

    @field_validator("nitrogen", "phosphorus", "potassium", "temperature", "humidity", "ph", "rainfall", mode="before")
    @classmethod
    def validate_finite_number(cls, v):
        if v is None:
            raise ValueError("Field cannot be null")
        try:
            val = float(v)
        except (ValueError, TypeError):
            raise ValueError("Must be a valid numeric value")
        if math.isnan(val) or math.isinf(val):
            raise ValueError("NaN or Infinite values are forbidden")
        return val

    @field_validator("location_name")
    @classmethod
    def sanitize_location(cls, v):
        if v is not None:
            v_clean = v.strip()
            if not v_clean:
                return None
            return v_clean
        return None

class CropRecommendationItem(BaseModel):
    crop: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    image_url: str
    category: Optional[str] = None
    ideal_season: Optional[str] = None

class CropPredictionResponse(BaseModel):
    recommended_crop: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    primary_image_url: str
    top_alternatives: List[CropRecommendationItem] = []
    source: Literal["ml_model", "rule_based", "cached"]
    reasoning: str
    growth_hints: Dict[str, str] = {}
    advisory_note: str
    inputs_echo: Dict[str, float]

class CropClimateResponse(BaseModel):
    temperature: Optional[float] = Field(None, description="Mean temperature in °C over 30-day window")
    humidity: Optional[float] = Field(None, description="Mean relative humidity in % over 30-day window")
    rainfall: Optional[float] = Field(None, description="Total precipitation in mm over 30-day window")
    basis: str = Field("30-day agro-climatic average", description="Computation methodology description")
    window: str = Field("23 past days + 7-day forecast", description="Time window for historical + forecast telemetry")
    source: str = Field("Open-Meteo API", description="Data provider attribution")
    fetched_at: str = Field(..., description="ISO 8601 timestamp of data acquisition")
    location_name: Optional[str] = None
    is_available: bool = True
    error_message: Optional[str] = None

