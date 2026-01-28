# Operations & Infrastructure

This directory contains all DevOps infrastructure for the Real Estate World MVP platform.

## Directory Structure

```
ops/
├── compose/              # Docker Compose configurations
│   ├── docker-compose.dev.yml   # Development stack
│   ├── docker-compose.prod.yml  # Production stack
│   └── README.md               # Compose documentation
├── docker/               # Dockerfiles and configs
│   ├── backend.dockerfile       # NestJS backend (multi-stage)
│   ├── frontend.dockerfile      # React frontend (nginx runtime)
│   ├── frontend.dev.dockerfile  # React dev server (Vite HMR)
│   ├── db.dockerfile           # PostgreSQL 18 + PostGIS
│   ├── nginx.conf              # Nginx config for frontend container
│   ├── nginx-proxy.conf        # Nginx reverse proxy for production
│   └── init-postgis.sh         # PostGIS initialization script
└── README.md            # This file
```

## Quick Start

### Development (Local Docker)

```bash
# From project root
npm run docker:dev:build

# Or manually
cd ops/compose
docker compose -f docker-compose.dev.yml up --build
```

**Services running**:
- Frontend: http://localhost:8080 (Vite with HMR)
- Backend: http://localhost:3000 (NestJS with auto-reload)
- Database: localhost:5432 (PostgreSQL 18 + PostGIS)
- Debugger: localhost:9229 (Node.js Inspector)

### Production

```bash
cd ops/compose

# Setup environment (CRITICAL: Use real secrets!)
cp ../../.env.example .env.production
nano .env.production

# Build and deploy
docker compose -f docker-compose.prod.yml up -d --build
```

**Services running**:
- Public URL: http://localhost (nginx reverse proxy)
- API (via proxy): http://localhost/api/*
- Database: localhost:5432 (internal only)

## Infrastructure Components

### 1. Dockerfiles (Multi-stage Builds)

#### Backend (`docker/backend.dockerfile`)
- **Base**: Node.js 20 (Debian Bookworm for Prisma OpenSSL compatibility)
- **Build Stage**: Installs deps, generates Prisma client, compiles TypeScript
- **Runtime Stage**: Production dependencies only, runs compiled JS
- **Optimizations**: Multi-stage reduces image size by ~60%
- **Healthcheck**: `curl http://localhost:3000/health`
- **Migrations**: Auto-runs `prisma migrate deploy` on startup

#### Frontend (`docker/frontend.dockerfile`)
- **Base (build)**: Node.js 20 Alpine
- **Base (runtime)**: Nginx 1.25 Alpine
- **Build Stage**: Runs Vite build, produces static bundle
- **Runtime Stage**: Nginx serves static files on port 8080
- **Optimizations**: Multi-stage, static files only (~50MB final image)
- **SPA Routing**: Nginx configured to fallback to index.html for React Router

#### Frontend Dev (`docker/frontend.dev.dockerfile`)
- **Base**: Node.js 20 Alpine
- **Purpose**: Development only, runs Vite dev server
- **HMR**: Hot Module Reload enabled, source mounted as volume
- **Port**: 8080 (Vite dev server)

#### Database (`docker/db.dockerfile`)
- **Base**: PostgreSQL 18 Alpine
- **Extensions**: PostGIS (for geospatial queries - property locations)
- **Initialization**: `init-postgis.sh` enables PostGIS on first run
- **Healthcheck**: `pg_isready -U postgres`
- **Volumes**: Persistent data at `/var/lib/postgresql/data`

### 2. Docker Compose Stacks

#### Development (`compose/docker-compose.dev.yml`)
**Features**:
- Hot-reload for backend (source mounted)
- Vite HMR for frontend (source mounted)
- Node.js debugger port exposed (9229)
- Named volumes for node_modules (prevent conflicts)
- Healthcheck dependencies (backend waits for db)

**Ports**:
- 3000: Backend API
- 8080: Frontend (Vite)
- 5432: PostgreSQL
- 9229: Node debugger

**Networks**: `realestate_dev` (bridge)

#### Production (`compose/docker-compose.prod.yml`)
**Features**:
- Optimized builds (multi-stage, production deps only)
- Nginx reverse proxy (routes /api to backend, / to frontend)
- Healthchecks on all services
- Resource limits (CPU, memory)
- Restart policies (`always`)
- Persistent volumes for database only

**Ports**:
- 80: Nginx reverse proxy (public)
- 443: HTTPS (when SSL enabled)
- 3000: Backend (internal only)
- 5432: Database (backups/management only)

**Networks**: `realestate_prod` (bridge)

