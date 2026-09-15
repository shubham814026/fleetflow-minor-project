"""
SmartFleet AI - Microservice Launcher
Runs FastAPI inference service on port 8000
"""
import sys
import os
import uvicorn

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting SmartFleet AI Inference Microservice on http://127.0.0.1:8000 ...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False, workers=1)
