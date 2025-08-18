#!/bin/bash
# Start Policy Radar Backend

echo "🚀 Starting Policy Radar API Server..."

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Start the server
uvicorn api_server:app --host ${API_HOST:-0.0.0.0} --port ${API_PORT:-8000} --reload
