# Policy Radar

Brussels public affairs platform with AI-enhanced document tracking.

> **⚠️ Repository Split Notice**: This repository is being restructured for better maintainability. 
> 
> - **Backend** (Python/FastAPI): Moving to [PolicyRadar-Backend](https://github.com/pjdevos/PolicyRadar-Backend)
> - **Frontend** (React/TypeScript): Staying in this repository

## 🏗️ New Architecture

```
PolicyRadar-Frontend          PolicyRadar-Backend
[React Dashboard]      ←→     [FastAPI API]
[Search Interface]     ←→     [RAG Service] 
[RAG Chat UI]          ←→     [Vector Store]
[Statistics View]      ←→     [Data Ingestion]
```

## 📦 Current Repository Contents

This repository contains:
- **Frontend React application** (`/frontend`)
- **Migration preparation files** (temporary)
- **Backend files** (being moved to separate repo)

## 🚀 Quick Start (Transition Period)

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Backend Development  
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start backend server
python api_server.py
```

## 🔄 Migration Status

- [x] **Backend files prepared** for separate repository
- [x] **Deployment configurations** updated
- [x] **Documentation** prepared for split
- [ ] **Backend repository** created
- [ ] **Frontend cleanup** completed
- [ ] **Cross-repository** links updated

## 📋 Migration Plan

See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for detailed steps.

### Files Moving to Backend Repo
- All `*.py` files (API, RAG, indexing, ingestion)
- `requirements.txt`
- `config/` directory
- Backend deployment configs
- Backend documentation

### Files Staying in Frontend Repo
- `frontend/` directory (React app)
- Frontend `package.json`
- Frontend deployment configs
- Frontend documentation

## 🔗 Related Repositories

- **Backend API**: [PolicyRadar-Backend](https://github.com/pjdevos/PolicyRadar-Backend) *(coming soon)*
- **Frontend Dashboard**: [PolicyRadar-Frontend](https://github.com/pjdevos/PolicyRadar-Frontend) *(this repo)*

## 📡 API Integration

The frontend connects to the backend API:

```typescript
// Frontend configuration
const API_BASE_URL = 'https://policyradar-backend-production.up.railway.app/api';

// Example API calls
const documents = await apiClient.getDocuments({ topic: 'climate' });
const ragResponse = await apiClient.queryRAG({ query: 'EU energy policy' });
```

## 🛡️ Features

### Backend (Moving to separate repo)
- **FastAPI REST API** with comprehensive endpoints
- **RAG Q&A system** with OpenAI/Anthropic integration
- **Vector search** with FAISS indexing
- **Data ingestion** from EURACTIV, EUR-Lex, EP Open Data
- **Security features** with rate limiting and CORS
- **Typed configuration** with Pydantic Settings

### Frontend (This repository)
- **React dashboard** with modern UI
- **Document browser** with advanced filtering
- **RAG chat interface** for natural language queries
- **Real-time statistics** and analytics
- **Responsive design** for all devices
- **TypeScript** with full type safety

## 🚀 Deployment

### Current (Temporary)
- **Frontend + Backend**: Railway deployment
- **Mixed repository**: Both Python and Node.js

### After Split
- **Frontend**: Vercel/Railway (Node.js only)
- **Backend**: Railway (Python only)
- **Independent CI/CD**: Separate build pipelines

## 📄 Documentation

- **Current docs**: See individual README files
- **API docs**: Available at `/api/docs` when backend is running
- **Migration guide**: [MIGRATION_PLAN.md](./MIGRATION_PLAN.md)

## 🤝 Contributing

During the migration period:
1. **Frontend changes**: Make in `/frontend` directory
2. **Backend changes**: Will be moved to separate repo
3. **Documentation**: Update both repositories

## 📄 License

MIT License - see LICENSE file for details.

---

**🔄 This repository is in transition. Check back soon for the cleaned-up frontend-only version!**
