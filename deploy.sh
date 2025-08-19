#!/bin/bash

# Policy Radar Deployment Script
echo "🚀 Policy Radar Deployment Script"
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your production settings"
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Build React frontend
echo "🔨 Building React frontend..."
cd frontend
npm install
npm run build
cd ..

# Create production directories
echo "📁 Creating production directories..."
mkdir -p dist/frontend
mkdir -p dist/api
mkdir -p dist/data
mkdir -p dist/vectors

# Copy built frontend
echo "📋 Copying frontend build..."
cp -r frontend/build/* dist/frontend/

# Copy API files
echo "📋 Copying API files..."
cp api_server_prod.py dist/api/
cp requirements.txt dist/api/
cp -r data/* dist/data/ 2>/dev/null || echo "No data files to copy"
cp -r vectors/* dist/vectors/ 2>/dev/null || echo "No vector files to copy"

# Copy configuration
cp .env dist/
cp .env.example dist/

echo "✅ Deployment preparation complete!"
echo ""
echo "📁 Production files are in ./dist/"
echo "🌐 Frontend files: ./dist/frontend/"
echo "🔧 API files: ./dist/api/"
echo "📊 Data files: ./dist/data/"
echo ""
echo "Next steps:"
echo "1. Edit ./dist/.env with production settings"
echo "2. Deploy ./dist/frontend/ to your web server"
echo "3. Deploy ./dist/api/ to your Python server"
echo "4. Run: python dist/api/api_server_prod.py"