# Repository Split Migration Plan

## 📋 Overview

Split the current `PolicyRadar-Frontend` repository into two focused repositories:
- **PolicyRadar-Backend** (Python/FastAPI)
- **PolicyRadar-Frontend** (React/TypeScript) - cleaned up

## 🔄 Step-by-Step Migration

### Phase 1: Create Backend Repository

1. **Create New Repository**
   ```bash
   # On GitHub, create new repository: PolicyRadar-Backend
   git clone https://github.com/pjdevos/PolicyRadar-Backend.git
   cd PolicyRadar-Backend
   ```

2. **Copy Backend Files**
   ```bash
   # Core Python files
   cp ../PolicyRadar-Frontend/api_server.py .
   cp ../PolicyRadar-Frontend/rag_service.py .
   cp ../PolicyRadar-Frontend/vector_indexer.py .
   cp ../PolicyRadar-Frontend/poc_policy_radar.py .
   cp ../PolicyRadar-Frontend/poc_policy_radar_complete.py .
   
   # Configuration
   cp -r ../PolicyRadar-Frontend/config .
   cp ../PolicyRadar-Frontend/.env.example .
   cp ../PolicyRadar-Frontend/requirements.txt .
   
   # Deployment & Scripts
   cp ../PolicyRadar-Frontend/backend_nixpacks.toml nixpacks.toml
   cp ../PolicyRadar-Frontend/start_backend.sh .
   cp ../PolicyRadar-Frontend/start_backend.bat .
   cp ../PolicyRadar-Frontend/start_dev.sh .
   cp ../PolicyRadar-Frontend/start_dev.bat .
   cp ../PolicyRadar-Frontend/deploy.sh .
   cp ../PolicyRadar-Frontend/deploy.bat .
   
   # Testing
   cp ../PolicyRadar-Frontend/test_api.sh .
   cp ../PolicyRadar-Frontend/test_api.bat .
   cp ../PolicyRadar-Frontend/test_integration.py .
   cp ../PolicyRadar-Frontend/test_railway_api.py .
   cp ../PolicyRadar-Frontend/test_simple.py .
   cp ../PolicyRadar-Frontend/test_your_api.py .
   
   # Documentation
   cp ../PolicyRadar-Frontend/BACKEND_README.md README.md
   cp ../PolicyRadar-Frontend/DEPLOYMENT.md .
   cp ../PolicyRadar-Frontend/TESTING_GUIDE.md .
   
   # Utilities (optional)
   cp ../PolicyRadar-Frontend/simple_api.py .
   cp ../PolicyRadar-Frontend/simple_indexer.py .
   cp ../PolicyRadar-Frontend/complete_file_bundle.py .
   cp ../PolicyRadar-Frontend/app.py .
   cp ../PolicyRadar-Frontend/api_server_prod.py .
   cp ../PolicyRadar-Frontend/api_server_simple.py .
   ```

3. **Setup Backend Repository**
   ```bash
   # Create .gitignore
   cat > .gitignore << EOF
   # Python
   __pycache__/
   *.py[cod]
   *$py.class
   *.so
   .Python
   env/
   venv/
   .venv/
   .pyenv
   dist/
   build/
   *.egg-info/

   # Data & Models
   data/
   vectors/
   logs/
   backups/
   *.jsonl
   *.csv
   *.pkl
   *.index
   *.faiss
   *.model

   # Environment & Secrets
   .env
   .env.local
   .env.development
   .env.test
   .env.production
   .env.staging
   *.key
   *.pem
   *.crt
   secrets/

   # IDE & Editors
   .vscode/
   .idea/
   *.swp
   *.swo

   # OS & System
   .DS_Store
   Thumbs.db

   # Logs & Monitoring
   *.log
   *.log.*

   # Testing
   .pytest_cache/
   .coverage
   htmlcov/
   .tox/

   # Temporary files
   *.tmp
   *.temp
   .cache/
   temp/

   # Database files
   *.db
   *.sqlite
   *.sqlite3
   EOF
   
   # Initial commit
   git add .
   git commit -m "Initial backend repository setup
   
   - FastAPI application with RAG capabilities
   - Typed configuration system with Pydantic
   - Data ingestion pipeline for EU policy documents
   - Vector search with FAISS
   - Comprehensive API endpoints
   - Security features and rate limiting
   - Railway deployment configuration
   
   Migrated from PolicyRadar-Frontend repository split."
   
   git push origin main
   ```

### Phase 2: Clean Up Frontend Repository

