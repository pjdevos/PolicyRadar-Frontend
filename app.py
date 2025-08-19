#!/usr/bin/env python3
"""
Minimal FastAPI app for Railway deployment
"""
import os
from fastapi import FastAPI

app = FastAPI(title="Policy Radar API", version="1.0.0")

@app.get("/")
def root():
    return {"message": "Policy Radar API is running", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/health")
def api_health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)