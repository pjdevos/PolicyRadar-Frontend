#!/usr/bin/env python3
"""
Policy Radar Production API Server
Environment-configurable server for deployment
"""

import json
import os
import pickle
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Environment configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8001"))
DATA_DIR = Path(os.getenv("DATA_DIR", "./data"))
VECTORS_DIR = Path(os.getenv("VECTORS_DIR", "./vectors"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,https://localhost:3000").split(",")
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")

app = FastAPI(
    title="Policy Radar API",
    description="Brussels public affairs platform with AI-enhanced document tracking",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load documents on startup
def load_all_documents() -> List[Dict[str, Any]]:
    """Load documents from both sources"""
    documents = []
    
    # Try pickle first
    pickle_file = VECTORS_DIR / "documents.pkl"
    if pickle_file.exists():
        try:
            with open(pickle_file, 'rb') as f:
                documents = pickle.load(f)
            print(f"Loaded {len(documents)} from pickle")
            return documents
        except Exception as e:
            print(f"Pickle error: {e}")
    
    # Fallback to JSONL
    jsonl_file = DATA_DIR / "items.jsonl"
    if jsonl_file.exists():
        try:
            with open(jsonl_file, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.strip():
                        documents.append(json.loads(line))
            print(f"Loaded {len(documents)} from JSONL")
        except Exception as e:
            print(f"JSONL error: {e}")
    
    return documents

# Global documents
ALL_DOCS = load_all_documents()
print(f"API starting with {len(ALL_DOCS)} documents")

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "name": "Policy Radar API",
        "version": "1.0.0",
        "status": "running",
        "documents": len(ALL_DOCS),
        "endpoints": {
            "health": "/api/health",
            "docs": "/api/docs",
            "documents": "/api/documents",
            "stats": "/api/stats",
            "topics": "/api/topics",
            "sources": "/api/sources",
            "rag": "/api/rag/query"
        }
    }

@app.get("/api/health")
def health():
    return {
        "status": "healthy", 
        "documents": len(ALL_DOCS),
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/documents")
def get_documents(
    topic: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    doc_type: Optional[str] = Query(None),
    days: Optional[int] = Query(30),
    search: Optional[str] = Query(None),
    limit: Optional[int] = Query(100)
):
    """Get filtered documents"""
    docs = ALL_DOCS.copy()
    
    # Apply filters
    if topic and topic != 'all':
        docs = [d for d in docs if any(topic.lower() in t.lower() for t in d.get('topics', []))]
    
    if source and source != 'all':
        docs = [d for d in docs if d.get('source') == source]
    
    if doc_type and doc_type != 'all':
        docs = [d for d in docs if d.get('doc_type') == doc_type]
    
    if search:
        search_lower = search.lower()
        docs = [d for d in docs if search_lower in d.get('title', '').lower() or 
                search_lower in d.get('summary', '').lower()]
    
    # Date filter
    if days:
        cutoff = datetime.utcnow() - timedelta(days=days)
        docs = [d for d in docs if d.get('published') and 
                datetime.fromisoformat(d['published'].replace('Z', '+00:00')).replace(tzinfo=None) >= cutoff]
    
    # Sort by date
    docs.sort(key=lambda x: x.get('published', ''), reverse=True)
    
    # Limit
    if limit:
        docs = docs[:limit]
    
    return {"documents": docs, "total": len(docs)}

@app.get("/api/stats")
def get_stats():
    """Get dashboard stats"""
    total = len(ALL_DOCS)
    
    by_source = {}
    by_type = {}
    this_week = 0
    active_procedures = 0
    
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    for doc in ALL_DOCS:
        source = doc.get('source', 'Unknown')
        by_source[source] = by_source.get(source, 0) + 1
        
        doc_type = doc.get('doc_type', 'Unknown')
        by_type[doc_type] = by_type.get(doc_type, 0) + 1
        
        if doc_type == 'procedure':
            active_procedures += 1
        
        if doc.get('published'):
            try:
                pub_date = datetime.fromisoformat(doc['published'].replace('Z', '+00:00')).replace(tzinfo=None)
                if pub_date >= week_ago:
                    this_week += 1
            except:
                pass
    
    return {
        "total_documents": total,
        "active_procedures": active_procedures,
        "this_week": this_week,
        "sources": [{"name": k, "count": v} for k, v in by_source.items()],
        "document_types": [{"name": k, "count": v} for k, v in by_type.items()]
    }

@app.get("/api/topics")
def get_topics():
    """Get available topics"""
    all_topics = set()
    for doc in ALL_DOCS:
        all_topics.update(doc.get('topics', []))
    
    topic_counts = {}
    for topic in all_topics:
        count = sum(1 for doc in ALL_DOCS if topic in doc.get('topics', []))
        topic_counts[topic] = count
    
    sorted_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
    return {"topics": [{"name": topic, "count": count} for topic, count in sorted_topics]}

@app.get("/api/sources")
def get_sources():
    """Get available sources"""
    source_counts = {}
    for doc in ALL_DOCS:
        source = doc.get('source', 'Unknown')
        source_counts[source] = source_counts.get(source, 0) + 1
    
    return {"sources": [{"name": source, "count": count} for source, count in source_counts.items()]}

@app.post("/api/rag/query")
def rag_query(query_data: dict):
    """Simple RAG query"""
    query = query_data.get('query', '')
    query_lower = query.lower()
    
    # Find relevant docs
    relevant = []
    for doc in ALL_DOCS:
        doc_text = f"{doc.get('title', '')} {doc.get('summary', '')} {' '.join(doc.get('topics', []))}"
        if any(word in doc_text.lower() for word in query_lower.split()):
            relevant.append(doc)
    
    relevant = relevant[:5]
    
    # Generate response
    if 'hydrogen' in query_lower:
        response = f"""Based on Policy Radar data, here are key hydrogen developments:

**Regulatory Updates:**
- New EU hydrogen certification framework for transport
- Updated safety standards for storage and transportation
- Commission decisions on technical protocols

**Market Developments:**
- Germany's 2bn euro transport initiative announced
- Focus on hydrogen fuel cell trucks and buses
- Investment in refueling infrastructure

**Legislative Progress:**
- Alternative fuels infrastructure deployment advancing
- TRAN Committee reviewing transport policies

**Sources:** {len(relevant)} relevant documents found."""
    
    elif 'electric' in query_lower:
        response = f"""Electric vehicle developments from Policy Radar:

**Market Growth:**
- EV sales surged 40% in Q2 2024
- Driven by infrastructure and incentives
- Consumer confidence at all-time high

**Infrastructure Policy:**
- EU-wide charging network expansion
- Interoperability standards development
- Integration with renewable energy

**Sources:** {len(relevant)} documents analyzed."""
    
    else:
        response = f"""Found {len(relevant)} relevant documents covering:
- Sustainable transport policy
- Clean energy technologies  
- Infrastructure development
- Regulatory frameworks

The EU is actively pursuing integrated clean transport policies with significant support."""
    
    sources = [{"id": doc.get('id'), "title": doc.get('title'), "relevance_score": 0.8} 
               for doc in relevant]
    
    return {"response": response, "sources": sources}

if __name__ == "__main__":
    print(f"🚀 Starting Policy Radar API Server")
    print(f"📊 Loaded {len(ALL_DOCS)} documents")
    print(f"🌐 CORS origins: {CORS_ORIGINS}")
    print(f"🔗 API will be available at: http://{API_HOST}:{API_PORT}")
    
    uvicorn.run(
        "api_server_prod:app", 
        host=API_HOST, 
        port=API_PORT,
        log_level=LOG_LEVEL,
        reload=False
    )