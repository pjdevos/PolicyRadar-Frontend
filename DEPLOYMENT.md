# Policy Radar Deployment Guide

This guide covers multiple deployment options for the Policy Radar application, from simple hosting to production-ready containerized deployments.

## 📋 Prerequisites

- Python 3.9+ 
- Node.js 16+
- npm or yarn
- (Optional) Docker & Docker Compose

## 🚀 Deployment Options

### Option 1: Simple Static + API Deployment

#### Step 1: Build the Frontend
```bash
cd frontend
npm install
npm run build
```

#### Step 2: Deploy Frontend
Upload the contents of `frontend/build/` to any static web hosting service:
- **Netlify**: Drag & drop the build folder
- **Vercel**: Import the repo and set build command to `cd frontend && npm run build`
- **GitHub Pages**: Use GitHub Actions with the build folder
- **AWS S3**: Upload to S3 bucket with static website hosting

#### Step 3: Deploy API Server
On your server (VPS, cloud instance, etc.):
```bash
# Install dependencies
pip install -r requirements.txt

# Copy data and vectors
# (Upload your data/ and vectors/ folders)

# Run production server
python api_server_prod.py
```

#### Step 4: Update Frontend Configuration
Set the `REACT_APP_API_BASE_URL` environment variable to your API server URL and rebuild:
```bash
REACT_APP_API_BASE_URL=https://your-api-domain.com/api npm run build
```

### Option 2: Docker Deployment (Recommended)

#### Single Container
```bash
# Build the image
docker build -t policy-radar .

# Run the container
docker run -d -p 8001:8001 --name policy-radar-app policy-radar
```

#### Docker Compose (Production Ready)
```bash
# Start the full stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Cloud Platform Deployments

#### Heroku
1. Create a `Procfile`:
```
web: python api_server_prod.py
```

2. Set environment variables in Heroku dashboard:
```
API_HOST=0.0.0.0
API_PORT=$PORT
CORS_ORIGINS=https://your-app.herokuapp.com
```

3. Deploy:
```bash
heroku create your-policy-radar-app
git push heroku main
```

#### Railway
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push

#### DigitalOcean App Platform
1. Connect your GitHub repo
2. Configure build settings:
   - Build Command: `cd frontend && npm run build`
   - Run Command: `python api_server_prod.py`
3. Set environment variables in dashboard

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8001

# Frontend Configuration  
REACT_APP_API_BASE_URL=https://your-api-domain.com/api

# Security
CORS_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# Logging
LOG_LEVEL=info
```

### Production Considerations

1. **Domain & SSL**:
   - Use HTTPS in production
   - Configure your domain's DNS to point to your server
   - Use Let's Encrypt for free SSL certificates

2. **Security**:
   - Update CORS_ORIGINS to match your domain
   - Use environment variables for sensitive data
   - Enable rate limiting (included in nginx config)

3. **Performance**:
   - Enable gzip compression (included in nginx config)
   - Use CDN for static assets
   - Monitor API response times

4. **Monitoring**:
   - Health check endpoint: `/api/health`
   - Log aggregation with services like LogDNA or DataDog
   - Uptime monitoring with Pingdom or UptimeRobot

## 🎯 Quick Deploy Commands

### Automated Deployment Script
```bash
# Linux/macOS
chmod +x deploy.sh
./deploy.sh

# Windows
deploy.bat
```

### Manual Quick Deploy
```bash
# 1. Install dependencies
pip install -r requirements.txt
cd frontend && npm install && cd ..

# 2. Build frontend
cd frontend && npm run build && cd ..

# 3. Start API server
python api_server_prod.py
```

## 📊 Monitoring & Maintenance

### Health Checks
- API Health: `GET /api/health`
- Document Count: Check the `documents` field in health response
- Response Time: Monitor `/api/documents` endpoint

### Logs
- Application logs: Check console output
- Access logs: If using nginx, check `/var/log/nginx/access.log`
- Error logs: Check `/var/log/nginx/error.log`

### Updates
1. Pull latest code: `git pull origin main`
2. Rebuild frontend: `cd frontend && npm run build`
3. Restart API server: `python api_server_prod.py`
4. For Docker: `docker-compose down && docker-compose up -d --build`

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check `CORS_ORIGINS` environment variable
   - Ensure frontend URL matches CORS configuration

2. **API Not Loading Data**:
   - Check `data/` and `vectors/` folders exist
   - Verify `items.jsonl` or `documents.pkl` files are present
   - Check API health endpoint

3. **Frontend Build Issues**:
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules`: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

4. **Docker Issues**:
   - Check Docker logs: `docker logs <container-id>`
   - Verify port availability: `netstat -tlnp | grep 8001`
   - Restart containers: `docker-compose restart`

### Support
For deployment issues, check:
1. Server logs for error messages
2. Browser developer console for frontend errors
3. API health endpoint for backend status
4. Network connectivity between frontend and API

## 🌍 Production URLs Structure

After deployment, your application will be available at:
- **Frontend**: `https://your-domain.com`
- **API**: `https://your-domain.com/api/*`
- **API Docs**: `https://your-domain.com/api/docs`
- **Health Check**: `https://your-domain.com/api/health`

Enjoy your deployed Policy Radar application! 🚀