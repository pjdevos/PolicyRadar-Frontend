#!/usr/bin/env python3
"""
Policy Radar Complete File Bundle Generator

This script creates all the necessary files for the Policy Radar project.
Run this script in your project directory to generate the complete codebase.

Usage:
    python complete_file_bundle.py [target_directory]
    
Examples:
    python complete_file_bundle.py                    # Creates files in current directory
    python complete_file_bundle.py ./policy-radar     # Creates files in ./policy-radar/
    python complete_file_bundle.py /opt/policy-radar  # Creates files in /opt/policy-radar/
"""

import os
import sys
import textwrap
from pathlib import Path

def create_file(filepath: str, content: str, target_dir: Path):
    """Create a file with the given content in the target directory"""
    full_path = target_dir / filepath
    full_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(textwrap.dedent(content).strip() + '\n')
    
    print(f"✅ Created {full_path}")

def check_missing_artifacts(target_dir: Path) -> list:
    """Check for missing artifact files and return list of missing files"""
    required_files = [
        'poc_policy_radar.py',
        'vector_indexer.py', 
        'rag_service.py'
    ]
    
    missing = []
    for file in required_files:
        if not (target_dir / file).exists():
            missing.append(file)
    
    return missing

def create_scaffold_files(target_dir: Path):
    """Create minimal scaffold versions of missing artifact files"""
    
    # Scaffold PoC file
    create_file("poc_policy_radar.py", '''
    #!/usr/bin/env python3
    """
    Policy Radar PoC – Placeholder
    
    TODO: Replace this with your actual PoC implementation
    
    This is a minimal scaffold. Copy your working PoC code here.
    """
    
    def main():
        print("🚧 This is a placeholder for your PoC implementation")
        print("📋 Copy your actual poc_policy_radar.py code here")
        print("💡 Your PoC should include:")
        print("   - EURACTIV RSS connector")
        print("   - EUR-Lex SPARQL connector") 
        print("   - EP Open Data API connector")
        print("   - DocItem dataclass")
        print("   - JSONL output generation")
    
    if __name__ == "__main__":
        main()
    ''', target_dir)
    
    # Scaffold vector indexer
    create_file("vector_indexer.py", '''
    #!/usr/bin/env python3
    """
    Vector Indexer – Placeholder
    
    TODO: Replace this with the Vector Indexing Module artifact
    
    This is a minimal scaffold. Copy the actual implementation from the artifact.
    """
    
    class PolicyVectorStore:
        def __init__(self):
            print("🚧 PolicyVectorStore placeholder")
            print("📋 Copy the Vector Indexing Module artifact here")
    
    def main():
        print("🚧 Vector indexer placeholder")
        print("📋 This should be replaced with the Vector Indexing Module artifact")
    
    if __name__ == "__main__":
        main()
    ''', target_dir)
    
    # Scaffold RAG service
    create_file("rag_service.py", '''
    #!/usr/bin/env python3
    """
    RAG Service – Placeholder
    
    TODO: Replace this with the Policy Radar RAG Service artifact
    
    This is a minimal scaffold. Copy the actual implementation from the artifact.
    """
    
    class PolicyRAGService:
        def __init__(self, index_path: str):
            print("🚧 PolicyRAGService placeholder")
            print("📋 Copy the Policy Radar RAG Service artifact here")
    
    def main():
        print("🚧 RAG service placeholder")
        print("📋 This should be replaced with the Policy Radar RAG Service artifact")
    
    if __name__ == "__main__":
        main()
    ''', target_dir)

