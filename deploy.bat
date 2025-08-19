@echo off
REM Policy Radar Deployment Script for Windows
echo 🚀 Policy Radar Deployment Script
echo ==================================

REM Check if .env file exists
if not exist .env (
    echo 📋 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your production settings
)

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Build React frontend
echo 🔨 Building React frontend...
cd frontend
call npm install
call npm run build
cd ..

REM Create production directories
echo 📁 Creating production directories...
if not exist dist mkdir dist
if not exist dist\frontend mkdir dist\frontend
if not exist dist\api mkdir dist\api
if not exist dist\data mkdir dist\data
if not exist dist\vectors mkdir dist\vectors

REM Copy built frontend
echo 📋 Copying frontend build...
xcopy frontend\build\* dist\frontend\ /E /Y

REM Copy API files
echo 📋 Copying API files...
copy api_server_prod.py dist\api\
copy requirements.txt dist\api\
xcopy data\* dist\data\ /E /Y 2>nul
xcopy vectors\* dist\vectors\ /E /Y 2>nul

REM Copy configuration
copy .env dist\
copy .env.example dist\

echo ✅ Deployment preparation complete!
echo.
echo 📁 Production files are in .\dist\
echo 🌐 Frontend files: .\dist\frontend\
echo 🔧 API files: .\dist\api\
echo 📊 Data files: .\dist\data\
echo.
echo Next steps:
echo 1. Edit .\dist\.env with production settings
echo 2. Deploy .\dist\frontend\ to your web server
echo 3. Deploy .\dist\api\ to your Python server
echo 4. Run: python dist\api\api_server_prod.py

pause