### 3. Nginx Configurations

#### `nginx.conf` (Frontend Container)
- Serves React static build from `/usr/share/nginx/html`
- SPA routing: All routes → index.html
- Static asset caching: 30 days
- Listens on port 8080

#### `nginx-proxy.conf` (Production Reverse Proxy)
- Routes `/api/*` → `http://backend:3000/`
- Routes `/*` → `http://frontend:8080/`
- Health check at `/health`
- HTTPS support (commented, requires SSL certs)
- Client max body size: 20MB (photo uploads)
- Gzip compression enabled

## CI/CD Pipelines (GitHub Actions)

Located in `.github/workflows/`:

### 1. `lint.yml`
**Trigger**: Push to any branch, PRs  
**Steps**: ESLint, Prettier check  
**Exit**: Fails if linting errors

### 2. `build.yml`
**Trigger**: Push to any branch, PRs  
**Steps**:
1. Install dependencies (`npm ci`)
2. TypeScript type check
3. Build backend (NestJS)
4. Build frontend (Vite)
5. Upload artifacts (dist/ directories)

**Exit**: Fails if build errors

### 3. `test.yml`
**Trigger**: Push to any branch, PRs  
**Jobs**:
- **Backend Tests**: Jest unit tests, coverage upload
- **Frontend Tests**: Jest + RTL, coverage upload
- **E2E Tests** (main branch only): Cypress, smoke tests

**Exit**: Fails if tests fail or coverage below threshold

### 4. `deploy.yml`
**Trigger**: Push to `main` branch only  
**Steps**:
1. Build Docker images (backend, frontend, db)
2. Push to Docker registry (Docker Hub or AWS ECR)
3. Deploy to staging environment
4. Run smoke tests on staging
5. Deploy to production (manual approval)
6. Run smoke tests on production
7. Slack notification (success/failure)

**Secrets Required**:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `SLACK_WEBHOOK_URL` (optional)

## Environment Configuration

### Development (`.env.local`)
```bash
DB_NAME=realestate
DB_USER=postgres
DB_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/realestate
JWT_SECRET=dev_jwt_secret_32_chars_minimum_123456789abc
REFRESH_TOKEN_SECRET=dev_refresh_secret_32_chars_min_123456789abc
VITE_API_URL=http://localhost:3000
```

### Production (`.env.production`)
**CRITICAL**: Use secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)

```bash
DB_NAME=realestate_prod
DB_USER=postgres
DB_PASSWORD=<STRONG_PASSWORD_FROM_SECRETS_MANAGER>
DATABASE_URL=postgresql://postgres:<PASSWORD>@db:5432/realestate_prod
JWT_SECRET=<256_BIT_SECRET_FROM_SECRETS_MANAGER>
REFRESH_TOKEN_SECRET=<256_BIT_SECRET_FROM_SECRETS_MANAGER>
STRIPE_API_KEY=<LIVE_STRIPE_KEY>
VITE_API_URL=https://api.realestate-world.com
```

**Never commit production secrets to Git!**

## Build & Run Commands

### Build Docker Images

```bash
# Backend
docker build -f ops/docker/backend.dockerfile -t realestate-backend:latest .

# Frontend (production)
docker build -f ops/docker/frontend.dockerfile -t realestate-frontend:latest .

# Frontend (dev)
docker build -f ops/docker/frontend.dev.dockerfile -t realestate-frontend:dev .

# Database
docker build -f ops/docker/db.dockerfile -t realestate-db:latest .
```

### Run Individual Containers

```bash
# Database
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=realestate \
  --name realestate-db \
  realestate-db:latest

# Backend (requires db running)
docker run -d -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:postgres@db:5432/realestate \
  -e JWT_SECRET=your-secret \
  --link realestate-db:db \
  --name realestate-backend \
  realestate-backend:latest

# Frontend
docker run -d -p 8080:8080 \
  --name realestate-frontend \
  realestate-frontend:latest
```

## Healthchecks

All containers have health checks to ensure proper startup sequence:

```bash
# Check health status
docker compose -f ops/compose/docker-compose.dev.yml ps

# Expected output:
# NAME                     STATUS
# realestate_db_dev        Up (healthy)
# realestate_backend_dev   Up (healthy)
# realestate_frontend_dev  Up
```

**Healthcheck Endpoints**:
- Database: `pg_isready -U postgres`
- Backend: `curl http://localhost:3000/health`
- Frontend: `curl http://localhost:8080/`
- Nginx Proxy: `curl http://localhost/health`

## Troubleshooting

