@echo off
setlocal enabledelayedexpansion
title MAUSAM - Powered by VayuSync Intelligence
cls
cd /d "%~dp0"
chcp 65001 >nul 2>&1
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8

set "PYTHON_EXE="

REM 1. Check project virtual environment first
if exist "%~dp0backend\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0backend\.venv\Scripts\python.exe"
    goto :run_launcher
)

REM 2. Check standard Windows user Python installations (Python 3.13, 3.12, 3.11, 3.10)
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
    goto :run_launcher
)
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    goto :run_launcher
)
if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    goto :run_launcher
)
if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
    goto :run_launcher
)
if exist "%ProgramFiles%\Python313\python.exe" (
    set "PYTHON_EXE=%ProgramFiles%\Python313\python.exe"
    goto :run_launcher
)
if exist "%ProgramFiles%\Python312\python.exe" (
    set "PYTHON_EXE=%ProgramFiles%\Python312\python.exe"
    goto :run_launcher
)
if exist "%ProgramFiles%\Python311\python.exe" (
    set "PYTHON_EXE=%ProgramFiles%\Python311\python.exe"
    goto :run_launcher
)

REM 3. Check python.exe available through PATH
for /f "tokens=*" %%i in ('where python.exe 2^>nul') do (
    if not defined PYTHON_EXE if exist "%%i" (
        set "PYTHON_EXE=%%i"
    )
)
if defined PYTHON_EXE goto :run_launcher

REM 4. Check py.exe only as optional fallback (without crashing if missing)
set "PY_CMD="
for /f "tokens=*" %%i in ('where py.exe 2^>nul') do (
    if not defined PY_CMD if exist "%%i" (
        set "PY_CMD=%%i"
    )
)

if defined PY_CMD (
    "%PY_CMD%" -3 start.py
    goto :check_error
)

echo ============================================================
echo [ERROR] Python was not automatically detected.
echo ============================================================
echo Please ensure Python 3.10+ is installed or set the PYTHON_EXE variable.
echo.
pause
exit /b 1

:run_launcher
"%PYTHON_EXE%" start.py

:check_error
if errorlevel 1 (
    echo.
    echo Launcher encountered an error.
    pause
)
