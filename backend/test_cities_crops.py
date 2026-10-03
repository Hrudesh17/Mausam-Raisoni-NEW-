import httpx

cities = [
    {"city": "Pune", "N": 90, "P": 42, "K": 43, "temp": 24.5, "hum": 68, "ph": 6.5, "rain": 150},
    {"city": "Mumbai", "N": 85, "P": 40, "K": 45, "temp": 29.0, "hum": 88, "ph": 6.8, "rain": 240},
    {"city": "Delhi", "N": 105, "P": 55, "K": 50, "temp": 31.0, "hum": 50, "ph": 7.2, "rain": 80},
    {"city": "Jaipur", "N": 25, "P": 20, "K": 20, "temp": 38.0, "hum": 28, "ph": 7.9, "rain": 45},
    {"city": "Lucknow", "N": 95, "P": 45, "K": 40, "temp": 26.0, "hum": 70, "ph": 7.0, "rain": 130},
    {"city": "Chennai", "N": 80, "P": 45, "K": 40, "temp": 30.0, "hum": 82, "ph": 6.6, "rain": 160},
    {"city": "Bengaluru", "N": 70, "P": 50, "K": 40, "temp": 22.0, "hum": 65, "ph": 6.2, "rain": 110}
]

for c in cities:
    payload = {
        "nitrogen": c["N"],
        "phosphorus": c["P"],
        "potassium": c["K"],
        "temperature": c["temp"],
        "humidity": c["hum"],
        "ph": c["ph"],
        "rainfall": c["rain"],
        "location_name": c["city"]
    }
    res = httpx.post("http://127.0.0.1:8000/api/v1/intelligence/crops/predict", json=payload)
    data = res.json()
    crop = data.get("recommended_crop")
    conf = data.get("confidence")
    source = data.get("source")
    print(f"[{c['city']:<12}] -> Crop: {crop:<12} (Confidence: {conf*100:.1f}%, Source: {source})")