### "Port already in use" error
```bash
# Find process using port
lsof -i :3000
lsof -i :8080
lsof -i :5432

# Or change ports via environment variables
BACKEND_PORT=3001 FRONTEND_PORT=8081 docker compose up
```

### Backend can't connect to database
```bash
# Check database is healthy
docker compose ps

# Verify DATABASE_URL environment variable
docker compose exec backend env | grep DATABASE_URL

# Manually test database connection
docker compose exec db psql -U postgres -d realestate
```

### Migrations not running
```bash
# Run migrations manually
docker compose exec backend npx prisma migrate deploy --schema=./db/schema.prisma

# Check migration status
docker compose exec backend npx prisma migrate status --schema=./db/schema.prisma
```

### Frontend can't reach backend
```bash
# Check VITE_API_URL is correct
docker compose exec frontend env | grep VITE_API_URL

# Test backend from frontend container
docker compose exec frontend wget -q http://backend:3000/health -O -
```

### Image build fails
```bash
# Clear Docker cache and rebuild
docker compose build --no-cache backend

# Or rebuild all
docker compose build --no-cache
```

## Performance & Resource Usage

### Development Stack
- **Database**: ~200MB RAM, <10% CPU
- **Backend**: ~300MB RAM, 5-15% CPU (varies with requests)
- **Frontend (dev)**: ~400MB RAM, 10-20% CPU (Vite dev server)
- **Total**: ~1GB RAM, Docker overhead ~500MB

### Production Stack
- **Database**: ~200MB RAM (scales with data)
- **Backend**: ~150MB RAM (optimized build)
- **Frontend (nginx)**: ~20MB RAM
- **Nginx Proxy**: ~10MB RAM
- **Total**: ~400MB RAM

## Security Considerations

✅ **Implemented**:
- Multi-stage builds (minimize attack surface)
- Non-root users in containers (where possible)
- Healthchecks (detect compromised containers)
- No secrets in Dockerfiles (use environment variables)
- Production network isolation (internal services not exposed)

⚠️ **TODO (Production)**:
- Enable HTTPS (SSL/TLS certificates)
- Use secrets manager (AWS Secrets Manager, Vault)
- Enable Docker Content Trust (image signing)
- Implement rate limiting (nginx)
- Add WAF (Web Application Firewall)
- Database encryption at rest
- Regular security scans (Snyk, Trivy)

## Monitoring & Logging

### Current Setup (Local)
- Docker logs: `docker compose logs -f`
- Healthchecks: Manual via `docker compose ps`

### Production TODO
- **Metrics**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) or CloudWatch
- **APM**: New Relic, Datadog, or Application Insights
- **Alerts**: PagerDuty, Opsgenie for critical failures

## Deployment Targets

### Option 1: Single VM (DigitalOcean, Linode)
- Install Docker + Docker Compose
- Clone repo, run `docker compose up -d`
- Setup reverse proxy (Caddy, Traefik) for HTTPS
- Use systemd for auto-restart

### Option 2: AWS ECS (Elastic Container Service)
- Push images to ECR
- Create ECS task definitions (from compose file)
- Use ALB (Application Load Balancer) for routing
- RDS for managed PostgreSQL

### Option 3: Kubernetes (EKS, GKE, AKS)
- Convert compose to Kubernetes manifests (Kompose)
- Deploy to managed cluster
- Use Ingress for routing
- Managed database service

### Option 4: Docker Swarm
- Simple orchestration (alternative to Kubernetes)
- Use existing compose files with `docker stack deploy`
- Built-in load balancing

## Next Steps

1. **Setup CI/CD Secrets**: Add `DOCKER_USERNAME`, `DOCKER_PASSWORD` to GitHub Secrets
2. **Test Workflows**: Push to `main` branch, verify pipelines run
3. **Deploy Staging**: Configure staging environment, test deployment
4. **SSL Certificates**: Obtain Let's Encrypt certs, enable HTTPS
5. **Monitoring**: Setup Prometheus, Grafana, alerting
6. **Backups**: Automate PostgreSQL backups (pg_dump, S3)
7. **CDN**: Configure CloudFront/Cloudflare for static assets

## Support

For issues with infrastructure:
1. Check logs: `docker compose logs -f <service>`
2. Verify health: `docker compose ps`
3. Review environment: `docker compose exec <service> env`
4. Consult docs: `ops/compose/README.md`

---

**Last Updated**: 2026-01-28  
**Maintained By**: DevOps Agent  
**Node.js**: 20 LTS  
**PostgreSQL**: 18 Alpine + PostGIS  
**Nginx**: 1.25 Alpine