def main():
    # Parse command line arguments
    if len(sys.argv) > 2:
        print("❌ Too many arguments")
        print("Usage: python complete_file_bundle.py [target_directory]")
        sys.exit(1)
    
    # Determine target directory
    if len(sys.argv) == 2:
        target_dir = Path(sys.argv[1]).resolve()
    else:
        target_dir = Path.cwd()
    
    print("🚀 Generating Policy Radar Project Files...")
    print("=" * 50)
    print(f"📁 Target directory: {target_dir}")
    print()
    
    # Create target directory if it doesn't exist
    target_dir.mkdir(parents=True, exist_ok=True)
    # 1. API Server (FastAPI Backend)
    create_file("api_server.py", '''
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
    ''', target_dir)
    
    # 2. Requirements files
    create_file("requirements.txt", '''
    # Core PoC requirements
    requests>=2.31.0
    feedparser>=6.0.10
    pandas>=2.0.0
    tqdm>=4.65.0
    
    # FastAPI and server
    fastapi>=0.104.0
    uvicorn[standard]>=0.24.0
    pydantic>=2.0.0
    
    # Vector indexing & RAG
    sentence-transformers>=2.2.2
    faiss-cpu>=1.7.4
    numpy>=1.24.0
    langdetect>=1.0.9
    
    # Production additions
    python-dotenv>=1.0.0
    aiohttp>=3.9.0
    gunicorn>=21.0.0
    ''', target_dir)
    
    # 3. Environment configuration
    create_file(".env.example", '''
    # API Configuration
    API_HOST=0.0.0.0
    API_PORT=8000
    API_RELOAD=true
    CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
    
    # AI/ML Configuration
    EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-mpnet-base-v2
    LLM_PROVIDER=claude
    
    # API Keys (add your own)
    ANTHROPIC_API_KEY=your_claude_api_key_here
    OPENAI_API_KEY=your_openai_api_key_here
    
    # Optional: Database
    DATABASE_URL=postgresql://user:pass@localhost:5432/policy_radar
    
    # Logging
    LOG_LEVEL=INFO
    ''', target_dir)
    
    # 4. Startup scripts (Cross-platform)
    
    # Unix/Linux/macOS scripts
    create_file("start_backend.sh", '''
    #!/bin/bash
    # Start Policy Radar Backend
    
    echo "🚀 Starting Policy Radar API Server..."
    
    # Activate virtual environment
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
    fi
    
    # Start the server
    uvicorn api_server:app --host ${API_HOST:-0.0.0.0} --port ${API_PORT:-8000} --reload
    ''', target_dir)
    
    # Windows batch files
    create_file("start_backend.bat", '''
    @echo off
    REM Start Policy Radar Backend (Windows)
    
    echo 🚀 Starting Policy Radar API Server...
    
    REM Activate virtual environment
    if exist "venv\\Scripts\\activate.bat" (
        call venv\\Scripts\\activate.bat
    )
    
    REM Start the server
    uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
    
    pause
    ''', target_dir)
    
    create_file("start_dev.sh", '''
    #!/bin/bash
    # Start full Policy Radar development environment
    
    echo "🚀 Starting Policy Radar Development Environment"
    echo "================================================"
    
    # Function to kill background processes on exit
    cleanup() {
        echo "Shutting down services..."
        kill $(jobs -p) 2>/dev/null
        exit
    }
    trap cleanup SIGINT SIGTERM
    
    # Start backend
    echo "Starting backend API server..."
    ./start_backend.sh &
    BACKEND_PID=$!
    
    # Wait for backend to start
    sleep 3
    
    # Check if backend is running
    if curl -s http://localhost:8000/api/health > /dev/null; then
        echo "✅ Backend API started successfully"
    else
        echo "❌ Backend API failed to start"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    echo ""
    echo "🎉 Development environment ready!"
    echo "   Backend API:  http://localhost:8000"
    echo "   API Docs:     http://localhost:8000/api/docs"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user to stop
    wait
    ''', target_dir)
    
    create_file("start_dev.bat", '''
    @echo off
    REM Start Policy Radar Development Environment (Windows)
    
    echo 🚀 Starting Policy Radar Development Environment
    echo ================================================
    
    REM Start backend
    echo Starting backend API server...
    start "Policy Radar API" cmd /k start_backend.bat
    
    REM Wait for backend to start
    timeout /t 5 /nobreak > nul
    
    REM Check if backend is running (simplified for Windows)
    echo ✅ Backend should be starting...
    echo.
    echo 🎉 Development environment ready!
    echo    Backend API:  http://localhost:8000
    echo    API Docs:     http://localhost:8000/api/docs
    echo.
    echo Press any key to stop services...
    
    pause > nul
    taskkill /f /im python.exe 2>nul
    taskkill /f /im uvicorn.exe 2>nul
    ''', target_dir)
    
    create_file("test_api.sh", '''
    #!/bin/bash
    # Test Policy Radar API endpoints
    
    API_URL="http://localhost:8000/api"
    
    echo "🧪 Testing Policy Radar API"
    echo "=========================="
    
    # Test health endpoint
    echo "Testing health check..."
    if curl -s "$API_URL/health" | grep -q "healthy"; then
        echo "✅ Health check passed"
    else
        echo "❌ Health check failed"
        exit 1
    fi
    
    # Test documents endpoint
    echo "Testing documents endpoint..."
    if curl -s "$API_URL/documents?limit=1" | grep -q "documents"; then
        echo "✅ Documents endpoint working"
    else
        echo "⚠️  Documents endpoint returned no data (may need ingestion)"
    fi
    
    # Test stats endpoint  
    echo "Testing stats endpoint..."
    if curl -s "$API_URL/stats" | grep -q "total_documents"; then
        echo "✅ Stats endpoint working"
    else
        echo "❌ Stats endpoint failed"
    fi
    
    echo ""
    echo "🎯 API Test Complete"
    echo "   API Docs: $API_URL/docs"
    ''', target_dir)
    
    create_file("test_api.bat", '''
    @echo off
    REM Test Policy Radar API endpoints (Windows)
    
    set API_URL=http://localhost:8000/api
    
    echo 🧪 Testing Policy Radar API
    echo ==========================
    
    echo Testing health check...
    curl -s "%API_URL%/health" | findstr "healthy" >nul
    if %ERRORLEVEL%==0 (
        echo ✅ Health check passed
    ) else (
        echo ❌ Health check failed
        pause
        exit /b 1
    )
    
    echo Testing documents endpoint...
    curl -s "%API_URL%/documents?limit=1" | findstr "documents" >nul
    if %ERRORLEVEL%==0 (
        echo ✅ Documents endpoint working
    ) else (
        echo ⚠️  Documents endpoint returned no data ^(may need ingestion^)
    )
    
    echo Testing stats endpoint...
    curl -s "%API_URL%/stats" | findstr "total_documents" >nul
    if %ERRORLEVEL%==0 (
        echo ✅ Stats endpoint working
    ) else (
        echo ❌ Stats endpoint failed
    )
    
    echo.
    echo 🎯 API Test Complete
    echo    API Docs: %API_URL%/docs
    
    pause
    ''', target_dir)
    
    # 5. README
    create_file("README.md", '''
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
    curl -X POST http://localhost:8000/api/ingest \\
      -H 'Content-Type: application/json' \\
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
    ''', target_dir)
    
    # 6. Configuration
    create_file("config/__init__.py", "", target_dir)
    create_file("config/settings.py", '''
    """Policy Radar Configuration"""
    import os
    from pathlib import Path
    
    # Project paths
    PROJECT_ROOT = Path(__file__).parent.parent
    DATA_DIR = PROJECT_ROOT / "data"
    VECTORS_DIR = PROJECT_ROOT / "vectors"
    LOGS_DIR = PROJECT_ROOT / "logs"
    
    # API settings
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", "8000"))
    API_RELOAD = os.getenv("API_RELOAD", "true").lower() == "true"
    
    # CORS origins
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    
    # External APIs
    EURLEX_SPARQL = "https://publications.europa.eu/webapi/rdf/sparql"
    EP_API_BASE = "https://data.europarl.europa.eu/api/v2"
    
    # AI/ML settings
    DEFAULT_EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-mpnet-base-v2")
    DEFAULT_LLM_PROVIDER = os.getenv("LLM_PROVIDER", "claude")
    
    # API keys
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    
    # Database (optional)
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    ''', target_dir)
    
    # 7. Git configuration
    create_file(".gitignore", '''
    # Python
    __pycache__/
    *.py[cod]
    *$py.class
    *.so
    .Python
    env/
    venv/
    .venv/
    
    # Data & Models
    data/
    vectors/
    logs/
    *.jsonl
    *.csv
    *.pkl
    *.index
    
    # API Keys
    .env
    
    # IDE
    .vscode/
    .idea/
    *.swp
    *.swo
    
    # OS
    .DS_Store
    Thumbs.db
    
    # Logs
    *.log
    ''', target_dir)
    
    # 8. Check for missing artifacts and optionally create scaffolds
    missing_artifacts = check_missing_artifacts(target_dir)
    
    if missing_artifacts:
        print(f"\n⚠️  Missing artifact files: {missing_artifacts}")
        print("🤔 Would you like to create placeholder scaffolds? (y/n): ", end="")
        
        try:
            response = input().lower().strip()
            if response in ['y', 'yes']:
                print("🚧 Creating placeholder scaffolds...")
                create_scaffold_files(target_dir)
                print("✅ Scaffold files created - replace with actual artifact code")
            else:
                print("ℹ️  Skipping scaffold creation")
        except (EOFError, KeyboardInterrupt):
            print("\nℹ️  Skipping scaffold creation")
    
    # Make shell scripts executable (Unix/Linux/macOS only)
    import platform
    if platform.system() != 'Windows':
        try:
            os.chmod(target_dir / "start_backend.sh", 0o755)
            os.chmod(target_dir / "start_dev.sh", 0o755)  
            os.chmod(target_dir / "test_api.sh", 0o755)
            print("✅ Made shell scripts executable")
        except Exception as e:
            print(f"⚠️  Could not make scripts executable: {e}")
    else:
        print("ℹ️  Windows detected - created .bat files for startup scripts")
    
    print("\n" + "=" * 50)
    print("🎉 Policy Radar Project Generated Successfully!")
    print("=" * 50)
    
    print("\n📁 Files created:")
    print("   ├── api_server.py           # FastAPI backend")
    print("   ├── requirements.txt        # Python dependencies")
    print("   ├── .env.example           # Environment template")
    print("   ├── README.md              # Project documentation")
    print("   ├── config/                # Configuration files")
    if platform.system() == 'Windows':
        print("   ├── start_backend.bat      # Backend startup script (Windows)")
        print("   ├── start_dev.bat         # Development startup (Windows)")
        print("   ├── test_api.bat          # API testing script (Windows)")
        print("   ├── *.sh                  # Unix/Linux scripts (also included)")
    else:
        print("   ├── start_backend.sh       # Backend startup script")
        print("   ├── start_dev.sh          # Development startup")
        print("   ├── test_api.sh           # API testing script")
        print("   ├── *.bat                 # Windows scripts (also included)")
    print("   └── .gitignore             # Git ignore rules")
    
    print("\n🔧 Next steps:")
    print("1. Copy remaining artifact files:")
    print("   - poc_policy_radar.py (your existing PoC)")
    print("   - vector_indexer.py (from vector indexing artifact)")
    print("   - rag_service.py (from RAG service artifact)")
    
    print("\n2. Setup environment:")
    print("   cp .env.example .env")
    print("   # Edit .env with your API keys")
    
    print("\n3. Install dependencies:")
    if platform.system() == 'Windows':
        print("   python -m venv venv")
        print("   venv\\Scripts\\activate")
        print("   pip install -r requirements.txt")
        print("\n4. Start development:")
        print("   start_dev.bat")
        print("\n5. Test the setup:")
        print("   test_api.bat")
        print("\n   Note: For Windows, you can also use WSL or Git Bash to run .sh files")
    else:
        print("   python3 -m venv venv")
        print("   source venv/bin/activate")
        print("   pip install -r requirements.txt")
        print("\n4. Start development:")
        print("   chmod +x *.sh")
        print("   ./start_dev.sh")
        print("\n5. Test the setup:")
        print("   ./test_api.sh")
    
    print("\n📚 Documentation available at:")
    print(f"   API Docs:      http://localhost:8000/api/docs")
    print(f"   Health Check:  http://localhost:8000/api/health")
    print(f"   Project Root:  {target_dir}")
    
    if missing_artifacts and 'y' not in locals():
        print(f"\n🔧 Still needed - copy these artifact files to {target_dir}:")
        for file in missing_artifacts:
            print(f"   - {file}")
    
    print(f"\n✨ Project generated successfully in: {target_dir}")

if __name__ == "__main__":
    main()