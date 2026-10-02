import sys
import os
import subprocess
import time
import urllib.request
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

def test_chain():
    # 1. Start FastAPI backend in subprocess
    backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
    venv_python = os.path.join(backend_dir, ".venv", "Scripts", "python.exe")
    if not os.path.isfile(venv_python):
        venv_python = sys.executable

    port = 8010
    env = os.environ.copy()
    env["PORT"] = str(port)
    env["HOST"] = "0.0.0.0"
    env["CORS_ORIGINS"] = "https://custom-domain.com,http://localhost:3000"

    print(f"[*] Starting test backend on port {port} using {venv_python}...")
    proc = subprocess.Popen(
        [venv_python, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", str(port)],
        cwd=backend_dir,
        env=env,
    )

    try:
        # Wait for backend to be live
        base_url = f"http://127.0.0.1:{port}"
        health_ok = False
        for i in range(30):
            try:
                req = urllib.request.Request(f"{base_url}/health", headers={"User-Agent": "TestClient"})
                with urllib.request.urlopen(req, timeout=1.0) as res:
                    if res.status == 200:
                        data = json.loads(res.read().decode("utf-8"))
                        print(f"✓ TEST 1 - GET /health: 200 OK -> {data}")
                        health_ok = True
                        break
            except Exception as e:
                print(f"Health check attempt {i} exception: {type(e).__name__}: {e}", flush=True)
                time.sleep(0.5)

        if not health_ok:
            print("Failed to connect to backend on /health after 15s.")
            proc.terminate()
            sys.exit(1)

        # TEST 2: GET /api/v1/health
        with urllib.request.urlopen(f"{base_url}/api/v1/health", timeout=2.0) as res:
            data = json.loads(res.read().decode("utf-8"))
            print(f"✓ TEST 2 - GET /api/v1/health: 200 OK -> {data}")
            assert data["status"] == "ok"

        # TEST 3: Weather for Pune
        with urllib.request.urlopen(f"{base_url}/api/v1/weather?lat=18.5204&lon=73.8567&city=Pune", timeout=10.0) as res:
            data = json.loads(res.read().decode("utf-8"))
            loc = data["location"]["name"]
            temp = data["current"]["temperature"]
            print(f"✓ TEST 3 - Weather for Pune: 200 OK -> Location: {loc}, Temp: {temp}°C, Provider: {data.get('provider')}")
            assert "pune" in loc.lower() or "station" in loc.lower()

        # TEST 4: Weather for Delhi
        with urllib.request.urlopen(f"{base_url}/api/v1/weather?lat=28.6139&lon=77.2090&city=New%20Delhi", timeout=10.0) as res:
            data = json.loads(res.read().decode("utf-8"))
            loc = data["location"]["name"]
            temp = data["current"]["temperature"]
            print(f"✓ TEST 4 - Weather for Delhi: 200 OK -> Location: {loc}, Temp: {temp}°C, Provider: {data.get('provider')}")
            assert "delhi" in loc.lower() or "station" in loc.lower()

        # TEST 5: Weather for Hyderabad
        with urllib.request.urlopen(f"{base_url}/api/v1/weather?lat=17.3850&lon=78.4867&city=Hyderabad", timeout=10.0) as res:
            data = json.loads(res.read().decode("utf-8"))
            loc = data["location"]["name"]
            temp = data["current"]["temperature"]
            print(f"✓ TEST 5 - Weather for Hyderabad: 200 OK -> Location: {loc}, Temp: {temp}°C, Provider: {data.get('provider')}")
            assert "hyderabad" in loc.lower() or "station" in loc.lower()

        # TEST 6: VayuSync Sahayak Assistant Chat
        chat_payload = json.dumps({
            "message": "what is the temperature in Hyderabad?",
            "dashboard_location": "Hyderabad",
            "conversation_location": "Hyderabad",
            "persona": ["commuter"],
            "language": "en"
        }).encode("utf-8")
        req = urllib.request.Request(
            f"{base_url}/api/v1/assistant/chat",
            data=chat_payload,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10.0) as res:
            data = json.loads(res.read().decode("utf-8"))
            reply = data.get("reply", "")
            print(f"✓ TEST 6 - Assistant Chat: 200 OK -> Reply: {reply[:100]}...")
            assert "hyderabad" in reply.lower() or "temperature" in reply.lower()

        # TEST 7: CORS Preflight for Netlify Subdomain
        netlify_origin = "https://vayusync-app-2026.netlify.app"
        cors_req = urllib.request.Request(
            f"{base_url}/api/v1/weather",
            method="OPTIONS",
            headers={
                "Origin": netlify_origin,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "content-type",
            }
        )
        with urllib.request.urlopen(cors_req, timeout=2.0) as res:
            allow_origin = res.headers.get("access-control-allow-origin")
            allow_creds = res.headers.get("access-control-allow-credentials")
            print(f"✓ TEST 7 - Netlify CORS Preflight: Status {res.status} -> Origin Header: {allow_origin}, Allow-Credentials: {allow_creds}")
            assert allow_origin == netlify_origin
            assert allow_creds == "true"

        print("\n🎉 ALL ARCHITECTURAL TESTS PASSED SUCCESSFULLY!")

    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except Exception:
            proc.kill()

if __name__ == "__main__":
    test_chain()
