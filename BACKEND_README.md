# Policy Radar Backend

Brussels public affairs platform with AI-enhanced document tracking - **Backend API & RAG Service**

## 🏗️ Architecture

FastAPI backend providing REST endpoints for policy document analysis with RAG (Retrieval-Augmented Generation) capabilities.

```
[Frontend] ←→ [FastAPI API] ←→ [Vector Store] ←→ [RAG Service]
                    ↓              ↓              ↓
              [REST Endpoints] [FAISS Index] [OpenAI/Anthropic]
                    ↓
             [Data Ingestion]
              ↓     ↓      ↓
        [EURACTIV] [EUR-Lex] [EP Open Data]
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Virtual environment (recommended)
- OpenAI API key or Anthropic API key

### 1. Environment Setup

```bash
# Clone repository
git clone https://github.com/pjdevos/PolicyRadar-Backend.git
cd PolicyRadar-Backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Required: At least one AI API key
API__OPENAI_API_KEY=sk-your-openai-key
# OR
API__ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
```

### 3. Start Development Server

```bash
# Start API server
python api_server.py

# Or use uvicorn directly
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
```

### 4. Initial Data Setup

```bash
# Ingest sample data
curl -X POST http://localhost:8000/api/ingest \
  -H 'Content-Type: application/json' \
  -d '{"topic": "hydrogen", "days": 30}'

# Test the API
./test_api.sh  # Linux/Mac
# or
test_api.bat   # Windows
```

## 📡 API Endpoints

### Core Endpoints
- `GET /api/health` - Service health check
- `GET /api/docs` - Interactive API documentation
- `GET /api/redoc` - ReDoc API documentation

### Document Management
- `GET /api/documents` - Get policy documents with filters
- `GET /api/stats` - Dashboard statistics
- `GET /api/topics` - Available topics
- `GET /api/sources` - Available data sources

### AI & RAG
- `POST /api/rag/query` - AI-powered Q&A with document retrieval
- `POST /api/ingest` - Trigger data collection and vector indexing

### Query Parameters
```bash
# Document filtering
GET /api/documents?topic=climate&source=euractiv&days=7&limit=50

# RAG query
POST /api/rag/query
{
  "query": "What are the latest EU policies on renewable energy?",
  "k": 8
}
```

## 🔧 Configuration

### Environment Variables

The backend uses a comprehensive typed configuration system with Pydantic Settings:

```bash
# Environment
ENVIRONMENT=development
DEBUG=true

# API Server
API__HOST=0.0.0.0
API__PORT=8000
API__SECRET_KEY=your-secret-key

# External APIs (at least one required)
API__OPENAI_API_KEY=sk-your-key
API__ANTHROPIC_API_KEY=sk-ant-your-key

# Rate Limiting
API__DEFAULT_RATE_LIMIT=100
API__RAG_RATE_LIMIT=10
API__INGEST_RATE_LIMIT=5

# Security
SECURITY__MAX_QUERY_LENGTH=500
SECURITY__TRUSTED_HOSTS=localhost,*.vercel.app,*.railway.app

# RAG Settings
RAG__LLM_PROVIDER=openai
RAG__LLM_MODEL=gpt-3.5-turbo
RAG__MAX_TOKENS=4000
```

See `.env.example` for complete configuration options.

## 🛡️ Security Features

- **Rate Limiting**: Configurable per-endpoint rate limits
- **CORS Protection**: Strict origin validation
- **Input Validation**: Comprehensive request sanitization
- **Security Headers**: HSTS, CSP, XSS protection
- **Secrets Management**: Proper environment variable handling

## 🧠 RAG (AI) Features

### Supported Providers
- **OpenAI**: GPT-3.5-turbo, GPT-4, text-embedding-ada-002
- **Anthropic**: Claude models

### Vector Search
- **FAISS**: High-performance similarity search
- **Multilingual**: Supports multiple EU languages
- **Chunked Documents**: Efficient document segmentation

### Query Processing
- Query expansion and refinement
- Source attribution and citations
- Confidence scoring
- Processing time tracking

## 📊 Data Sources

### Supported Sources
1. **EURACTIV RSS**: EU policy news and analysis
2. **EUR-Lex**: Official EU legal documents
3. **European Parliament**: Open data API

### Data Pipeline
1. **Ingestion**: Fetch data from multiple sources
2. **Processing**: Clean and structure documents
3. **Vectorization**: Create embeddings for similarity search
4. **Indexing**: Build FAISS vector index
5. **Storage**: Persist to local files

## 🔄 Development

### Project Structure
```
PolicyRadar-Backend/
├── api_server.py              # Main FastAPI application
├── config/
│   └── settings.py           # Typed configuration system
├── rag_service.py            # RAG implementation
├── vector_indexer.py         # Vector indexing utilities
├── poc_policy_radar.py       # Data ingestion pipeline
├── requirements.txt          # Python dependencies
├── .env.example             # Environment template
├── nixpacks.toml            # Railway deployment config
└── tests/                   # Test files
```

### Adding New Features

1. **New Endpoints**: Add to `api_server.py`
2. **Data Sources**: Extend `poc_policy_radar.py`
3. **RAG Models**: Configure in `rag_service.py`
4. **Configuration**: Update `config/settings.py`

### Testing

```bash
# Run API tests
./test_api.sh

# Test specific endpoint
curl http://localhost:8000/api/health

# Test RAG endpoint
curl -X POST http://localhost:8000/api/rag/query \
  -H 'Content-Type: application/json' \
  -d '{"query": "EU climate policy"}'
```

## 🚀 Deployment

### Railway (Recommended)

The backend is configured for Railway deployment:

1. **Connect Repository**: Link to Railway
2. **Environment Variables**: Set in Railway dashboard
3. **Deploy**: Automatic deployment on push

### Environment Variables for Production
```bash
ENVIRONMENT=production
API__SECRET_KEY=your-production-secret
API__OPENAI_API_KEY=your-production-key
API__CORS_ORIGINS=https://your-frontend.vercel.app
```

### Docker (Alternative)

```bash
# Build image
docker build -t policyradar-backend .

# Run container
docker run -p 8000:8000 --env-file .env policyradar-backend
```

## 🔍 Monitoring & Logging

- **Health Checks**: Built-in health endpoint
- **Structured Logging**: Configurable log levels
- **Error Tracking**: Comprehensive error handling
- **Performance Metrics**: Processing time tracking

## 🤝 API Integration

### Frontend Integration
```typescript
// Frontend configuration
const API_BASE_URL = 'https://your-backend.railway.app/api';

// Example usage
const response = await fetch(`${API_BASE_URL}/documents?topic=climate`);
const data = await response.json();
```

### Rate Limiting Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📋 Requirements

- Python 3.8+
- FastAPI 0.104+
- Pydantic 2.5+
- OpenAI or Anthropic API access
- 2GB+ RAM (for vector indexing)

## 🐛 Troubleshooting

### Common Issues

1. **Vector Index Not Found**
   ```bash
   # Run data ingestion first
   curl -X POST http://localhost:8000/api/ingest \
     -H 'Content-Type: application/json' \
     -d '{"topic": "test", "days": 7}'
   ```

2. **API Key Errors**
   ```bash
   # Check environment variables
   python -c "from config.settings import settings; print(settings.api.OPENAI_API_KEY)"
   ```

3. **CORS Issues**
   ```bash
   # Update CORS origins in .env
   API__CORS_ORIGINS=http://localhost:3000,https://your-domain.com
   ```

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Repositories

- **Frontend**: [PolicyRadar-Frontend](https://github.com/pjdevos/PolicyRadar-Frontend)
- **Documentation**: See individual README files