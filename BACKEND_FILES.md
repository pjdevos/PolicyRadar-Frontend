# Backend Repository Files

Files to move to PolicyRadar-Backend repository:

## Core Python Files
- `api_server.py` - Main FastAPI application
- `rag_service.py` - RAG implementation  
- `vector_indexer.py` - Vector indexing utilities
- `poc_policy_radar.py` - Data ingestion pipeline
- `poc_policy_radar_complete.py` - Complete ingestion implementation

## Configuration
- `config/settings.py` - Typed configuration system
- `config/__init__.py` - Package init
- `.env.example` - Environment template
- `requirements.txt` - Python dependencies

## Deployment & Scripts  
- `backend_nixpacks.toml` → `nixpacks.toml` - Railway deployment config
- `start_backend.sh` - Backend start script (Linux/Mac)
- `start_backend.bat` - Backend start script (Windows)
- `start_dev.sh` - Development server script
- `start_dev.bat` - Development server script (Windows)
- `deploy.sh` - Deployment script
- `deploy.bat` - Deployment script (Windows)

## Testing
- `test_api.sh` - API testing script
- `test_api.bat` - API testing script (Windows)  
- `test_integration.py` - Integration tests
- `test_railway_api.py` - Railway-specific tests
- `test_simple.py` - Simple API tests
- `test_your_api.py` - API validation tests

## Documentation
- `BACKEND_README.md` → `README.md` - Main backend documentation
- `DEPLOYMENT.md` - Deployment guide (backend parts)
- `TESTING_GUIDE.md` - Testing documentation

## Utilities (Optional - for data processing)
- `simple_api.py` - Simple API implementation
- `simple_indexer.py` - Simple vector indexing
- `complete_file_bundle.py` - File bundling utility
- `app.py` - Alternative app entry point
- `api_server_prod.py` - Production server config
- `api_server_simple.py` - Simplified server

## Environment Files (DO NOT MOVE - stays local)
- `.env` - Local environment (stays in .gitignore)
- `data/` - Data directory (stays in .gitignore)  
- `vectors/` - Vector index directory (stays in .gitignore)
- `logs/` - Log files (stays in .gitignore)

## Frontend Files (STAY IN FRONTEND REPO)
- `frontend/` - Entire frontend directory
- `frontend/nixpacks.toml` - Frontend deployment config
- `frontend/package.json` - Node.js dependencies
- `frontend/src/` - React source code

## Root Files (REMOVE FROM FRONTEND REPO)
- `nixpacks.toml` - Currently mixed, split into backend version
- `README.md` - Update to be frontend-focused
- Python-related root files move to backend