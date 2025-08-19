# Policy Radar API Testing Guide

## 🚀 Your Railway API is Live!

**API Base URL:** `https://your-app.railway.app` (replace with your actual URL)

## 📋 Testing Checklist

### 1. Basic Health Checks
```bash
# Root endpoint - should show API info
curl https://your-app.railway.app/

# Health check
curl https://your-app.railway.app/api/health
```

### 2. Document Endpoints
```bash
# Get all documents
curl https://your-app.railway.app/api/documents

# Filter by topic
curl "https://your-app.railway.app/api/documents?topic=hydrogen"

# Filter by source
curl "https://your-app.railway.app/api/documents?source=EUR-Lex"

# Search documents
curl "https://your-app.railway.app/api/documents?search=transport"

# Get recent documents (last 7 days)
curl "https://your-app.railway.app/api/documents?days=7"
```

### 3. Statistics & Metadata
```bash
# Dashboard stats
curl https://your-app.railway.app/api/stats

# Available topics
curl https://your-app.railway.app/api/topics

# Available sources
curl https://your-app.railway.app/api/sources
```

### 4. RAG Query (AI Question Answering)
```bash
# Test hydrogen query
curl -X POST https://your-app.railway.app/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the latest developments in hydrogen policy?"}'

# Test electric vehicle query
curl -X POST https://your-app.railway.app/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about electric vehicle infrastructure"}'
```

### 5. API Documentation
Visit: `https://your-app.railway.app/api/docs` for interactive API documentation

## 🖥️ Frontend Connection

### Option 1: Update Environment File
1. Copy `frontend/.env.railway` to `frontend/.env.production`
2. Replace `your-app` with your actual Railway app name
3. Build and deploy your frontend

### Option 2: Local Development
1. Copy `frontend/.env.railway` to `frontend/.env.local`
2. Update the URL with your Railway app name
3. Start local development: `npm start`

## 🔧 Frontend Configuration

Your frontend is already configured to use environment variables:

```typescript
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001/api';
```

Just set `REACT_APP_API_BASE_URL=https://your-app.railway.app/api` in your environment file.

## ✅ Expected API Responses

### Sample Document Response
```json
{
  "documents": [
    {
      "id": "sample-1",
      "title": "EU Hydrogen Strategy for a Climate-Neutral Europe",
      "summary": "The European Commission presents its strategy...",
      "source": "EUR-Lex",
      "doc_type": "strategy",
      "url": "https://eur-lex.europa.eu/...",
      "published": "2020-07-08T00:00:00",
      "topics": ["hydrogen", "climate", "energy"],
      "language": "en"
    }
  ],
  "total": 1
}
```

### Sample Stats Response
```json
{
  "total_documents": 3,
  "active_procedures": 0,
  "this_week": 0,
  "sources": [
    {"name": "EUR-Lex", "count": 1},
    {"name": "EURACTIV", "count": 1},
    {"name": "EP Open Data", "count": 1}
  ],
  "document_types": [
    {"name": "strategy", "count": 1},
    {"name": "news", "count": 1},
    {"name": "resolution", "count": 1}
  ]
}
```

## 🐛 Troubleshooting

- **CORS errors**: Check that `*.railway.app` is in CORS origins (already configured)
- **404 errors**: Verify the Railway URL is correct
- **API docs not loading**: Visit `/api/docs` directly
- **No documents**: API creates sample data automatically when no files exist

## 📝 Next Steps

1. Test all endpoints with your actual Railway URL
2. Connect your frontend to the Railway API
3. Upload real policy documents to replace sample data
4. Configure any additional environment variables needed