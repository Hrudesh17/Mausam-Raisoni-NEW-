import os
import sys
import time
import socket
import subprocess
import webbrowser
import urllib.request
import json
import shutil

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def find_available_port(starting_port: int, max_attempts: int = 10) -> int:
    for p in range(starting_port, starting_port + max_attempts):
        if not is_port_in_use(p):
            return p
    return starting_port

def wait_for_http(url: str, timeout_sec: int = 25) -> bool:
    start_time = time.time()
    while time.time() - start_time < timeout_sec:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "VayuSync-Launcher"})
            with urllib.request.urlopen(req, timeout=2.0) as res:
                if res.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(0.5)
    return False

def clean_stale_vayusync_processes(ports=[8000, 8001, 3000, 3001]):
    """Checks if ports are occupied and safely terminates previous VayuSync processes."""
    if sys.platform != "win32":
        return
    system32 = os.path.join(os.environ.get("SystemRoot", r"C:\Windows"), "System32")
    netstat_bin = os.path.join(system32, "netstat.exe") if os.path.isfile(os.path.join(system32, "netstat.exe")) else "netstat"
    tasklist_bin = os.path.join(system32, "tasklist.exe") if os.path.isfile(os.path.join(system32, "tasklist.exe")) else "tasklist"
    taskkill_bin = os.path.join(system32, "taskkill.exe") if os.path.isfile(os.path.join(system32, "taskkill.exe")) else "taskkill"
    for port in ports:
        try:
            cmd = f'"{netstat_bin}" -ano'
            out = subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.DEVNULL)
            for line in out.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    parts = line.strip().split()
                    pid = parts[-1]
                    if pid != str(os.getpid()):
                        task_cmd = f'"{tasklist_bin}" /FI "PID eq {pid}" /FO CSV /NH'
                        task_info = subprocess.check_output(task_cmd, shell=True, text=True, stderr=subprocess.DEVNULL)
                        task_lower = task_info.lower()
                        # Only kill python.exe or node.exe processes
                        if "python.exe" in task_lower or "node.exe" in task_lower:
                            subprocess.call([taskkill_bin, "/F", "/PID", pid], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                            time.sleep(0.5)
        except Exception:
            pass

def find_system_python() -> str:
    """Detects available base Python installation with multi-tier fallback."""
    # 1. User/Environment override (if pointing to a base Python outside .venv)
    env_py = os.environ.get("PYTHON_EXE")
    if env_py and os.path.isfile(env_py) and ".venv" not in env_py.lower():
        return env_py

    # 2. Known Windows user installation locations
    candidate_paths = [
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Python\Python313\python.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Python\Python312\python.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Python\Python311\python.exe"),
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Python\Python310\python.exe"),
        os.path.expandvars(r"%ProgramFiles%\Python313\python.exe"),
        os.path.expandvars(r"%ProgramFiles%\Python312\python.exe"),
        os.path.expandvars(r"%ProgramFiles%\Python311\python.exe"),
    ]
    for p in candidate_paths:
        if os.path.isfile(p):
            return p

    # 3. Running sys.executable if valid and outside .venv
    if sys.executable and os.path.isfile(sys.executable) and ".venv" not in sys.executable.lower():
        return sys.executable

    # 4. PATH lookup
    path_py = shutil.which("python") or shutil.which("python.exe")
    if path_py and ".venv" not in path_py.lower():
        return path_py

    # Default fallback
    return sys.executable

def get_venv_python(backend_dir: str) -> str:
    """Returns the expected virtual environment Python executable path."""
    if sys.platform == "win32":
        return os.path.join(backend_dir, ".venv", "Scripts", "python.exe")
    return os.path.join(backend_dir, ".venv", "bin", "python")

def check_python_environment(backend_dir: str) -> tuple[str, str, str]:
    """
    [1/5] Detects Python executable and reports version and environment.
    Returns (base_python, py_version_str, venv_python).
    """
    base_python = find_system_python()
    venv_python = get_venv_python(backend_dir)

    try:
        ver_proc = subprocess.run(
            [base_python, "-c", "import sys; print(f'Python {sys.version.split()[0]}')"],
            capture_output=True,
            text=True,
            timeout=5
        )
        py_version = ver_proc.stdout.strip() if ver_proc.returncode == 0 else f"Python {sys.version.split()[0]}"
    except Exception:
        py_version = f"Python {sys.version.split()[0]}"

    print(f"Python:\n  {base_python}")
    print(f"Version:\n  {py_version}")
    print(f"Environment:\n  backend\\.venv")
    print("✓ Python detected")
    print(f"✓ {py_version}")

    return base_python, py_version, venv_python

def prepare_backend_environment(backend_dir: str, base_python: str, venv_python: str) -> str:
    """
    [2/5] Prepares backend/.venv, installs dependencies, and verifies Uvicorn.
    """
    venv_dir = os.path.join(backend_dir, ".venv")
    req_file = os.path.join(backend_dir, "requirements.txt")

    # Verify if venv_python exists AND is executable
    is_valid_venv = False
    if os.path.isfile(venv_python):
        try:
            test_run = subprocess.run([venv_python, "-c", "import sys"], capture_output=True, timeout=5)
            if test_run.returncode == 0:
                is_valid_venv = True
        except Exception:
            is_valid_venv = False

    # 1. Create or recreate virtual environment if missing or broken (e.g. imported from another machine)
    if not is_valid_venv:
        print(f"      Creating fresh virtual environment at {venv_dir}...")
        if os.path.isdir(venv_dir):
            shutil.rmtree(venv_dir, ignore_errors=True)
        res = subprocess.run([base_python, "-m", "venv", venv_dir], capture_output=True, text=True)
        venv_python = get_venv_python(backend_dir)
        if res.returncode != 0 or not os.path.isfile(venv_python):
            print(f"⚠️ Notice: Virtual environment creation failed:\n{res.stderr.strip()}")
            print("      Falling back to base Python interpreter...")
            venv_python = base_python
        else:
            print("✓ Virtual environment ready")
    else:
        print("✓ Virtual environment ready")

    # 2. Verify dependencies
    check_code = "import uvicorn, fastapi, pydantic, httpx; print('READY')"
    check_res = subprocess.run([venv_python, "-c", check_code], capture_output=True, text=True)

    if check_res.returncode != 0 or "READY" not in check_res.stdout:
        print("      Installing dependencies from requirements.txt...")
        if os.path.isfile(req_file):
            install_res = subprocess.run(
                [venv_python, "-m", "pip", "install", "--no-warn-script-location", "-r", req_file],
                capture_output=True,
                text=True
            )
            if install_res.returncode != 0:
                print(f"❌ Dependency installation failed:\n{install_res.stderr}")
                sys.exit(1)
        else:
            print(f"❌ requirements.txt not found at {req_file}")
            sys.exit(1)

    print("✓ Dependencies installed")
    print("✓ FastAPI dependencies available")

    # 3. Verify Uvicorn is available
    uv_res = subprocess.run([venv_python, "-m", "uvicorn", "--version"], capture_output=True, text=True)
    if uv_res.returncode != 0:
        print(f"❌ Uvicorn verification failed:\n{uv_res.stderr}")
        print("Please install uvicorn: backend\\.venv\\Scripts\\python.exe -m pip install uvicorn")
        sys.exit(1)

    print("✓ Uvicorn available")
    return venv_python

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("============================================================")
    print("MAUSAM (Powered by VayuSync Intelligence)")
    print("VayuSync")
    print("============================================================")
    print()

    # Step 1: Check Python environment
    print("[1/5] Checking Python environment...")
    base_python, py_version, venv_python = check_python_environment(backend_dir)
    print()

    # Step 2: Prepare backend environment
    print("[2/5] Preparing backend environment...")
    backend_python = prepare_backend_environment(backend_dir, base_python, venv_python)
    print()

    # Check port readiness before starting
    clean_stale_vayusync_processes([8000, 3000])
    time.sleep(0.5)
    backend_port = 8000 if not is_port_in_use(8000) else find_available_port(8001)
    frontend_port = 3000 if not is_port_in_use(3000) else find_available_port(3001)

    # Step 3: Starting FastAPI Backend
    print("[3/5] Starting FastAPI Backend...")
    backend_env = os.environ.copy()
    backend_env["PORT"] = str(backend_port)
    backend_env["PYTHONUNBUFFERED"] = "1"
    backend_cmd = [
        backend_python, "-m", "uvicorn", "app.main:app",
        "--host", "127.0.0.1",
        "--port", str(backend_port)
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=backend_dir,
        env=backend_env,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0
    )
    print(f"✓ Backend started on port {backend_port}")
    print()

    # Step 4: Verifying backend health
    print("[4/5] Verifying backend health...")
    backend_health_url = f"http://127.0.0.1:{backend_port}/health"
    if not wait_for_http(backend_health_url, timeout_sec=20):
        print(f"❌ Error: Backend failed to respond to {backend_health_url}. Terminating.")
        backend_proc.terminate()
        sys.exit(1)
    print(f"✓ {backend_health_url} → 200 OK")
    print()

    # Step 5: Starting Next.js
    print("[5/5] Starting Next.js...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_env = os.environ.copy()
    frontend_env["PORT"] = str(frontend_port)
    frontend_env["NEXT_PUBLIC_API_BASE_URL"] = f"http://127.0.0.1:{backend_port}"
    frontend_env["NEXT_PUBLIC_API_URL"] = f"http://127.0.0.1:{backend_port}"
    frontend_env["NEXT_PUBLIC_API_BASE"] = f"http://127.0.0.1:{backend_port}/api/v1"

    build_dir = os.path.join(frontend_dir, ".next")
    has_prod_build = os.path.isdir(build_dir) and os.path.isfile(os.path.join(build_dir, "BUILD_ID"))
    if has_prod_build:
        frontend_cmd = [npm_cmd, "run", "start", "--", "-p", str(frontend_port)]
    else:
        frontend_cmd = [npm_cmd, "run", "dev", "--", "-p", str(frontend_port)]

    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=frontend_dir,
        env=frontend_env,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0
    )

    frontend_url = f"http://localhost:{frontend_port}"
    if not wait_for_http(frontend_url, timeout_sec=20):
        if is_port_in_use(frontend_port):
            pass
        else:
            print("⚠️ Notice: Frontend is still initializing...")
    print("✓ Frontend started")
    print()

    # Success Banner
    print("============================================================")
    print("MAUSAM is active")
    print("============================================================")
    print(f"   Frontend:  {frontend_url}")
    print(f"   Backend:   http://127.0.0.1:{backend_port}")
    print(f"   API Docs:  http://127.0.0.1:{backend_port}/docs")
    print(f"   Health:    {backend_health_url}")
    print()
    print("   Press Ctrl+C in this terminal to shut down all servers.")
    print("============================================================")
    print()

    try:
        webbrowser.open(frontend_url)
    except Exception:
        pass

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("Backend process terminated.")
                break
            if frontend_proc.poll() is not None:
                print("Frontend process terminated.")
                break
    except KeyboardInterrupt:
        print("\nStopping MAUSAM + VayuSync servers...")
    finally:
        if sys.platform == "win32":
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(backend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(frontend_proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            backend_proc.terminate()
            frontend_proc.terminate()
        print("Servers stopped cleanly.")

if __name__ == "__main__":
    main()
