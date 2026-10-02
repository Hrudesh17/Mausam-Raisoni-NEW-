import os
import sys
import time
import subprocess
import urllib.request
import json

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")
python_bin = os.path.join(backend_dir, ".venv", "Scripts", "python.exe")

system32 = os.path.join(os.environ.get("SystemRoot", r"C:\Windows"), "System32")
netstat_bin = os.path.join(system32, "netstat.exe") if os.path.isfile(os.path.join(system32, "netstat.exe")) else "netstat"
taskkill_bin = os.path.join(system32, "taskkill.exe") if os.path.isfile(os.path.join(system32, "taskkill.exe")) else "taskkill"

# 1. Kill anything on 8000
try:
    cmd = f'"{netstat_bin}" -ano'
    out = subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.DEVNULL)
    for line in out.splitlines():
        if ":8000" in line and "LISTENING" in line:
            pid = line.strip().split()[-1]
            subprocess.call([taskkill_bin, "/F", "/PID", pid], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(0.5)
except Exception as e:
    print("Kill exception:", e)

# 2. Launch uvicorn
env = os.environ.copy()
env["PORT"] = "8000"
env["PYTHONUNBUFFERED"] = "1"
cmd = [python_bin, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"]
proc = subprocess.Popen(
    cmd,
    cwd=backend_dir,
    env=env,
    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
)
print(f"Launched uvicorn PID: {proc.pid}")

# 3. Wait for /health
time.sleep(2.0)
for _ in range(15):
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/health")
        with urllib.request.urlopen(req, timeout=2) as r:
            if r.status == 200:
                print("Backend healthy on port 8000!")
                break
    except Exception:
        time.sleep(0.5)

# 4. Check emergency contacts
try:
    req = urllib.request.Request("http://127.0.0.1:8000/api/v1/help/emergency-contacts")
    with urllib.request.urlopen(req, timeout=2) as r:
        data = json.loads(r.read().decode())
        print(f"Emergency contacts endpoint verified: {len(data.get('emergency_numbers', []))} numbers loaded.")
except Exception as e:
    print("Failed to fetch emergency contacts:", e)
