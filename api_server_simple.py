#!/usr/bin/env python3
"""
Policy Radar FastAPI Backend - Simplified Version
Works with basic document storage without vector dependencies
"""

import json
import os
import pickle
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Configuration
DATA_DIR = Path("./data")
VECTORS_DIR = Path("./vectors")

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
    context_documents: Optional[List[str]] = None

class RAGResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]]

class StatsResponse(BaseModel):
    total_documents: int
    active_procedures: int
    this_week: int
    sources: List[Dict[str, int]]
    document_types: List[Dict[str, int]]

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
documents_cache: List[Dict[str, Any]] = []

def load_documents():
    """Load documents from cache or JSONL"""
    global documents_cache
    
    try:
        docs_file = VECTORS_DIR / "documents.pkl"
        if docs_file.exists():
            with open(docs_file, 'rb') as f:
                documents_cache = pickle.load(f)
        else:
            # Fallback to JSONL
            documents_cache = load_documents_from_jsonl()
    except Exception as e:
        print(f"Error loading documents: {e}")
        documents_cache = []

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("Starting Policy Radar API...")
    load_documents()
    print(f"Loaded {len(documents_cache)} documents")

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

def generate_mock_rag_response(query: str, relevant_docs: List[Dict]) -> str:
    """Generate a mock RAG response based on query and relevant documents"""
    query_lower = query.lower()
    
    if 'hydrogen' in query_lower:
        return f"""Based on recent Policy Radar data, here are key hydrogen developments:

**Regulatory Updates:**
- New EU hydrogen certification framework for transport applications
- Updated safety standards for hydrogen storage and transportation
- Commission decision establishing technical protocols

**Market Developments:**  
- Germany announced 2bn euro transport initiative targeting freight decarbonization
- Focus on hydrogen fuel cell trucks and buses
- Industry positioning for global leadership in hydrogen technology

**Legislative Progress:**
- Alternative fuels infrastructure deployment procedures advancing
- TRAN Committee actively reviewing transport policies
- Cross-border cooperation in infrastructure development

**Sources:**
{len(relevant_docs)} relevant documents found in Policy Radar database."""
    
    elif 'electric' in query_lower or 'ev' in query_lower:
        return f"""Electric vehicle developments from Policy Radar sources:

**Market Growth:**
- EV sales surged 40% in Q2 2024 across Europe
- Continued growth driven by infrastructure expansion and incentives
- Consumer confidence reached all-time high

**Infrastructure Policy:**
- Alternative fuels infrastructure deployment in progress
- EU-wide charging network expansion planned
- Interoperability standards being established

**Legislative Activity:**
- TRAN Committee hearing on future transport policy
- Parliamentary focus on sustainable transport solutions
- Integration with renewable energy systems

**Sources:**
{len(relevant_docs)} relevant documents analyzed from current dataset."""
    
    else:
        return f"""I found {len(relevant_docs)} relevant documents in Policy Radar for your query. The data includes recent updates from EUR-Lex, European Parliament procedures, and EURACTIV news coverage.

Key themes in the current dataset:
- Sustainable transport policy development
- Hydrogen and alternative fuels advancement
- Electric vehicle market growth
- Infrastructure deployment strategies

Based on the available documents, the EU is actively pursuing integrated policies for clean transport technologies with significant regulatory and funding support.

Would you like me to focus on a specific aspect or time period?"""

# API Endpoints

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "documents_loaded": len(documents_cache)
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
    
    # Reload documents if cache is empty
    if not documents_cache:
        load_documents()
    
    if not documents_cache:
        raise HTTPException(
            status_code=404, 
            detail="No documents found. Check data ingestion."
        )
    
    filters = DocumentFilter(
        topic=topic,
        source=source, 
        doc_type=doc_type,
        days=days,
        search=search,
        limit=limit
    )
    
    filtered_docs = filter_documents(documents_cache, filters)
    
    return {
        "documents": filtered_docs,
        "total": len(filtered_docs)
    }

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get dashboard statistics"""
    
    if not documents_cache:
        return StatsResponse(
            total_documents=0,
            active_procedures=0,
            this_week=0,
            sources=[],
            document_types=[]
        )
    
    # Calculate stats
    by_source = {}
    by_doc_type = {}
    this_week_count = 0
    active_procedures = 0
    
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    
    for doc in documents_cache:
        # Source stats
        source = doc.get('source', 'Unknown')
        by_source[source] = by_source.get(source, 0) + 1
        
        # Doc type stats
        doc_type = doc.get('doc_type', 'Unknown')
        by_doc_type[doc_type] = by_doc_type.get(doc_type, 0) + 1
        
        # Active procedures
        if doc_type == 'procedure':
            active_procedures += 1
        
        # This week activity
        if doc.get('published'):
            try:
                pub_date = datetime.fromisoformat(doc['published'].replace('Z', '+00:00')).replace(tzinfo=None)
                if pub_date >= week_ago:
                    this_week_count += 1
            except:
                pass
    
    return StatsResponse(
        total_documents=len(documents_cache),
        active_procedures=active_procedures,
        this_week=this_week_count,
        sources=[{"name": k, "count": v} for k, v in by_source.items()],
        document_types=[{"name": k, "count": v} for k, v in by_doc_type.items()]
    )

@app.post("/api/rag/query", response_model=RAGResponse)
async def rag_query(query_request: RAGQuery):
    """Submit a RAG query for natural language Q&A"""
    
    # Find relevant documents based on query
    query_lower = query_request.query.lower()
    relevant_docs = []
    
    for doc in documents_cache:
        doc_text = f"{doc.get('title', '')} {doc.get('summary', '')} {' '.join(doc.get('topics', []))}"
        if any(word in doc_text.lower() for word in query_lower.split()):
            relevant_docs.append(doc)
    
    # Limit to top 5 most relevant
    relevant_docs = relevant_docs[:5]
    
    # Generate response
    response_text = generate_mock_rag_response(query_request.query, relevant_docs)
    
    # Format sources
    sources = []
    for doc in relevant_docs:
        sources.append({
            "id": doc.get('id'),
            "title": doc.get('title'),
            "relevance_score": 0.8  # Mock score
        })
    
    return RAGResponse(
        response=response_text,
        sources=sources
    )

@app.get("/api/topics")
async def get_topics():
    """Get available topics from current dataset"""
    
    all_topics = set()
    for doc in documents_cache:
        all_topics.update(doc.get('topics', []))
    
    # Count documents per topic
    topic_counts = {}
    for topic in all_topics:
        count = sum(1 for doc in documents_cache if topic in doc.get('topics', []))
        topic_counts[topic] = count
    
    # Sort by popularity
    sorted_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "topics": [{"name": topic, "count": count} for topic, count in sorted_topics]
    }

@app.get("/api/sources")
async def get_sources():
    """Get available sources from current dataset"""
    
    source_counts = {}
    for doc in documents_cache:
        source = doc.get('source', 'Unknown')
        source_counts[source] = source_counts.get(source, 0) + 1
    
    return {
        "sources": [{"name": source, "count": count} for source, count in source_counts.items()]
    }

# Development server
if __name__ == "__main__":
    uvicorn.run(
        "api_server_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )