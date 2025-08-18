@echo off
REM Test Policy Radar API endpoints (Windows)

set API_URL=http://localhost:8000/api

echo 🧪 Testing Policy Radar API
echo ==========================

echo Testing health check...
curl -s "%API_URL%/health" | findstr "healthy" >nul
if %ERRORLEVEL%==0 (
    echo ✅ Health check passed
) else (
    echo ❌ Health check failed
    pause
    exit /b 1
)

echo Testing documents endpoint...
curl -s "%API_URL%/documents?limit=1" | findstr "documents" >nul
if %ERRORLEVEL%==0 (
    echo ✅ Documents endpoint working
) else (
    echo ⚠️  Documents endpoint returned no data ^(may need ingestion^)
)

echo Testing stats endpoint...
curl -s "%API_URL%/stats" | findstr "total_documents" >nul
if %ERRORLEVEL%==0 (
    echo ✅ Stats endpoint working
) else (
    echo ❌ Stats endpoint failed
)

echo.
echo 🎯 API Test Complete
echo    API Docs: %API_URL%/docs

pause
