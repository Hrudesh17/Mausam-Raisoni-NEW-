import pytest
import math
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_valid_crop_prediction():
    payload = {
        "nitrogen": 90.0,
        "phosphorus": 42.0,
        "potassium": 43.0,
        "temperature": 20.8,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.9,
        "location_name": "Pune"
    }
    response = client.post("/api/v1/intelligence/crops/predict", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["recommended_crop"] == "Rice"
    assert data["confidence"] > 0.5
    assert data["source"] in ["ml_model", "rule_based"]
    assert len(data["top_alternatives"]) > 0
    assert "Rice" in data["primary_image_url"] or "rice" in data["primary_image_url"].lower()

def test_boundary_min_max_valid():
    # Min boundary
    payload_min = {
        "nitrogen": 0.0,
        "phosphorus": 0.0,
        "potassium": 0.0,
        "temperature": -10.0,
        "humidity": 0.0,
        "ph": 0.0,
        "rainfall": 0.0,
        "location_name": "Boundary Min"
    }
    res_min = client.post("/api/v1/intelligence/crops/predict", json=payload_min)
    assert res_min.status_code == 200

    # Max boundary
    payload_max = {
        "nitrogen": 200.0,
        "phosphorus": 200.0,
        "potassium": 200.0,
        "temperature": 50.0,
        "humidity": 100.0,
        "ph": 14.0,
        "rainfall": 3000.0,
        "location_name": "Boundary Max"
    }
    res_max = client.post("/api/v1/intelligence/crops/predict", json=payload_max)
    assert res_max.status_code == 200

@pytest.mark.parametrize("invalid_field,invalid_val", [
    ("nitrogen", -1.0),
    ("nitrogen", 201.0),
    ("phosphorus", -5.0),
    ("phosphorus", 250.0),
    ("potassium", -0.1),
    ("potassium", 300.0),
    ("temperature", -15.0),
    ("temperature", 55.0),
    ("humidity", -1.0),
    ("humidity", 101.0),
    ("ph", -0.5),
    ("ph", 14.5),
    ("rainfall", -10.0),
    ("rainfall", 3500.0),
    ("nitrogen", "not_a_number"),
])
def test_out_of_bounds_validation(invalid_field, invalid_val):
    base_payload = {
        "nitrogen": 90.0,
        "phosphorus": 42.0,
        "potassium": 43.0,
        "temperature": 20.8,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.9,
    }
    base_payload[invalid_field] = invalid_val
    response = client.post("/api/v1/intelligence/crops/predict", json=base_payload)
    assert response.status_code == 422, f"Expected 422 for {invalid_field}={invalid_val}, got {response.status_code}"

def test_extra_fields_forbidden():
    payload = {
        "nitrogen": 90.0,
        "phosphorus": 42.0,
        "potassium": 43.0,
        "temperature": 20.8,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.9,
        "extra_unknown_field": "injected"
    }
    response = client.post("/api/v1/intelligence/crops/predict", json=payload)
    assert response.status_code == 422

def test_missing_required_field():
    payload = {
        "nitrogen": 90.0,
        # missing phosphorus
        "potassium": 43.0,
        "temperature": 20.8,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.9,
    }
    response = client.post("/api/v1/intelligence/crops/predict", json=payload)
    assert response.status_code == 422

def test_security_injection_handling():
    payload = {
        "nitrogen": 90.0,
        "phosphorus": 42.0,
        "potassium": 43.0,
        "temperature": 20.8,
        "humidity": 82.0,
        "ph": 6.5,
        "rainfall": 202.9,
        "location_name": "<script>alert('xss')</script>'; DROP TABLE users; --"
    }
    response = client.post("/api/v1/intelligence/crops/predict", json=payload)
    assert response.status_code == 200
    # Confirm no crash and safe output
    data = response.json()
    assert "recommended_crop" in data

def test_multi_city_scenarios():
    scenarios = [
        {"city": "Mumbai Monsoon", "N": 90, "P": 42, "K": 43, "temp": 28, "hum": 90, "ph": 6.5, "rain": 250, "expected": ["Rice", "Jute"]},
        {"city": "Rajasthan Arid", "N": 20, "P": 30, "K": 20, "temp": 38, "hum": 25, "ph": 7.8, "rain": 40, "expected": ["Mothbeans", "Mungbean"]},
        {"city": "Bengaluru Mild", "N": 70, "P": 50, "K": 40, "temp": 23, "hum": 65, "ph": 6.2, "rain": 110, "expected": ["Maize", "Cotton", "Banana", "Chickpea"]},
    ]
    for sc in scenarios:
        payload = {
            "nitrogen": sc["N"],
            "phosphorus": sc["P"],
            "potassium": sc["K"],
            "temperature": sc["temp"],
            "humidity": sc["hum"],
            "ph": sc["ph"],
            "rainfall": sc["rain"],
            "location_name": sc["city"]
        }
        res = client.post("/api/v1/intelligence/crops/predict", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["recommended_crop"] in sc["expected"] or len(data["top_alternatives"]) > 0

if __name__ == "__main__":
    import pytest
    pytest.main(["-v", __file__])
