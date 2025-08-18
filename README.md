# Policy Radar

Brussels public affairs platform with AI-enhanced news feeds and document tracking.

## Features

- **Multi-source data ingestion**: EURACTIV RSS + EUR-Lex SPARQL + EP Open Data API
- **Vector search**: Multilingual semantic search with FAISS
- **RAG Q&A**: AI-powered question answering with source citations
- **Real-time dashboard**: React UI with filtering and analytics
- **REST API**: Complete backend for frontend integration

## Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### 2. Add Core Files

Copy these files from the artifacts:
- `poc_policy_radar.py` (your existing PoC)
- `vector_indexer.py` (vector indexing module)
- `rag_service.py` (RAG service)

### 3. Start Development Server

```bash
# Make scripts executable
chmod +x *.sh

# Start backend
./start_dev.sh
```

### 4. Initial Data Ingestion

```bash
# Ingest data for a specific topic
curl -X POST http://localhost:8000/api/ingest \
  -H 'Content-Type: application/json' \
  -d '{"topic": "hydrogen", "days": 30}'
```

### 5. Test the API

```bash
./test_api.sh
```

## API Endpoints

- `GET /api/health` - Service health check
- `GET /api/documents` - Get policy documents with filters
- `GET /api/stats` - Dashboard statistics
- `POST /api/rag/query` - AI-powered Q&A
- `POST /api/ingest` - Trigger data collection
- `GET /api/topics` - Available topics
- `GET /api/sources` - Available sources

## Architecture

```
[Frontend] ←→ [FastAPI] ←→ [Vector Store] ←→ [RAG Service]
    ↓              ↓              ↓
[React UI]   [REST API]   [FAISS Index]
                  ↓
           [Data Ingestion]
            ↓     ↓      ↓
      [EURACTIV] [EUR-Lex] [EP Open Data]
```

## Development

### API Documentation

Visit http://localhost:8000/api/docs for interactive API documentation.

### Adding New Features

1. **New data sources**: Extend `poc_policy_radar.py`
2. **API endpoints**: Add to `api_server.py`
3. **Frontend features**: Update React components

### Testing

```bash
# Test API endpoints
./test_api.sh

# Test specific endpoint
curl http://localhost:8000/api/health
```

## Production Deployment

See deployment guides for:
- Docker deployment
- Systemd service setup
- Nginx reverse proxy
- Environment configuration

## License

MIT License - see LICENSE file for details.
