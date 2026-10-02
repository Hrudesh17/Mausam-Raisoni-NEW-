import sys
import json
import urllib.request
import urllib.error

sys.stdout.reconfigure(encoding='utf-8')

API_BASE = "http://127.0.0.1:8000/api/v1"

def test_api():
    print("Testing backend connectivity to:", API_BASE)
    
    # 1. Health check
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/health")
        with urllib.request.urlopen(req, timeout=5) as resp:
            print("✓ /health status:", resp.status)
    except Exception as e:
        print("Backend not running on port 8000:", e)
        return False

    # 2. Help Emergency Contacts
    try:
        req = urllib.request.Request(f"{API_BASE}/help/emergency-contacts")
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            print(f"✓ /help/emergency-contacts: {len(data.get('emergency_numbers', []))} numbers, {len(data.get('helpline_categories', []))} categories")
    except Exception as e:
        print("✗ /help/emergency-contacts failed:", e)
        return False

    # 3. Help Feedback POST
    try:
        fb_payload = json.dumps({
            "name": "SIH Evaluator",
            "email": "evaluator@sih.gov.in",
            "category": "Forecast Accuracy",
            "rating": 5,
            "comment": "Testing the 0/500 char counter and real SQLite database persistence.",
            "location": "Pune"
        }).encode('utf-8')
        req = urllib.request.Request(
            f"{API_BASE}/help/feedback",
            data=fb_payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            res_data = json.loads(resp.read().decode())
            print(f"✓ /help/feedback POST succeeded: ID={res_data.get('id')}, Msg={res_data.get('message')}")
    except Exception as e:
        print("✗ /help/feedback POST failed:", e)
        return False

    # 4. Help Issue Report POST
    try:
        issue_payload = json.dumps({
            "category": "Road Waterlogging / Water Logging Spot",
            "description": "Severe water stagnation observed near Deccan Gymkhana junction after convective shower.",
            "location_name": "Pune",
            "lat": 18.5204,
            "lon": 73.8567,
            "app_version": "1.0.0"
        }).encode('utf-8')
        req = urllib.request.Request(
            f"{API_BASE}/help/report-issue",
            data=issue_payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            res_data = json.loads(resp.read().decode())
            print(f"✓ /help/report-issue POST succeeded: Ticket={res_data.get('ticket_number')}")
    except Exception as e:
        print("✗ /help/report-issue POST failed:", e)
        return False

    # 5. Weather GET
    try:
        req = urllib.request.Request(f"{API_BASE}/weather?lat=18.5204&lon=73.8567&city=Pune")
        with urllib.request.urlopen(req, timeout=10) as resp:
            weather_data = json.loads(resp.read().decode())
            curr = weather_data.get('current', {})
            print(f"✓ /weather GET: Temp={curr.get('temperature')}°C, UV={curr.get('uv_index')}, Vis={curr.get('visibility')}km, Daylight={weather_data.get('daily', [{}])[0].get('daylight_duration')}")
    except Exception as e:
        print("✗ /weather GET failed:", e)
        return False

    # 6. Intelligence Summary POST
    try:
        ctx = {
            "name": "Ameya",
            "is_personalized": True,
            "interests": ["commute", "running", "events"],
            "priorities": ["rain", "heat", "aqi"],
            "sensitivities": ["Pollen", "Dust", "Air Pollution"],
            "preferred_transit": "two_wheeler",
            "calendar_events": []
        }
        intel_payload = json.dumps({"weather": weather_data, "context": ctx}).encode('utf-8')
        req = urllib.request.Request(
            f"{API_BASE}/intelligence/summary",
            data=intel_payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            intel_data = json.loads(resp.read().decode())
            ep = intel_data.get('event_planning') or {}
            ao = intel_data.get('allergy_outlook') or {}
            vo = intel_data.get('visibility_intel') or {}
            print(f"✓ /intelligence/summary POST: Score={intel_data.get('mausam_score', {}).get('score')}")
            print(f"   Event Planning: Sunrise={ep.get('sunlight', {}).get('sunrise')}, Sunset={ep.get('sunlight', {}).get('sunset')}, Daylight={ep.get('sunlight', {}).get('daylight_duration')}")
            print(f"   Allergy Outlook: Risk={ao.get('risk_level')}, Pollen Available={ao.get('pollen', {}).get('available')}, Status={ao.get('pollen', {}).get('status_text')}")
            print(f"   Visibility: {vo.get('visibility_km')}km ({vo.get('risk_level')}), Commuter Advisory={vo.get('commuter_advisory')}")
    except Exception as e:
        print("✗ /intelligence/summary POST failed:", e)
        return False

    print("\nALL BACKEND & TELEMETRY VERIFICATIONS PASSED SUCCESSFULLY!")
    return True

if __name__ == "__main__":
    test_api()
