import pytest
import asyncio
from unittest.mock import patch, MagicMock
from app.services.crop_service import crop_service
from app.models.crops import CropClimateResponse

CITIES_TEST_SET = [
    ("Pune", 18.5204, 73.8567),
    ("Mumbai", 19.0760, 72.8777),
    ("Delhi", 28.6139, 77.2090),
    ("Lucknow", 26.8467, 80.9462),
    ("Jaipur", 26.9124, 75.7873),
    ("Chennai", 13.0827, 80.2707),
    ("Visakhapatnam", 17.6868, 83.2185),
]

@pytest.mark.asyncio
async def test_climate_aggregation_fixed_fixture():
    """Verify exact formula on fixed 30-day mock dataset"""
    # 30 days of mock temperature, humidity, rainfall
    mock_temps = [20.0 + (i % 5) for i in range(30)] # average = 22.0
    mock_hums = [60.0 + (i % 10) for i in range(30)] # average = 64.5
    mock_precips = [2.0 if i % 3 == 0 else 0.0 for i in range(30)] # 10 days * 2.0 = 20.0 mm

    mock_json = {
        "daily": {
            "temperature_2m_mean": mock_temps,
            "relative_humidity_2m_mean": mock_hums,
            "precipitation_sum": mock_precips,
        }
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_json
    mock_resp.raise_for_status = MagicMock()

    with patch("httpx.AsyncClient.get", return_value=mock_resp):
        # Clear cache first
        crop_service._climate_cache.clear()
        res = await crop_service.fetch_climate_telemetry(12.34, 56.78, "MockCity")
        assert res.is_available is True
        assert res.temperature == 22.0
        assert res.humidity == 64.5
        assert res.rainfall == 20.0
        assert "30-day" in res.basis

@pytest.mark.asyncio
async def test_climate_caching_behavior():
    """Verify 1-hour in-memory cache hit"""
    mock_json = {
        "daily": {
            "temperature_2m_mean": [25.0] * 30,
            "relative_humidity_2m_mean": [70.0] * 30,
            "precipitation_sum": [3.0] * 30,
        }
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_json
    mock_resp.raise_for_status = MagicMock()

    with patch("httpx.AsyncClient.get", return_value=mock_resp) as mock_get:
        crop_service._climate_cache.clear()
        res1 = await crop_service.fetch_climate_telemetry(15.0, 75.0, "CacheCity")
        assert mock_get.call_count == 1
        
        # Second call with same coordinates should hit cache without invoking httpx
        res2 = await crop_service.fetch_climate_telemetry(15.0, 75.0, "CacheCity")
        assert mock_get.call_count == 1
        assert res1.temperature == res2.temperature

@pytest.mark.asyncio
async def test_climate_failure_graceful_fallback():
    """Verify network failure returns is_available=False with clear error message, never crashing"""
    with patch("httpx.AsyncClient.get", side_effect=Exception("Connection timed out")):
        crop_service._climate_cache.clear()
        res = await crop_service.fetch_climate_telemetry(99.0, 99.0, "OfflineCity")
        assert res.is_available is False
        assert res.temperature is None
        assert res.humidity is None
        assert res.rainfall is None
        assert "Couldn't fetch live data" in (res.error_message or "")

@pytest.mark.asyncio
async def test_7_cities_accuracy_verification():
    """Verify live Open-Meteo fetching across 7 benchmark cities"""
    for name, lat, lon in CITIES_TEST_SET:
        crop_service._climate_cache.clear()
        res = await crop_service.fetch_climate_telemetry(lat, lon, name)
        assert res.is_available is True
        assert -10.0 <= res.temperature <= 50.0
        assert 0.0 <= res.humidity <= 100.0
        assert 0.0 <= res.rainfall <= 3000.0
