#!/usr/bin/env python3
"""
Test frontend-backend integration for Policy Radar
"""
import requests
import time

BACKEND_URL = "https://web-production-c466.up.railway.app"
FRONTEND_URL = "http://localhost:3000"

def test_backend_cors():
    """Test if backend allows CORS from frontend"""
    print("Testing CORS configuration...")
    
    headers = {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
    }
    
    try:
        # Test preflight request
        response = requests.options(f"{BACKEND_URL}/api/documents", headers=headers, timeout=10)
        print(f"CORS preflight: {response.status_code}")
        
        # Test actual request with CORS headers
        response = requests.get(f"{BACKEND_URL}/api/documents", 
                              headers={'Origin': FRONTEND_URL}, 
                              timeout=10)
        
        if response.status_code == 200:
            print("✅ CORS working - Frontend can access backend")
            return True
        else:
            print(f"❌ CORS issue: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ CORS test failed: {e}")
        return False

def test_api_endpoints():
    """Test key API endpoints that frontend uses"""
    endpoints = [
        "/api/health",
        "/api/documents", 
        "/api/stats",
        "/api/topics",
        "/api/sources"
    ]
    
    print("Testing API endpoints...")
    all_good = True
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=10)
            if response.status_code == 200:
                print(f"✅ {endpoint}")
            else:
                print(f"❌ {endpoint}: {response.status_code}")
                all_good = False
        except Exception as e:
            print(f"❌ {endpoint}: {e}")
            all_good = False
    
    return all_good

def test_frontend_accessibility():
    """Check if frontend is running"""
    print("Checking frontend...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running")
            return True
        else:
            print(f"❌ Frontend issue: {response.status_code}")
            return False
    except Exception as e:
        print(f"⏳ Frontend not ready yet: {e}")
        return False

def main():
    print("🧪 Testing Policy Radar Integration")
    print("=" * 50)
    
    # Test backend
    backend_ok = test_api_endpoints()
    cors_ok = test_backend_cors()
    
    # Check frontend (may not be ready yet)
    frontend_ok = test_frontend_accessibility()
    
    print("\n" + "=" * 50)
    print("INTEGRATION TEST RESULTS:")
    print(f"✅ Backend API: {'OK' if backend_ok else 'ISSUES'}")
    print(f"✅ CORS Config: {'OK' if cors_ok else 'ISSUES'}")
    print(f"⏳ Frontend: {'READY' if frontend_ok else 'STARTING...'}")
    
    if backend_ok and cors_ok:
        print("\n🎉 Backend is ready for frontend connection!")
        print(f"🔗 Frontend should connect to: {BACKEND_URL}/api")
        print(f"🖥️  Frontend will be at: {FRONTEND_URL}")
        
        if not frontend_ok:
            print("⏳ Wait for React to finish starting, then visit:")
            print(f"   {FRONTEND_URL}")
    else:
        print("\n⚠️  Some issues detected. Check the errors above.")

if __name__ == "__main__":
    main()