#!/usr/bin/env python3
"""
Simple vector indexer for Policy Radar data
Creates a basic vector index from JSONL data without heavy dependencies
"""

import json
import os
import pickle
from pathlib import Path

def create_simple_index(jsonl_path: str, index_path: str):
    """Create a simple index from JSONL data"""
    print(f"Creating simple index from {jsonl_path}")
    
    # Read documents
    documents = []
    with open(jsonl_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                documents.append(json.loads(line))
    
    print(f"Loaded {len(documents)} documents")
    
    # Create index directory
    os.makedirs(index_path, exist_ok=True)
    
    # Save documents for API server
    with open(os.path.join(index_path, "documents.pkl"), 'wb') as f:
        pickle.dump(documents, f)
    
    # Create simple config
    config = {
        'num_documents': len(documents),
        'created': '2024-08-18',
        'sources': list(set(doc['source'] for doc in documents)),
        'doc_types': list(set(doc['doc_type'] for doc in documents))
    }
    
    with open(os.path.join(index_path, "config.json"), 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"Simple index created at {index_path}")
    print(f"Documents: {config['num_documents']}")
    print(f"Sources: {config['sources']}")
    print(f"Types: {config['doc_types']}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python simple_indexer.py <input_jsonl> <output_dir>")
        sys.exit(1)
    
    create_simple_index(sys.argv[1], sys.argv[2])