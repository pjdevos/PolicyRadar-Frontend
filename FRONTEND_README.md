# Policy Radar Frontend

Brussels public affairs platform - **React Dashboard & User Interface**

## 🎯 Overview

Modern React dashboard for policy document analysis and AI-powered research. Provides an intuitive interface for searching, filtering, and analyzing EU policy documents with RAG (Retrieval-Augmented Generation) capabilities.

## ✨ Features

- **📊 Interactive Dashboard** - Real-time statistics and document analytics
- **🔍 Advanced Search** - Filter by topic, source, date range, and keywords  
- **🤖 AI-Powered Q&A** - Natural language queries with source citations
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **⚡ Real-time Updates** - Live data refresh and notifications
- **🎨 Modern UI** - Clean, accessible interface with Lucide icons

## 🏗️ Architecture

```
[React Frontend] ←→ [Backend API] ←→ [Vector Store & RAG]
       ↓                ↓               ↓
   [Dashboard]    [REST Endpoints] [Document Analysis]
   [Search UI]    [Rate Limiting]   [AI Responses]
   [RAG Chat]     [CORS/Security]   [Citations]
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x
- npm 10.x or yarn
- Backend API running (see [PolicyRadar-Backend](https://github.com/pjdevos/PolicyRadar-Backend))

### 1. Installation

```bash
# Clone repository
git clone https://github.com/pjdevos/PolicyRadar-Frontend.git
cd PolicyRadar-Frontend

# Install dependencies
npm ci

# Copy environment template
cp .env.example .env.local
```

### 2. Configuration

```bash
# Edit .env.local with your settings
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_ENVIRONMENT=development
REACT_APP_APP_NAME=Policy Radar

# Production example
REACT_APP_API_BASE_URL=https://your-backend.railway.app/api
REACT_APP_ENVIRONMENT=production
```

### 3. Development

```bash
# Start development server
npm start

# Open browser
http://localhost:3000
```

### 4. Build & Deploy

```bash
# Build for production
npm run build

# Test production build locally
npx serve -s build
```

## 🔧 Configuration

### Environment Variables

The frontend uses a typed configuration system with runtime validation:

```typescript
// Core configuration
REACT_APP_API_BASE_URL=https://api.policyradar.com/api
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0

// Application settings
REACT_APP_APP_NAME=Policy Radar
REACT_APP_APP_TITLE=Policy Radar Dashboard
REACT_APP_APP_DESCRIPTION=Brussels public affairs platform

// Feature flags
REACT_APP_RAG_ENABLED=true
REACT_APP_ANALYTICS_ENABLED=false
REACT_APP_DEBUG_MODE=false

// API configuration
REACT_APP_API_TIMEOUT=30000
REACT_APP_API_RETRY_ATTEMPTS=3
REACT_APP_API_RETRY_DELAY=1000

// UI settings
REACT_APP_THEME=auto
REACT_APP_DEFAULT_PAGE_SIZE=20
REACT_APP_MAX_QUERY_LENGTH=500
```

### Configuration Features

- **Type Safety**: Full TypeScript typing for all config values
- **Runtime Validation**: Startup checks prevent misconfiguration
- **Environment Detection**: Automatic dev/prod behavior
- **Fallback Support**: Graceful degradation with defaults

## 🎨 UI Components

### Dashboard
- Document statistics and trends
- Source distribution charts  
- Recent activity timeline
- Quick action buttons

### Document Browser
- Advanced filtering controls
- Sortable document lists
- Pagination with lazy loading
- Export functionality

### RAG Chat Interface  
- Natural language query input
- Streaming AI responses
- Source citations with links
- Query history and bookmarks

### Settings & Preferences
- Theme selection (light/dark/auto)
- Language preferences
- Notification settings
- Export options

## 🔌 API Integration

### Backend Communication

```typescript
import { apiClient } from './services/api';

// Fetch documents with filters
const documents = await apiClient.getDocuments({
  topic: 'climate',
  days: 30,
  limit: 50
});

// Submit RAG query
const response = await apiClient.queryRAG({
  query: 'What are the latest EU renewable energy policies?',
  k: 8
});

// Get dashboard statistics
const stats = await apiClient.getStats();
```

### Error Handling

- **Network Resilience**: Automatic retries with exponential backoff
- **Rate Limiting**: Graceful handling of 429 responses
- **User Feedback**: Clear error messages and recovery suggestions
- **Offline Support**: Basic offline functionality

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px
- **Wide**: > 1440px

### Mobile Features
- Touch-friendly interface
- Optimized search controls
- Collapsible navigation
- Swipe gestures

## 🛡️ Security

### Content Security
- Input sanitization
- XSS protection
- Secure API communication
- No sensitive data storage

### Privacy
- No user tracking
- Local storage only for preferences
- GDPR compliance ready
- Minimal data collection

## 🚀 Deployment

### Railway (Current)

```bash
# Deploy to Railway
git push origin main

# Environment variables in Railway dashboard:
REACT_APP_API_BASE_URL=https://your-backend.railway.app/api
REACT_APP_ENVIRONMENT=production
```

### Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add REACT_APP_API_BASE_URL
```

### Docker (Alternative)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Route-based lazy loading
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image compression and lazy loading
- **Caching**: Aggressive browser caching strategies

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx bundle-analyzer build/static/js/*.js
```

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Core Web Vitals**: All green
- **Lighthouse Score**: 95+

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 🔄 Development Workflow

### Code Style
- **ESLint**: Code quality enforcement
- **Prettier**: Automatic code formatting
- **TypeScript**: Full type safety
- **Husky**: Pre-commit hooks

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-dashboard

# Commit changes
git commit -m "feat: add new dashboard component"

# Push and create PR
git push origin feature/new-dashboard
```

## 📋 Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^4.9.5",
  "lucide-react": "^0.294.0",
  "serve": "^14.2.0"
}
```

### Development Dependencies
- **Testing**: Jest, React Testing Library
- **Build**: React Scripts, TypeScript
- **Linting**: ESLint, Prettier
- **Types**: @types packages

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   ```bash
   # Check backend is running
   curl http://localhost:8000/api/health
   
   # Verify CORS configuration
   # Update backend CORS_ORIGINS setting
   ```

2. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment Variables Not Loading**
   ```bash
   # Ensure variables start with REACT_APP_
   # Restart development server after changes
   npm start
   ```

## 🔗 Related Repositories

- **Backend API**: [PolicyRadar-Backend](https://github.com/pjdevos/PolicyRadar-Backend)
- **Documentation**: See README files in respective repositories

## 📄 License

MIT License - see LICENSE file for details.

---

**🚀 Ready to explore EU policy data with AI-powered insights!**