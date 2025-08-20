# 🔒 Environment Variable Security Guide

## 🚨 Critical Security Principle

**Frontend environment variables are PUBLICLY EXPOSED in the browser bundle!**

All `REACT_APP_*` variables are embedded in the compiled JavaScript and can be viewed by anyone who inspects the source code, developer tools, or bundle files.

## ✅ Frontend Environment Variables (SAFE)

Use `REACT_APP_*` prefixed variables **ONLY** for:

### Public Configuration
```bash
# ✅ SAFE - Public API endpoints
REACT_APP_API_BASE_URL=https://api.example.com

# ✅ SAFE - Feature toggles
REACT_APP_RAG_ENABLED=true
REACT_APP_ANALYTICS_ENABLED=false

# ✅ SAFE - UI settings
REACT_APP_THEME=dark
REACT_APP_DEFAULT_PAGE_SIZE=20

# ✅ SAFE - Build configuration
REACT_APP_VERSION=1.2.3
REACT_APP_ENVIRONMENT=production
```

### TypeScript Validation

All frontend environment variables are:
- **Type-checked** at compile time
- **Validated** at runtime with meaningful error messages
- **Fallback-protected** with sensible defaults

```typescript
// Automatic validation in src/config/env.ts
const config = {
  api: {
    baseUrl: getEnvVarRequired('REACT_APP_API_BASE_URL'), // Required
    timeout: getEnvVarNumber('REACT_APP_API_TIMEOUT', 30000), // With default
  },
  features: {
    ragEnabled: getEnvVarBoolean('REACT_APP_RAG_ENABLED', true), // Boolean conversion
  }
};
```

## ❌ Backend Environment Variables (SECRETS)

These **NEVER** belong in frontend environment variables:

### Authentication & Secrets
```bash
# ❌ DANGEROUS - Exposed to public
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=ant-...
JWT_SECRET=...
DATABASE_PASSWORD=...
ENCRYPTION_KEY=...
```

### Service Credentials
```bash
# ❌ DANGEROUS - Exposed to public
AWS_SECRET_ACCESS_KEY=...
REDIS_PASSWORD=...
WEBHOOK_SECRET=...
SERVICE_ACCOUNT_KEY=...
```

### Internal Configuration
```bash
# ❌ DANGEROUS - Exposed to public
DATABASE_URL=postgresql://user:pass@host/db
ADMIN_EMAIL=admin@company.com
INTERNAL_API_TOKEN=...
RATE_LIMIT_SECRET=...
```

## 🛡️ Secure Architecture

### Frontend Responsibility
- **Public configuration only**
- **UI state management**
- **API client (no secrets)**
- **User interface logic**

```typescript
// ✅ Frontend makes authenticated requests without knowing secrets
const response = await apiClient.queryRAG({
  query: "EU climate policy"
});
// Backend handles authentication, rate limiting, API keys internally
```

### Backend Responsibility
- **All secrets and credentials**
- **Authentication and authorization**
- **External API calls with private keys**
- **Database access**
- **Business logic requiring secrets**

```python
# ✅ Backend handles secrets securely
@app.post("/api/rag/query")
async def query_rag(request: RAGRequest):
    # Backend uses OPENAI_API_KEY from its secure environment
    response = await openai_client.create_completion(
        api_key=settings.OPENAI_API_KEY,  # Secret stays on backend
        prompt=request.query
    )
    # Returns public response to frontend
    return {"answer": response.text}
```

## 🔍 Security Verification

### Check Frontend Bundle
```bash
# Build the app and inspect the bundle
npm run build

# Search for sensitive patterns in build files
grep -r "sk-" build/static/js/
grep -r "api.*key" build/static/js/
grep -r "secret" build/static/js/
```

### Environment Variable Audit
```bash
# List all REACT_APP_ variables
env | grep REACT_APP_

# Verify no secrets are exposed
cat .env.production | grep -E "(key|secret|password|token)"
```

## 📋 Security Checklist

### Development
- [ ] No `REACT_APP_` variables contain secrets
- [ ] All API keys are in backend environment only
- [ ] TypeScript validation catches missing required variables
- [ ] Development vs production environment separation

### Production
- [ ] Frontend bundle contains no sensitive data
- [ ] Backend environment variables are properly secured
- [ ] CORS correctly restricts frontend domain access
- [ ] API authentication works without frontend secrets

### Code Review
- [ ] No hardcoded secrets in source code
- [ ] Environment variable names don't reveal sensitive info
- [ ] All external API calls go through backend proxy
- [ ] No direct database connections from frontend

## 🚀 Best Practices

### 1. Environment Separation
```bash
# Development
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_DEBUG_MODE=true

# Production
REACT_APP_API_BASE_URL=https://api.policyradar.com/api
REACT_APP_DEBUG_MODE=false
```

### 2. Proxy Sensitive Operations
```typescript
// ❌ BAD - API key exposed
const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}` }
});

// ✅ GOOD - Backend proxy handles secrets
const response = await apiClient.queryRAG({ query: "..." });
```

### 3. Feature Flags vs Secrets
```bash
# ✅ GOOD - Public feature toggle
REACT_APP_RAG_ENABLED=true

# ❌ BAD - Secret in feature flag
REACT_APP_RAG_API_KEY=sk-...
```

### 4. Error Messages
```typescript
// ✅ GOOD - Safe error handling
if (!config.api.baseUrl) {
  throw new Error('API base URL not configured');
}

// ❌ BAD - Leaking environment details
throw new Error(`Missing API key: ${process.env.SECRET_KEY}`);
```

## 🆘 Incident Response

If secrets are accidentally exposed in frontend:

1. **Immediately revoke** the exposed credentials
2. **Generate new secrets** on the service provider
3. **Update backend environment** with new secrets
4. **Rebuild and redeploy** both frontend and backend
5. **Review git history** for leaked credentials
6. **Audit logs** for potential unauthorized access

## 📚 Additional Resources

- [Create React App Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Frontend Security Best Practices](https://owasp.org/www-project-top-ten/)
- [Secret Management in CI/CD](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Remember: If it's secret, it doesn't belong in the frontend!**