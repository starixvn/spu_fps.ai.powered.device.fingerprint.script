# Docker Configuration Guide

## Environment Port Configuration

Your FPS project now supports three environments with specific port mappings:

| Environment | Port | Docker Target | Usage |
|-------------|------|---------------|-------|
| **Development** | 3000 | `development` | Active development with hot reload |
| **Local** | 5000 | `local` | Local testing/debugging |
| **Production** | 5000 | `production` | Production deployment |

## Docker Multi-Stage Build

The `Dockerfile` now uses multi-stage builds with three targets:

```dockerfile
# Development stage - Port 3000
FROM base AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:development"]

# Local stage - Port 5000  
FROM base AS local
ENV NODE_ENV=local
EXPOSE 5000
CMD ["npm", "run", "start:local"]

# Production stage - Port 5000
FROM base AS production
ENV NODE_ENV=production
EXPOSE 5000
CMD ["npm", "run", "start:production"]
```

## Building Docker Images

### Using NPM Scripts (Recommended)
```bash
# Build all environments
npm run docker:build

# Build specific environments
npm run docker:build:dev      # Development (port 3000)
npm run docker:build:local    # Local (port 5000)
npm run docker:build:prod     # Production (port 5000)
```

### Using Docker Commands Directly
```bash
# Build development environment
docker build --target development -t fps-fingerprint:dev .

# Build local environment
docker build --target local -t fps-fingerprint:local .

# Build production environment
docker build --target production -t fps-fingerprint:prod .
```

## Running with Docker Compose

### Development Environment (Port 3000)
```bash
# Using npm script
npm run docker:run:dev

# Using docker-compose directly
docker-compose -f docker-compose.dev.yml up -d
```

### Local Environment (Port 5000)
```bash
# Using npm script
npm run docker:run:local

# Using docker-compose directly
docker-compose -f docker-compose.local.yml up -d
```

### Production Environment (Port 5000)
```bash
# Using npm script
npm run docker:run:prod

# Using docker-compose directly
docker-compose up -d
```

## Docker Compose Files

| File | Environment | Port | Services |
|------|-------------|------|----------|
| `docker-compose.dev.yml` | Development | 3000 | App + Redis (6379) + PostgreSQL (5432) |
| `docker-compose.local.yml` | Local | 5000 | App + Redis (6380) + PostgreSQL (5433) |
| `docker-compose.yml` | Production | 5000 | App + Redis + PostgreSQL + Health checks |

## Management Scripts

### Windows (PowerShell)
```powershell
# Build environments
.\docker-build.bat build dev     # Development
.\docker-build.bat build local   # Local  
.\docker-build.bat build prod    # Production

# Run environments
.\docker-build.bat run dev       # Start development (port 3000)
.\docker-build.bat run local     # Start local (port 5000)
.\docker-build.bat run prod      # Start production (port 5000)

# View logs
.\docker-build.bat logs dev      # Development logs
.\docker-build.bat logs local    # Local logs
.\docker-build.bat logs prod     # Production logs

# Stop all
.\docker-build.bat stop          # Stop all environments
```

### Linux/Mac (Bash)
```bash
# Build environments
./docker-build.sh build dev      # Development
./docker-build.sh build local    # Local
./docker-build.sh build prod     # Production

# Run environments  
./docker-build.sh run dev        # Start development (port 3000)
./docker-build.sh run local      # Start local (port 5000)
./docker-build.sh run prod       # Start production (port 5000)

# View logs
./docker-build.sh logs dev       # Development logs
./docker-build.sh logs local     # Local logs
./docker-build.sh logs prod      # Production logs

# Stop all
./docker-build.sh stop           # Stop all environments
```

## Quick Start Examples

### 1. Development Workflow (Port 3000)
```bash
# Build and run development environment
npm run docker:build:dev
npm run docker:run:dev

# Application available at: http://localhost:3000
# View logs: npm run docker:logs:dev
```

### 2. Local Testing (Port 5000)
```bash
# Build and run local environment
npm run docker:build:local
npm run docker:run:local

# Application available at: http://localhost:5000
# View logs: npm run docker:logs:local
```

### 3. Production Deployment (Port 5000)
```bash
# Build and run production environment
npm run docker:build:prod
npm run docker:run:prod

# Application available at: http://localhost:5000
# View logs: npm run docker:logs:prod
```

## Environment Variables

Each environment loads its specific `.env` file:

- **Development**: `.env.development` → Port 3000
- **Local**: `.env.local` → Port 5000  
- **Production**: `.env.production` → Port 5000

## Health Checks

Production environment includes health checks:
```dockerfile
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Troubleshooting

### Port Conflicts
If ports are already in use:
```bash
# Check what's using ports
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Stop all Docker environments
npm run docker:stop
```

### View Container Status
```bash
# Check running containers
docker ps

# View all environment logs
docker-compose -f docker-compose.dev.yml logs
docker-compose -f docker-compose.local.yml logs
docker-compose logs
```

This configuration provides clean separation between environments while maintaining consistent Docker practices!
