# Environment Configuration Guide

## Overview
This project supports multiple environments with different port configurations:

- **Local/Development**: Port 3000
- **Production**: Port 5000

## Available Commands

### Development (Port 3000)
```bash
# Development server with hot reload
npm run dev:server              # Local environment (port 3000)
npm run dev:development          # Development environment (port 3000)

# Built application
npm run start:local              # Local environment (port 3000)
npm run start:development        # Development environment (port 3000)
```

### Production (Port 5000)
```bash
# Production server
npm run start:production         # Production environment (port 5000)
```

## Environment Files

| File | Environment | Port | Description |
|------|-------------|------|-------------|
| `.env.local` | local | 3000 | Local development with debug features |
| `.env.development` | development | 3000 | Development server environment |
| `.env.production` | production | 5000 | Production environment with security |

## Key Features by Environment

### Local Environment
- Port: **3000**
- Debug mode: **Enabled**
- CORS: **Permissive** (allows all origins)
- Logging: **Debug level**
- Cache: **Disabled** for development

### Development Environment  
- Port: **3000**
- Debug mode: **Enabled**
- CORS: **Restricted** to development domains
- Logging: **Debug level**
- Cache: **Minimal caching**

### Production Environment
- Port: **5000**
- Debug mode: **Disabled**
- CORS: **Strict** (production domains only)
- Logging: **Warn level** only
- Cache: **Aggressive caching**
- Security: **Enhanced validation**

## Quick Start

1. **For Local Development:**
   ```bash
   npm run dev:server
   # Runs on http://localhost:3000
   ```

2. **For Production:**
   ```bash
   npm run build
   npm run start:production
   # Runs on http://localhost:5000
   ```

## Docker Usage

### Development
```bash
docker-compose -f docker-compose.dev.yml up
# Runs on port 3000
```

### Production
```bash
docker-compose up
# Runs on port 5000
```

## Environment Variables

Copy `.env.example` to create your environment files:

```bash
# For local development
cp .env.example .env.local

# For production (fill in real values)
cp .env.example .env.production
```

## Testing Different Environments

```bash
# Test local environment
npm run start:local
# Should show: "📡 Server will run on port: 3000"

# Test production environment  
npm run start:production
# Should show: "📡 Server will run on port: 5000"
```

## Environment Validation

The system automatically validates:
- ✅ Required environment variables
- ✅ Port ranges (1-65535)
- ✅ Security settings in production
- ✅ Configuration consistency

## Troubleshooting

### Port Already in Use
If you see `EADDRINUSE`, another service is using the port:
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Check what's using port 5000
netstat -ano | findstr :5000
```

### Missing Environment Variables
The system will show clear error messages for missing required variables in production mode.