1. **Remove Backend Files**
   ```bash
   cd PolicyRadar-Frontend
   
   # Remove Python files
   rm -f *.py
   rm -rf config/
   rm -f requirements.txt
   
   # Remove backend scripts
   rm -f start_backend.*
   rm -f start_dev.*
   rm -f deploy.*
   rm -f test_api.*
   rm -f test_*.py
   rm -f TESTING_GUIDE.md
   
   # Remove backend utilities
   rm -f simple_*.py
   rm -f complete_file_bundle.py
   rm -f app.py
   rm -f api_server*.py
   rm -f poc_policy_radar*.py
   
   # Remove mixed deployment files
   rm -f backend_nixpacks.toml
   rm -f BACKEND_*.md
   rm -f BACKEND_FILES.md
   rm -f MIGRATION_PLAN.md
   
   # Remove backend-related directories
   rm -rf railway-app/
   rm -rf PolicyDashboard/ # if it's a submodule
   rm -rf data/
   rm -rf vectors/
   rm -rf logs/
   rm -rf venv/
   ```

2. **Update Frontend Configuration**
   ```bash
   # Update root nixpacks.toml (keep frontend version)
   # This should only have Node.js/React build commands
   
   # Update package.json if needed
   # Ensure it only contains frontend dependencies
   
   # Update .env.example for frontend-only vars
   cp FRONTEND_README.md README.md
   ```

3. **Update .gitignore**
   ```bash
   cat > .gitignore << EOF
   # Dependencies
   node_modules/
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*

   # Production builds
   build/
   dist/

   # Environment files
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local

   # IDE
   .vscode/
   .idea/
   *.swp
   *.swo

   # OS
   .DS_Store
   .DS_Store?
   ._*
   Thumbs.db
   desktop.ini

   # Logs
   *.log
   logs/

   # Testing
   coverage/
   .nyc_output/
   .jest/

   # Temporary files
   *.tmp
   *.temp
   .cache/

   # Misc
   .eslintcache
   EOF
   ```

4. **Commit Frontend Cleanup**
   ```bash
   git add .
   git commit -m "Clean up repository - remove backend files
   
   - Remove all Python/FastAPI backend files
   - Remove backend deployment configurations  
   - Remove backend testing and utility files
   - Update documentation to be frontend-focused
   - Repository now contains only React/TypeScript frontend
   
   Backend moved to PolicyRadar-Backend repository."
   
   git push origin main
   ```

### Phase 3: Update Deployment Configurations

1. **Backend Railway Setup**
   ```bash
   # In Railway dashboard:
   # 1. Create new service for backend
   # 2. Connect to PolicyRadar-Backend repository
   # 3. Set environment variables:
   
   ENVIRONMENT=production
   API__SECRET_KEY=your-production-secret
   API__OPENAI_API_KEY=your-openai-key
   API__CORS_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.railway.app
   ```

2. **Frontend Railway/Vercel Setup**
   ```bash
   # Update existing Railway service or migrate to Vercel
   # Set environment variables:
   
   REACT_APP_API_BASE_URL=https://your-backend.railway.app/api
   REACT_APP_ENVIRONMENT=production
   ```

### Phase 4: Update Cross-References

1. **Update Frontend API Configuration**
   ```typescript
   // In frontend config
   const API_BASE_URL = 'https://policyradar-backend-production.railway.app/api';
   ```

2. **Update Backend CORS**
   ```python
   # In backend settings
   API__CORS_ORIGINS=https://policyradar-frontend-production.railway.app,https://your-app.vercel.app
   ```

3. **Update Documentation**
   - Link repositories to each other
   - Update deployment instructions
   - Update API endpoint references

## ✅ Validation Checklist

- [ ] Backend repository created with all Python files
- [ ] Backend deploys successfully on Railway
- [ ] Backend API responds to health checks
- [ ] Frontend repository cleaned of Python files  
- [ ] Frontend builds and deploys successfully
- [ ] Frontend can connect to backend API
- [ ] CORS configuration allows frontend→backend communication
- [ ] Environment variables configured correctly
- [ ] Documentation updated and cross-linked
- [ ] CI/CD pipelines work independently

## 🔗 Final Repository Structure

### PolicyRadar-Backend
```
├── api_server.py
├── config/settings.py
├── rag_service.py
├── vector_indexer.py
├── requirements.txt
├── nixpacks.toml
├── .env.example
└── README.md
```

### PolicyRadar-Frontend (Cleaned)
```
├── src/
├── public/
├── package.json
├── nixpacks.toml
├── .env.example
└── README.md
```

## 🚀 Benefits After Split

- ✅ **Clear Naming**: Repository names match their contents
- ✅ **Independent CI/CD**: Separate build pipelines
- ✅ **Focused Dependencies**: No mixing of pip and npm
- ✅ **Better Security Scanning**: Language-specific tools
- ✅ **Independent Scaling**: Deploy frontend and backend separately
- ✅ **Clear Ownership**: Teams can own specific repositories
- ✅ **Reduced Complexity**: Simpler deployment configurations