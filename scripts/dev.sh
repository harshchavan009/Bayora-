#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=========================================================="
echo "  Starting Bayora AI Safety Validation Platform (Local Dev)"
echo "=========================================================="

# Activate virtualenv
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Trap SIGINT to kill background jobs cleanly
trap 'kill $(jobs -p) 2>/dev/null || true; exit' SIGINT SIGTERM EXIT

# 1. Start Python FastAPI Control Plane
echo "[1/2] Launching Bayora Control Plane on http://localhost:8000..."
PYTHONPATH=backend python3 -m uvicorn bayora.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend health endpoint
sleep 1.5

# 2. Start Next.js Web Console
echo "[2/2] Launching Bayora Web Console on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo ">>> Bayora Platform running! <<<"
echo "Web Console: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "OpenAPI:     http://localhost:8000/docs"
echo ""

wait
