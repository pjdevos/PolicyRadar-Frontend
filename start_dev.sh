#!/bin/bash
# Start full Policy Radar development environment

echo "🚀 Starting Policy Radar Development Environment"
echo "================================================"

# Function to kill background processes on exit
cleanup() {
    echo "Shutting down services..."
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting backend API server..."
./start_backend.sh &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:8000/api/health > /dev/null; then
    echo "✅ Backend API started successfully"
else
    echo "❌ Backend API failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Development environment ready!"
echo "   Backend API:  http://localhost:8000"
echo "   API Docs:     http://localhost:8000/api/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
