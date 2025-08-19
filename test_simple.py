#!/usr/bin/env python3
"""
Simple test script for Policy Radar Railway API
"""
import requests
import json

BASE_URL = "https://web-production-c466.up.railway.app"

def test_get(endpoint):
    url = f"{BASE_URL}{endpoint}"
    print(f"\nTesting GET {endpoint}")
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("SUCCESS!")
            return data
        else:
            print(f"ERROR: {response.status_code}")
            return None
    except Exception as e:
        print(f"EXCEPTION: {e}")
        return None

def test_post(endpoint, data):
    url = f"{BASE_URL}{endpoint}"
    print(f"\nTesting POST {endpoint}")
    try:
        response = requests.post(url, json=data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print("SUCCESS!")
            return result
        else:
            print(f"ERROR: {response.status_code}")
            return None
    except Exception as e:
        print(f"EXCEPTION: {e}")
        return None

def main():
    print("Testing Policy Radar API")
    print(f"URL: {BASE_URL}")
    print("=" * 50)
    
    # Test endpoints
    root = test_get("/")
    health = test_get("/api/health")
    docs = test_get("/api/documents")
    stats = test_get("/api/stats")
    topics = test_get("/api/topics")
    sources = test_get("/api/sources")
    
    # Test RAG
    rag_result = test_post("/api/rag/query", {"query": "hydrogen policy"})
    
    print("\n" + "=" * 50)
    print("SUMMARY:")
    
    if root:
        print(f"API Name: {root.get('name')}")
        print(f"Version: {root.get('version')}")
        print(f"Documents: {root.get('documents')}")
    
    if stats:
        print(f"Total docs: {stats.get('total_documents')}")
        sources_list = [s['name'] for s in stats.get('sources', [])]
        print(f"Sources: {sources_list}")
    
    print(f"\nAPI Documentation: {BASE_URL}/api/docs")
    print(f"Frontend config: REACT_APP_API_BASE_URL={BASE_URL}/api")

if __name__ == "__main__":
    main()