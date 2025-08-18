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
