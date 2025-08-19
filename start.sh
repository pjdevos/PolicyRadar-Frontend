#!/bin/bash
echo "Starting Policy Radar API..."
echo "PORT: $PORT"
echo "Python version: $(python --version)"
echo "Uvicorn version: $(python -m uvicorn --version)"
echo "Current directory: $(pwd)"
echo "Files in directory: $(ls -la)"

exec uvicorn api_server:app --host 0.0.0.0 --port ${PORT:-8000}