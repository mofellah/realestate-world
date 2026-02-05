# Docker Compose Setup

This directory contains Docker Compose configurations for local development and production deployment of the Real Estate World MVP platform.

## Files

- **docker-compose.dev.yml** - Development stack with hot-reload for backend and frontend
- **docker-compose.prod.yml** - Production stack with optimized builds, nginx reverse proxy, and healthchecks
- **.env.example** - Public template for all environment variables (located in project root)

## Architecture

### Development Stack
- **Database**: PostgreSQL 18 + PostGIS extension
- **Backend**: NestJS + Fastify (Node.js 20, hot-reload enabled, debugger on port 9229)
- **Frontend**: React 18 + Vite (HMR enabled on port 8080)

### Production Stack
- **Database**: PostgreSQL 18 + PostGIS (persistent volumes)
- **Backend**: NestJS + Fastify (production build, healthchecks)
- **Frontend**: React 18 + Vite (nginx serving static build on port 8080)
- **Nginx Reverse Proxy**: Routes /api to backend, serves frontend static files on port 80/443

## Prerequisites

- Docker 24+ and Docker Compose v2
- Node.js 20+ (for local development outside containers)
- At least 4GB RAM available for containers
- Ports available: 3000 (backend), 8080 (frontend), 5432 (database), 9229 (debugger)

## Quick Start (Development)

### 1. Setup Environment Variables

```bash
# Copy environment template
cp ../../.env.example .env.local

# Edit .env.local with your configuration
# At minimum, update JWT_SECRET and REFRESH_TOKEN_SECRET
```

### 2. Start Development Stack

```bash
cd ops/compose

# Build and start all services (first time)
docker compose -f docker-compose.dev.yml up --build

# Or use npm script from project root
npm run docker:dev:build
```

### 3. Access Services

- **Frontend**: http://localhost:8080 (Vite dev server with HMR)
- **Backend API**: http://localhost:3000
- **Backend Health**: http://localhost:3000/health
- **Database**: localhost:5432 (user: postgres, password: postgres, db: realestate)
- **Node Debugger**: localhost:9229 (attach VS Code debugger)

## Development Workflow

```bash
# View logs
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend

# Run database migrations
docker compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy --schema=./db/schema.prisma

# Seed database
docker compose -f docker-compose.dev.yml exec backend npm run seed --workspace=db

# Rebuild specific service
docker compose -f docker-compose.dev.yml up --build backend

# Stop containers
docker compose -f docker-compose.dev.yml down

# Clean up volumes (reset database)
docker compose -f docker-compose.dev.yml down -v

# Restart single service
docker compose -f docker-compose.dev.yml restart backend
```

### Hot Reload & Debugging

- **Backend HMR**: Source files in `apps/backend/src` are mounted, changes trigger automatic restart
- **Frontend HMR**: Vite watches `apps/frontend/src`, changes appear instantly in browser
- **Node Debugger**: Attach VS Code debugger to port 9229 for backend debugging

**VS Code Debug Configuration** (add to `.vscode/launch.json`):
```json
{
  "type": "node",
  "request": "attach",
  "name": "Docker: Attach to Backend",
  "port": 9229,
  "address": "localhost",
  "localRoot": "${workspaceFolder}/apps/backend",
  "remoteRoot": "/app/apps/backend",
  "protocol": "inspector"
}
```

## Production Deployment

### Setup Environment

```bash
cd ops/compose

# Create production environment file
cp ../../.env.example .env.production

# Edit with REAL production values (use secrets manager in production!)
# CRITICAL: Change JWT_SECRET, REFRESH_TOKEN_SECRET, DB_PASSWORD, STRIPE keys
nano .env.production
```

### Build and Deploy

```bash
# Build and start production stack
docker compose -f docker-compose.prod.yml up -d --build

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check health of all services
docker compose -f docker-compose.prod.yml ps

# Stop services gracefully
docker compose -f docker-compose.prod.yml down
```

### Access Production Services

- **Public URL**: http://localhost (nginx reverse proxy on port 80)
- **Backend API** (via proxy): http://localhost/api/* → routed to backend:3000
- **Frontend**: http://localhost → served from nginx
- **Health Check**: http://localhost/health
- **Database**: localhost:5432 (for backups/management only, should not be publicly exposed)

### Production Healthchecks

All services have healthchecks that ensure proper startup sequence:
1. **Database**: `pg_isready` confirms PostgreSQL is accepting connections
2. **Backend**: `curl http://localhost:3000/health` validates API is responding
3. **Frontend**: `curl http://localhost:8080/` confirms nginx is serving files
4. **Nginx Proxy**: `curl http://localhost/health` validates reverse proxy

