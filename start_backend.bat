@echo off
REM Start Policy Radar Backend (Windows)

echo 🚀 Starting Policy Radar API Server...

REM Activate virtual environment
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
)

REM Start the server
uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload

pause
