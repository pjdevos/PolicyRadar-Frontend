#!/usr/bin/env python3
"""
Policy Radar FastAPI Backend

Provides REST API endpoints for the Policy Radar dashboard.
Connects PoC data ingestion, vector search, and RAG functionality.

Usage:
  uvicorn api_server:app --reload --host 0.0.0.0 --port 8000
"""

import json
import os
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Import our existing modules
import sys
sys.path.append('.')
try:
    from vector_indexer import PolicyVectorStore
    from rag_service import PolicyRAGService
    import subprocess
except ImportError as e:
    print(f"Warning: Could not import modules: {e}")
    print("Make sure vector_indexer.py and rag_service.py are in the same directory")

# Configuration
DATA_DIR = Path("./data")
VECTORS_DIR = Path("./vectors")
INDEX_PATH = VECTORS_DIR / "policy_index"

# Pydantic models for API
class DocumentFilter(BaseModel):
    topic: Optional[str] = None
    source: Optional[str] = None
    doc_type: Optional[str] = None
    days: Optional[int] = 30
    search: Optional[str] = None
    limit: Optional[int] = 100

class RAGQuery(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    source_filter: Optional[str] = None
    doc_type_filter: Optional[str] = None
    k: Optional[int] = Field(default=8, ge=1, le=20)

class RAGResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    query_expansion: List[str]
    confidence: float
    processing_time: float

class IngestRequest(BaseModel):
    topic: str = Field(..., min_length=1)
    days: Optional[int] = Field(default=30, ge=1, le=365)
    rebuild_index: Optional[bool] = False

class StatsResponse(BaseModel):
    total_documents: int
    by_source: Dict[str, int]
    by_doc_type: Dict[str, int]
    recent_activity: Dict[str, int]
    last_update: Optional[str]

# FastAPI app
app = FastAPI(
    title="Policy Radar API",
    description="Brussels public affairs platform with AI-enhanced document tracking",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
vector_store: Optional[PolicyVectorStore] = None
rag_service: Optional[PolicyRAGService] = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global vector_store, rag_service

    print("🚀 Starting Policy Radar API...")

    # Create directories
    DATA_DIR.mkdir(exist_ok=True)
    VECTORS_DIR.mkdir(exist_ok=True)

    # Try to load existing vector index
    if INDEX_PATH.exists():
        try:
            print("📚 Loading existing vector index...")
            vector_store = PolicyVectorStore()
            vector_store.load_index(str(INDEX_PATH))

            rag_service = PolicyRAGService(str(INDEX_PATH))
            print("✅ Vector store and RAG service initialized")
        except Exception as e:
            print(f"⚠️  Could not load vector index: {e}")
            print("Run data ingestion first: POST /api/ingest")
    else:
        print("ℹ️  No vector index found. Run data ingestion first.")

def load_documents_from_jsonl() -> List[Dict[str, Any]]:
    """Load documents from the latest JSONL file"""
    jsonl_path = DATA_DIR / "items.jsonl"

    if not jsonl_path.exists():
        return []

    documents = []
    try:
        with open(jsonl_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    documents.append(json.loads(line))
    except Exception as e:
        print(f"Error loading documents: {e}")
        return []

    return documents

def filter_documents(documents: List[Dict], filters: DocumentFilter) -> List[Dict]:
    """Apply filters to document list"""
    filtered = documents.copy()

    # Date filter
    if filters.days:
        cutoff = datetime.utcnow() - timedelta(days=filters.days)
        filtered = [
            doc for doc in filtered 
            if doc.get('published') and 
            datetime.fromisoformat(doc['published'].replace('Z', '+00:00')).replace(tzinfo=None) >= cutoff
        ]

    # Topic filter
    if filters.topic and filters.topic != 'all':
        filtered = [
            doc for doc in filtered
            if any(filters.topic.lower() in topic.lower() for topic in doc.get('topics', []))
        ]

    # Source filter
    if filters.source and filters.source != 'all':
        filtered = [doc for doc in filtered if doc.get('source') == filters.source]

    # Document type filter
    if filters.doc_type and filters.doc_type != 'all':
        filtered = [doc for doc in filtered if doc.get('doc_type') == filters.doc_type]

    # Search filter
    if filters.search:
        search_term = filters.search.lower()
        filtered = [
            doc for doc in filtered
            if (search_term in doc.get('title', '').lower() or
                search_term in doc.get('summary', '').lower() or
                any(search_term in topic.lower() for topic in doc.get('topics', [])))
        ]

    # Sort by date (newest first)
    filtered.sort(key=lambda x: x.get('published', ''), reverse=True)

    # Limit results
    if filters.limit:
        filtered = filtered[:filters.limit]

    return filtered

# API Endpoints

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "vector_store_loaded": vector_store is not None,
        "rag_service_loaded": rag_service is not None
    }

@app.get("/api/documents")
async def get_documents(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    source: Optional[str] = Query(None, description="Filter by source"),
    doc_type: Optional[str] = Query(None, description="Filter by document type"),
    days: Optional[int] = Query(30, description="Number of days to look back"),
    search: Optional[str] = Query(None, description="Search term"),
    limit: Optional[int] = Query(100, description="Maximum number of results")
):
    """Get policy documents with optional filters"""

    documents = load_documents_from_jsonl()

    if not documents:
        raise HTTPException(
            status_code=404, 
            detail="No documents found. Run data ingestion first."
        )

    filters = DocumentFilter(
        topic=topic,
        source=source, 
        doc_type=doc_type,
        days=days,
        search=search,
        limit=limit
    )

    filtered_docs = filter_documents(documents, filters)

    return {
        "documents": filtered_docs,
        "total": len(filtered_docs),
        "filters_applied": filters.dict(),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get dashboard statistics"""

    documents = load_documents_from_jsonl()

    if not documents:
        return StatsResponse(
            total_documents=0,
            by_source={},
            by_doc_type={},
            recent_activity={},
            last_update=None
        )

    # Calculate stats
    by_source = {}
    by_doc_type = {}
    recent_activity = {"last_7_days": 0, "last_30_days": 0}

    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    for doc in documents:
        # Source stats
        source = doc.get('source', 'Unknown')
        by_source[source] = by_source.get(source, 0) + 1

        # Doc type stats
        doc_type = doc.get('doc_type', 'Unknown')
        by_doc_type[doc_type] = by_doc_type.get(doc_type, 0) + 1

        # Recent activity
        if doc.get('published'):
            try:
                pub_date = datetime.fromisoformat(doc['published'].replace('Z', '+00:00')).replace(tzinfo=None)
                if pub_date >= week_ago:
                    recent_activity["last_7_days"] += 1
                if pub_date >= month_ago:
                    recent_activity["last_30_days"] += 1
            except:
                pass

    # Get last update time
    last_update = None
    jsonl_path = DATA_DIR / "items.jsonl"
    if jsonl_path.exists():
        last_update = datetime.fromtimestamp(jsonl_path.stat().st_mtime).isoformat()

    return StatsResponse(
        total_documents=len(documents),
        by_source=by_source,
        by_doc_type=by_doc_type,
        recent_activity=recent_activity,
        last_update=last_update
    )

@app.post("/api/rag/query", response_model=RAGResponse)
async def rag_query(query_request: RAGQuery):
    """Submit a RAG query for natural language Q&A"""

    if not rag_service:
        raise HTTPException(
            status_code=503,
            detail="RAG service not available. Run data ingestion first to build vector index."
        )

    start_time = datetime.utcnow()

    try:
        # Process query
        result = rag_service.query(
            query_request.query,
            source_filter=query_request.source_filter,
            doc_type_filter=query_request.doc_type_filter,
            k=query_request.k
        )

        # Convert sources to serializable format
        sources = []
        for chunk in result.sources:
            sources.append({
                "chunk_id": chunk.chunk_id,
                "doc_id": chunk.doc_id,
                "source": chunk.source,
                "doc_type": chunk.doc_type,
                "title": chunk.title,
                "content": chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content,
                "url": chunk.url,
                "published": chunk.published,
                "topics": chunk.topics
            })

        processing_time = (datetime.utcnow() - start_time).total_seconds()

        return RAGResponse(
            answer=result.answer,
            sources=sources,
            query_expansion=result.query_expansion,
            confidence=result.confidence,
            processing_time=processing_time
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing RAG query: {str(e)}"
        )

@app.post("/api/ingest")
async def trigger_ingest(request: IngestRequest, background_tasks: BackgroundTasks):
    """Trigger data ingestion and vector indexing"""

    def run_ingestion():
        """Background task for data ingestion"""
        try:
            print(f"🔄 Starting ingestion for topic: {request.topic}")

            # Run PoC data ingestion
            cmd = [
                "python", "poc_policy_radar.py",
                "--topic", request.topic,
                "--days", str(request.days),
                "--out", str(DATA_DIR)
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

            if result.returncode != 0:
                print(f"❌ Ingestion failed: {result.stderr}")
                return

            print("✅ Data ingestion completed")

            # Build/rebuild vector index
            if request.rebuild_index or not INDEX_PATH.exists():
                print("🔢 Building vector index...")

                cmd = [
                    "python", "vector_indexer.py",
                    "--input", str(DATA_DIR / "items.jsonl"),
                    "--index", str(INDEX_PATH)
                ]

                result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)

                if result.returncode != 0:
                    print(f"❌ Vector indexing failed: {result.stderr}")
                    return

                print("✅ Vector indexing completed")

                # Reload services
                global vector_store, rag_service
                try:
                    vector_store = PolicyVectorStore()
                    vector_store.load_index(str(INDEX_PATH))
                    rag_service = PolicyRAGService(str(INDEX_PATH))
                    print("🔄 Services reloaded")
                except Exception as e:
                    print(f"⚠️  Could not reload services: {e}")

        except Exception as e:
            print(f"❌ Ingestion task failed: {e}")

    # Start background task
    background_tasks.add_task(run_ingestion)

    return {
        "message": f"Data ingestion started for topic: {request.topic}",
        "estimated_duration": "2-5 minutes",
        "check_status": "/api/health"
    }

@app.get("/api/topics")
async def get_topics():
    """Get available topics from current dataset"""

    documents = load_documents_from_jsonl()

    all_topics = set()
    for doc in documents:
        all_topics.update(doc.get('topics', []))

    # Count documents per topic
    topic_counts = {}
    for topic in all_topics:
        count = sum(1 for doc in documents if topic in doc.get('topics', []))
        topic_counts[topic] = count

    # Sort by popularity
    sorted_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)

    return {
        "topics": [{"name": topic, "count": count} for topic, count in sorted_topics],
        "total_unique_topics": len(all_topics)
    }

@app.get("/api/sources")
async def get_sources():
    """Get available sources from current dataset"""

    documents = load_documents_from_jsonl()

    source_counts = {}
    for doc in documents:
        source = doc.get('source', 'Unknown')
        source_counts[source] = source_counts.get(source, 0) + 1

    return {
        "sources": [{"name": source, "count": count} for source, count in source_counts.items()],
        "total_sources": len(source_counts)
    }

# Development server
if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
