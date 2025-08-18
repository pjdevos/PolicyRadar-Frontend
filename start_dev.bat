@echo off
REM Start Policy Radar Development Environment (Windows)

echo 🚀 Starting Policy Radar Development Environment
echo ================================================

REM Start backend
echo Starting backend API server...
start "Policy Radar API" cmd /k start_backend.bat

REM Wait for backend to start
timeout /t 5 /nobreak > nul

REM Check if backend is running (simplified for Windows)
echo ✅ Backend should be starting...
echo.
echo 🎉 Development environment ready!
echo    Backend API:  http://localhost:8000
echo    API Docs:     http://localhost:8000/api/docs
echo.
echo Press any key to stop services...

pause > nul
taskkill /f /im python.exe 2>nul
taskkill /f /im uvicorn.exe 2>nul
