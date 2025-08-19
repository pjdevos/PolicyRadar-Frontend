#!/usr/bin/env python3
"""
Quick test script for Policy Radar Railway API
Run this to test your deployed API endpoints
"""
import requests
import json

def test_railway_api():
    # Get your Railway URL
    railway_url = input("Enter your Railway app URL (e.g., https://your-app.railway.app): ").strip()
    
    if not railway_url:
        print("❌ No URL provided. Exiting.")
        return
    
    if not railway_url.startswith('http'):
        railway_url = f"https://{railway_url}"
    
    if railway_url.endswith('/'):
        railway_url = railway_url[:-1]
    
    print(f"\n🚀 Testing Policy Radar API at: {railway_url}")
    print("="*60)
    
    def test_get(endpoint, description):
        url = f"{railway_url}{endpoint}"
        print(f"\n🔍 {description}")
        print(f"GET {endpoint}")
        
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                print("✅ Success!")
                
                # Show relevant info based on endpoint
                if endpoint == '/':
                    print(f"   API: {data.get('name')} v{data.get('version')}")
                    print(f"   Documents: {data.get('documents')}")
                    print(f"   Status: {data.get('status')}")
                elif 'documents' in endpoint:
                    print(f"   Found {data.get('total', 0)} documents")
                    if data.get('documents'):
                        doc = data['documents'][0]
                        print(f"   Sample: {doc.get('title', 'No title')[:50]}...")
                elif 'stats' in endpoint:
                    print(f"   Total docs: {data.get('total_documents')}")
                    print(f"   Sources: {len(data.get('sources', []))}")
                elif 'topics' in endpoint:
                    topics = data.get('topics', [])
                    print(f"   Topics found: {len(topics)}")
                    if topics:
                        print(f"   Sample topics: {[t['name'] for t in topics[:3]]}")
                elif 'sources' in endpoint:
                    sources = data.get('sources', [])
                    print(f"   Sources: {[s['name'] for s in sources]}")
                
                return True
            else:
                print(f"❌ Error {response.status_code}")
                print(f"   Response: {response.text[:100]}...")
                return False
                
        except Exception as e:
            print(f"❌ Exception: {e}")
            return False
    
    def test_post(endpoint, data, description):
        url = f"{railway_url}{endpoint}"
        print(f"\n🔍 {description}")
        print(f"POST {endpoint}")
        
        try:
            response = requests.post(url, json=data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                print("✅ Success!")
                print(f"   Response length: {len(result.get('response', ''))}")
                print(f"   Sources found: {len(result.get('sources', []))}")
                return True
            else:
                print(f"❌ Error {response.status_code}")
                print(f"   Response: {response.text[:100]}...")
                return False
                
        except Exception as e:
            print(f"❌ Exception: {e}")
            return False
    
    # Run tests
    results = []
    
    results.append(test_get('/', 'Root API info'))
    results.append(test_get('/api/health', 'Health check'))
    results.append(test_get('/api/documents', 'All documents'))
    results.append(test_get('/api/documents?topic=hydrogen', 'Hydrogen documents'))
    results.append(test_get('/api/stats', 'Dashboard statistics'))
    results.append(test_get('/api/topics', 'Available topics'))
    results.append(test_get('/api/sources', 'Available sources'))
    
    results.append(test_post('/api/rag/query', 
                            {"query": "What are the latest hydrogen developments?"}, 
                            'RAG Query - Hydrogen'))
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print(f"\n{'='*60}")
    print(f"🎯 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Your API is working perfectly.")
        print(f"\n🔗 Try these URLs in your browser:")
        print(f"   • API Docs: {railway_url}/api/docs")
        print(f"   • API Info: {railway_url}/")
        print(f"   • Health: {railway_url}/api/health")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
    
    print(f"\n📋 Frontend Configuration:")
    print(f"   Set REACT_APP_API_BASE_URL={railway_url}/api")

if __name__ == "__main__":
    test_railway_api()