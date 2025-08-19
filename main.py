#!/usr/bin/env python3
"""
Main entry point for Policy Radar API
Imports the FastAPI app from api_server.py
"""

from api_server import app

if __name__ == "__main__":
    import os
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting Policy Radar API on port {port}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,
        log_level="info"
    )