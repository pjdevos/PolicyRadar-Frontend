# Policy Radar Frontend

Type-safe React dashboard for Policy Radar platform with TanStack Query integration.

## 🚀 **Live Application**

**✅ Production:** [https://policy-radar-frontend.vercel.app](https://policy-radar-frontend.vercel.app)

---

## **Features**
- ✅ **Type-safe API client** generated from OpenAPI schema
- ✅ **TanStack Query** for caching, loading states, and error handling  
- ✅ **Loading skeletons** and empty states for better UX
- ✅ **Real-time data** with optimistic updates and 60s polling
- ✅ **Comprehensive error handling** with retry logic and user-friendly messages
- ✅ **Dutch date formatting** (nl-BE locale)
- ✅ **Clickable topic filters** for enhanced UX
- ✅ **Animated radar logo** with sweep effect

Updated: 2025-08-22

---

## 📚 API Documentation

- **Live API Docs**: [https://policyradar-backend-production.up.railway.app/docs](https://policyradar-backend-production.up.railway.app/docs)
- **OpenAPI Schema**: [https://policyradar-backend-production.up.railway.app/openapi.json](https://policyradar-backend-production.up.railway.app/openapi.json)

### Type Generation

TypeScript types are automatically generated from the backend OpenAPI schema:

```bash
# Generate types from production API
npm run generate-types

# Generate types from local development API  
npm run generate-types:local
```

Types are generated into `src/types/api-generated.ts` and provide full type safety for:
- Request/response schemas
- Query parameters  
- Error responses
- API endpoints

---

## 🚀 Deployment

### Primary: Vercel (Recommended)

Vercel automatically deploys from the `main` branch with optimized React builds.

**Live URL:** [https://policy-radar-frontend.vercel.app](https://policy-radar-frontend.vercel.app)

**Environment Variables:**
- `REACT_APP_API_URL`: `https://policyradar-backend-production.up.railway.app/api`

### Alternative: Railway

For manual Railway deployment:

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project" → "Deploy from GitHub repo"  
3. Select `pjdevos/PolicyRadar-Frontend` repository
4. Add environment variables:
   ```
   REACT_APP_API_URL=https://policyradar-backend-production.up.railway.app/api
   REACT_APP_APP_NAME=Policy Radar
   REACT_APP_VERSION=1.0.0
   REACT_APP_ENVIRONMENT=production
   ```

---

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm 10+

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view in browser.

### Available Scripts

- **`npm start`** - Development server with hot reload
- **`npm test`** - Interactive test runner
- **`npm run build`** - Production build 
- **`npm run generate-types`** - Generate TypeScript types from API

### Environment Configuration

Create `.env.local` for local development:

```bash
# Local development
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_MODE=true
```

---

## 🏗️ Architecture

### Tech Stack
- **React 18** with TypeScript
- **TanStack Query** for server state management
- **Lucide React** for icons
- **Tailwind CSS** for styling
- **React Error Boundary** for error handling
- **React Router DOM** for navigation

### Key Components
- `App.tsx` - Main application with direct API calls and polling
- `RadarLogo.tsx` - Animated radar component with stars
- `api-client.ts` - Type-safe API client with error handling
- `config.ts` - Environment configuration management

### API Integration
- Direct API calls with built-in retry logic
- Real-time polling every 60 seconds
- Concurrency guards to prevent overlapping requests
- User-friendly error messages for network issues

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | Production Railway URL |
| `REACT_APP_ENVIRONMENT` | Environment identifier | `production` |
| `REACT_APP_DEBUG_MODE` | Enable debug logging | `false` |

### Build Configuration

- **TypeScript**: Strict mode enabled
- **Build**: Optimized production bundle
- **Deployment**: Static site generation compatible

---

## 📈 Performance

- **Bundle Size**: ~65KB gzipped
- **API Caching**: TanStack Query with 30s stale time
- **Loading States**: Skeleton components for better UX
- **Error Recovery**: Automatic retry with exponential backoff

---

## 🔒 Security

- **Environment Variables**: Only `REACT_APP_*` exposed to browser
- **API Security**: All secrets handled by backend
- **CORS**: Backend configured for frontend domain
- **Content Security**: No inline scripts or styles

---

## 📝 Learn More

- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [TanStack Query Guide](https://tanstack.com/query/latest)
- [TypeScript React Handbook](https://www.typescriptlang.org/docs/handbook/react.html)
- [Vercel Deployment Docs](https://vercel.com/docs/concepts/deployments/overview)