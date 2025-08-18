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
