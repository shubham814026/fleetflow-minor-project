#!/usr/bin/env bash

# SmartFleet AI / FleetFlow - Startup Script
# Automatically uses .venv for the Python ML Service

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Check if .venv exists
if [ ! -d ".venv" ]; then
    echo "❌ Error: Virtual environment (.venv) not found in $PROJECT_ROOT"
    echo "Creating .venv and installing requirements..."
    python3 -m venv .venv
    .venv/bin/pip install -r ml_service/requirements.txt
fi

VENV_PYTHON="$PROJECT_ROOT/.venv/bin/python"

echo "=========================================================="
echo "🚀 FleetFlow / SmartFleet AI Launcher"
echo "   Python venv: $VENV_PYTHON"
echo "=========================================================="

MODE="${1:-all}"

cleanup() {
    echo ""
    echo "🛑 Stopping all FleetFlow services..."
    kill 0
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

case "$MODE" in
    ml)
        echo "Starting Python ML Inference Microservice in venv (Port 8000)..."
        "$VENV_PYTHON" ml_service/start_service.py
        ;;
    server)
        echo "Starting Node.js Backend Gateway (Port 5001)..."
        cd server && npm run dev
        ;;
    client)
        echo "Starting React Frontend (Port 5173)..."
        cd client && npm run dev
        ;;
    all)
        echo "Starting all 3 services..."
        echo "1) FastAPI ML Service (http://127.0.0.1:8000)"
        "$VENV_PYTHON" ml_service/start_service.py &
        ML_PID=$!

        sleep 2

        echo "2) Node.js Backend API Gateway (http://localhost:5001)"
        (cd server && npm run dev) &
        SERVER_PID=$!

        sleep 2

        echo "3) React Frontend Vite Client (http://localhost:5173)"
        (cd client && npm run dev) &
        CLIENT_PID=$!

        echo ""
        echo "✅ All services launched!"
        echo "   - Web App:      http://localhost:5173"
        echo "   - Backend API:  http://localhost:5001"
        echo "   - Swagger Docs: http://localhost:5001/api/docs"
        echo "   - ML Service:   http://127.0.0.1:8000/docs"
        echo ""
        echo "Press Ctrl+C to stop all services."
        wait
        ;;
    *)
        echo "Usage: ./start.sh [ml | server | client | all]"
        exit 1
        ;;
esac