## Environment Variables

All services read from `.env.local` (dev) or `.env.prod` (production).

### Database

- `DB_NAME` - Database name (default: boilerplate)
- `DB_USER` - PostgreSQL user (default: postgres)
- `DB_PASSWORD` - PostgreSQL password
- `DB_PORT` - PostgreSQL port (default: 5432)

### Backend

- `NODE_ENV` - Environment (development/production)
- `BACKEND_PORT` - Backend service port (default: 3000)
- `JWT_SECRET` - Signing secret for JWT tokens
- `JWT_EXPIRATION` - Token expiration in seconds (default: 900)
- `REFRESH_TOKEN_SECRET` - Signing secret for refresh tokens
- `REFRESH_TOKEN_EXPIRATION` - Refresh token expiration in seconds (default: 604800)

### Frontend

- `FRONTEND_PORT` - Frontend service port (default: 5173 dev, 80 prod)
- `VITE_API_URL` - Backend API URL for frontend (default: http://localhost:3000)

## Service Details

### Database (PostgreSQL)

- **Image**: postgres:18-alpine (lightweight, latest stable PostgreSQL)
- **Volume**: Persistent data storage (`postgres_data_dev` or `postgres_data_prod`)
- **Health Check**: Validates service is ready before backend starts
- **Network**: Internal only (boilerplate_dev or boilerplate_prod)

### Backend (NestJS + Fastify)

- **Build**: Multi-stage build, Alpine-based for minimal size
- **Build Stage**: Installs deps, compiles TypeScript
- **Runtime Stage**: Copies only built artifacts and node_modules
- **Volumes (dev)**: Source code mounted for hot-reload
- **Volumes (prod)**: None (use built image only)
- **Health Check**: Validates /health endpoint before frontend routes traffic
- **Signal Handling**: dumb-init ensures proper SIGTERM handling

### Frontend (React + Vite)

**Development**:
- **Build**: Mounts source code for HMR (Hot Module Reload)
- **Dev Server**: Vite server running on port 5173
- **Features**: Auto-reload on file changes

**Production**:
- **Build Stage**: Multi-stage build, produces static bundle
- **Runtime**: nginx serves static files, reverse-proxies `/api/` to backend
- **SPA Routing**: All routes fallback to index.html (React Router)
- **Cache**: Static assets (js, css, images) cached for 30 days

## Networking

### Development Network (`boilerplate_dev`)

All services can communicate via container names:
- Backend accesses database: `postgresql://postgres:postgres@db:5432/boilerplate`
- Frontend calls backend: `http://localhost:3000` (from host) or `http://backend:3000` (from container)

### Production Network (`boilerplate_prod`)

- Frontend (nginx) reverse-proxies backend requests
- Backend and database are internal only
- Only frontend ports (80, 443) exposed to external traffic

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs backend

# Common issues:
# 1. Database not ready - wait for "db: service_healthy"
# 2. Environment variables missing - verify .env.local exists
# 3. Port conflict - ensure 3000 is available
```

### Frontend can't reach backend

```bash
# From frontend container, test connectivity
docker-compose -f docker-compose.dev.yml exec frontend wget -q http://backend:3000/health -O -

# Verify VITE_API_URL in .env.local
# Development: VITE_API_URL=http://localhost:3000
# Production: VITE_API_URL=https://api.example.com (actual domain)
```

### Database connection fails

```bash
# Verify database is healthy
docker-compose -f docker-compose.dev.yml ps

# Connect to database manually
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d boilerplate

# Check environment in backend
docker-compose -f docker-compose.dev.yml exec backend env | grep DATABASE
```

### Port already in use

```bash
# Find process using port
lsof -i :3000
lsof -i :5173
lsof -i :5432

# Or specify custom ports via environment
BACKEND_PORT=3001 FRONTEND_PORT=5174 DB_PORT=5433 docker-compose -f docker-compose.dev.yml up
```

## Performance Notes

### Development

- Vite dev server: ~100ms HMR (hot reload)
- Backend: Watches source code, restarts on changes
- Database: In-container with local volume (fast I/O)

### Production

- Alpine-based images: ~150-200MB per container
- Multi-stage builds: Only runtime dependencies included
- nginx: Serves static assets with gzip compression
- Healthchecks: Ensure services are ready before traffic flows

## See Also

- [ARCHITECTURE.md](../../docs/ARCHITECTURE.md) - System design and choices
- [PROJECT_CONTEXT.md](../../docs/PROJECT_CONTEXT.md) - Database schema and configuration
- `.env.example` - All available environment variables

## References

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [NestJS Docker Setup](https://docs.nestjs.com/deployment/docker)
- [Vite Guide](https://vitejs.dev/)
