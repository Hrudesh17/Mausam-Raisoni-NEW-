import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from ..models.crops import CropPredictionRequest, CropPredictionResponse, CropClimateResponse
from ..services.crop_service import crop_service

logger = logging.getLogger("vayusync.crops_api")

router = APIRouter(prefix="/intelligence/crops", tags=["Crop Intelligence & Recommendation"])

@router.post(
    "/predict",
    response_model=CropPredictionResponse,
    summary="Predict Best Crop Recommendation",
    description=(
        "Runs strict agro-climatic validation and executes Random Forest ML inference "
        "to determine optimal primary and alternative crops based on soil nutrients and meteorological telemetry."
    ),
)
async def predict_crop(request: CropPredictionRequest):
    try:
        result = crop_service.predict(request)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"field": "general", "message": str(e), "allowed": "Valid numeric values within boundaries"}
        )
    except Exception as e:
        logger.error(f"Crop prediction endpoint failure: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while evaluating crop recommendation."
        )

@router.get(
    "/climate",
    response_model=CropClimateResponse,
    summary="Fetch 30-Day Agro-Climatic Telemetry for Location",
    description=(
        "Fetches official Open-Meteo 30-day daily telemetry (23 past days + 7 forecast days) "
        "to compute accurate mean temperature, mean relative humidity, and cumulative rainfall."
    ),
)
async def get_crop_climate(
    lat: float = Query(18.5204, ge=-90.0, le=90.0, description="Latitude coordinate"),
    lon: float = Query(73.8567, ge=-180.0, le=180.0, description="Longitude coordinate"),
    city: Optional[str] = Query(None, max_length=100, description="Optional city name"),
):
    try:
        climate = await crop_service.fetch_climate_telemetry(lat=lat, lon=lon, location_name=city)
        return climate
    except Exception as e:
        logger.error(f"Error fetching crop climate telemetry: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve agro-climatic telemetry."
        )

@router.get(
    "/defaults",
    summary="Fetch Auto-Filled Agricultural Defaults for Location (Alias)",
    description="Alias for climate telemetry endpoint.",
)
async def get_crop_defaults(
    lat: float = Query(18.5204, ge=-90.0, le=90.0),
    lon: float = Query(73.8567, ge=-180.0, le=180.0),
    city: str = Query("Pune", max_length=100),
):
    climate = await crop_service.fetch_climate_telemetry(lat=lat, lon=lon, location_name=city)
    return {
        "city": city,
        "latitude": lat,
        "longitude": lon,
        "temperature": climate.temperature,
        "humidity": climate.humidity,
        "rainfall": climate.rainfall,
        "basis": climate.basis,
        "window": climate.window,
        "source": climate.source,
        "fetched_at": climate.fetched_at,
        "is_available": climate.is_available,
    }

