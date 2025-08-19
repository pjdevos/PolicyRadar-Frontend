#!/usr/bin/env python3
"""
Test script for YOUR specific Policy Radar Railway API
URL: https://web-production-c466.up.railway.app
"""
import requests
import json

BASE_URL = "https://web-production-c466.up.railway.app"

def test_endpoint(endpoint, method="GET", data=None):
    """Test an API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n🔍 Testing {method} {endpoint}")
    print(f"URL: {url}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Success!")
            
            # Show specific info for each endpoint
            if endpoint == "/":
                print(f"   API: {result.get('name')} v{result.get('version')}")
                print(f"   Documents: {result.get('documents')}")
                print(f"   Status: {result.get('status')}")
                print(f"   Message: {result.get('message')}")
            elif endpoint == "/api/health":
                print(f"   Status: {result.get('status')}")
                print(f"   Documents: {result.get('documents')}")
                print(f"   Timestamp: {result.get('timestamp')}")
            elif endpoint == "/api/documents":
                print(f"   Total documents: {result.get('total', 0)}")
                docs = result.get('documents', [])
                print(f"   Documents returned: {len(docs)}")
                if docs:
                    print(f"   Sample: {docs[0].get('title', 'No title')}")
            elif endpoint == "/api/stats":
                print(f"   Total documents: {result.get('total_documents')}")
                print(f"   Active procedures: {result.get('active_procedures')}")
                print(f"   This week: {result.get('this_week')}")
                sources = result.get('sources', [])
                print(f"   Sources: {[s['name'] for s in sources]}")
            elif "rag/query" in endpoint:
                print(f"   Response length: {len(result.get('response', ''))}")
                print(f"   Sources found: {len(result.get('sources', []))}")
                print(f"   Response preview: {result.get('response', '')[:100]}...")
            
            return result
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text[:200]}...")
            return None
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

def main():
    print("🚀 Testing YOUR Policy Radar API on Railway")
    print(f"📍 URL: {BASE_URL}")
    print("="*60)
    
    # Test all endpoints
    results = []
    
    # Basic endpoints
    results.append(test_endpoint("/"))
    results.append(test_endpoint("/api/health"))
    
    # Data endpoints
    results.append(test_endpoint("/api/documents"))
    results.append(test_endpoint("/api/stats"))
    results.append(test_endpoint("/api/topics"))
    results.append(test_endpoint("/api/sources"))
    
    # Filtered queries
    results.append(test_endpoint("/api/documents?topic=hydrogen"))
    results.append(test_endpoint("/api/documents?source=EUR-Lex"))
    results.append(test_endpoint("/api/documents?search=transport"))
    
    # RAG queries
    rag_data1 = {"query": "What are the latest developments in hydrogen policy?"}
    results.append(test_endpoint("/api/rag/query", method="POST", data=rag_data1))
    
    rag_data2 = {"query": "Tell me about electric vehicle infrastructure"}
    results.append(test_endpoint("/api/rag/query", method="POST", data=rag_data2))
    
    # Summary
    successful = sum(1 for r in results if r is not None)
    total = len(results)
    
    print("\n" + "="*60)
    print(f"🎯 Test Results: {successful}/{total} endpoints working")
    
    if successful == total:
        print("🎉 Perfect! All API endpoints are working!")
        print(f"\n🔗 Useful URLs:")
        print(f"   • Interactive API Docs: {BASE_URL}/api/docs")
        print(f"   • API Health: {BASE_URL}/api/health")
        print(f"   • All Documents: {BASE_URL}/api/documents")
        
        print(f"\n🖥️ Frontend Configuration:")
        print(f"   Set this in your .env file:")
        print(f"   REACT_APP_API_BASE_URL={BASE_URL}/api")
        
    else:
        print("⚠️  Some endpoints had issues. Check the errors above.")
    
    print(f"\n📋 Next Steps:")
    print(f"   1. Copy frontend/.env.railway to frontend/.env.local")
    print(f"   2. Run 'npm start' in the frontend directory")
    print(f"   3. Your frontend will connect to: {BASE_URL}/api")

if __name__ == "__main__":
    main()