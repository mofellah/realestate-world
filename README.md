# Boilerplate: Production-Ready Monorepo

A **scalable, type-safe, BDD/TDD-first boilerplate** with React 19 + NestJS + PostgreSQL + Prisma, optimized for AI-driven development.

---

## 🎯 What This Is

A **reusable foundation** for building web applications with:
- ✅ **Modern stack**: React 19 (Vite), NestJS (Fastify), PostgreSQL 18, Prisma ORM
- ✅ **Monorepo ready**: npm workspaces, shared packages (types, utils, config, logger)
- ✅ **Secure auth**: JWT + refresh tokens + role-based access control (RBAC)
- ✅ **Observable**: Structured JSON logging, correlation IDs, health checks
- ✅ **Developer-friendly**: Hot-reload (frontend + backend), debugging support, test-first
- ✅ **AI-optimized**: Explicit decisions, patterns, and locations for AI coding agents
- ✅ **Production-ready**: Multi-environment Docker Compose (dev, prod), CI/CD pipeline

---

## 📦 What's Inside

```
apps/
├── frontend/          React 19 + Vite + Tailwind CSS
└── backend/           NestJS + Fastify + Prisma

packages/
├── types/             Shared TypeScript types
├── utils/             Shared utilities
├── config/            Environment validation
└── logger/            Observability module

db/
├── schema.prisma      Prisma schema (Auth/Authz)
├── migrations/        Auto-generated migrations
└── seeds/             Seed data

ops/
├── docker/            Dockerfiles
└── compose/           Docker Compose configs (dev/prod)

docs/
├── ARCHITECTURE.md    System design & why choices
├── PROJECT_CONTEXT.md Database schema & auth flows
├── AGENT_FRAMEWORK.md AI agent guide (decisions, patterns)
├── TEST_STRATEGY.md   Testing approach & locations
├── BDD_FORMAT.md      BDD scenarios & mapping
├── DEBUG_SETUP.md     Debugging guide
└── INDEX.md           Documentation index
```

---

## 🚀 Quick Start

### 📚 Recommended Reading Order

**New to this project?** Read documentation in this order:

1. **This file** (README.md) — 5 min overview
2. [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 20 min system design
3. [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) — 30 min database, auth, APIs
4. [docs/AGENT_FRAMEWORK.md](docs/AGENT_FRAMEWORK.md) — 30 min for AI agents (decision registry)
5. [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md) — 20 min testing approach
6. [specs/BDD_FORMAT.md](specs/BDD_FORMAT.md) — 15 min BDD scenarios
7. [docs/DEBUG_SETUP.md](docs/DEBUG_SETUP.md) — 15 min debugging
8. [docs/INDEX.md](docs/INDEX.md) — Complete documentation index

**For AI Agents**: Start with [docs/AGENT_FRAMEWORK.md](docs/AGENT_FRAMEWORK.md) (decision registry DR-001 to DR-010)

---

### 1. Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ (for local development)

### 2. Start Development Stack

```bash
# Start containers (frontend, backend, database)
docker compose -f ops/compose/docker-compose.dev.yml up
```

This starts:
- **Frontend**: http://localhost:5173 (React + Vite with HMR)
- **Backend**: http://localhost:3000 (NestJS + Fastify)
- **Database**: http://localhost:5432 (PostgreSQL)

### 3. Setup Database (First Run Only)

```bash
# Apply migrations
cd db
npx prisma migrate deploy

# Seed baseline data (roles, permissions, admin user)
npm run seed

# OR seed with test fixtures (dev/test environments)
SEED_TEST_DATA=true npm run seed
```

**Test Credentials**:
- Admin: `admin@example.com` / `Admin123!`
- User: `user@example.com` / `User123!`
- Moderator (if fixtures seeded): `moderator@example.com` / `Moderator123!`

### 4. Verify It Works

```bash
# Check frontend
curl http://localhost:5173

# Check backend health
curl http://localhost:3000/health

# Try login (requires database seeded)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'

# Try registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","passwordConfirmation":"TestPass123!","name":"Test User"}'
```

### 5. Open in Browser

- Frontend: http://localhost:5173
- API Docs: http://localhost:3000/api (Swagger)
- Database (Prisma Studio): `cd db && npx prisma studio` (port 5555)

---

## 🛠️ Development

### Install Dependencies

```bash
npm install  # Installs all workspaces
```

### Run Tests

```bash
npm run test              # Jest (unit + integration)
npm run test:coverage    # Coverage report
npm run e2e             # Cypress (E2E)
npm run test:all        # All tests
```

### Code Quality

```bash
npm run lint            # ESLint
npm run format:check   # Prettier check
npm run format         # Prettier auto-format
npm run type-check    # TypeScript strict
```

### Debug Backend

1. Open **chrome://inspect**
2. Click "inspect" on the Node.js process
3. Set breakpoints, step through code

See [docs/DEBUG_SETUP.md](docs/DEBUG_SETUP.md) for details.

---

## 📚 Documentation

**Start here**: [docs/INDEX.md](docs/INDEX.md)

Key documents:
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — System design & why each choice was made
- **[PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md)** — Database schema, auth flows, API contracts
- **[AGENT_FRAMEWORK.md](docs/AGENT_FRAMEWORK.md)** ⭐ **For AI agents** — Decisions, patterns, workflows
- **[TEST_STRATEGY.md](docs/TEST_STRATEGY.md)** — Testing approach, BDD/TDD discipline
- **[BDD_FORMAT.md](specs/BDD_FORMAT.md)** — How to write BDD scenarios
- **[DEBUG_SETUP.md](docs/DEBUG_SETUP.md)** — Debugging guide (backend, frontend, logs)

---

## 🔑 Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, SCSS |
| **Backend** | NestJS, Fastify, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 18, Prisma migrations |
| **Auth** | JWT (access + refresh), bcrypt, RBAC |
| **Testing** | Jest, React Testing Library, Cypress |
| **Observability** | Winston (structured JSON logs), correlation IDs |
| **Container** | Docker, Docker Compose |
| **Monorepo** | npm workspaces |

---

## 📋 Development Workflow

### 1. BDD First
Write a Gherkin scenario in `specs/bdd/`:

```gherkin
Scenario: User logs in successfully
  Given a user with email "user@example.com" exists
  When the user submits valid credentials
  Then user receives access token
```

See [specs/BDD_FORMAT.md](specs/BDD_FORMAT.md).

### 2. Write Tests
Translate scenario to test cases:

```bash
# Unit test (auth.service.spec.ts)
# Integration test (auth-flow.spec.ts)
# E2E test (auth.cy.ts)
```

See [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md).

### 3. Implement Code
Write minimal code to pass tests.

### 4. Verify
```bash
npm run test:all    # All tests pass
npm run test:coverage # 80%+ coverage
npm run lint        # No linting errors
```

---

## 🔐 Security

- ✅ **JWT with rotation**: Short-lived access tokens + revocable refresh tokens
- ✅ **RBAC**: Role-based access control with fine-grained permissions
- ✅ **Password hashing**: bcrypt (not plaintext, MD5)
- ✅ **Secrets management**: Environment variables (never hardcoded)
- ✅ **SQL injection protection**: Prisma parameterized queries
- ✅ **CORS configured**: Separate dev/prod settings

---

## 📊 Database Schema

**Auth & Authorization**:
- `User`: id, email, password, name, isActive
- `Role`: id, name (admin, user, moderator)
- `UserRole`: user_id, role_id (many-to-many)
- `Permission`: id, resource, action (e.g., "posts:create")
- `RolePermission`: role_id, permission_id (many-to-many)
- `RefreshToken`: id, user_id, token, expiresAt, revokedAt

See [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) for schema details.

---

## 🧪 Testing

**Test Pyramid**:
- **Unit tests** (60%): Jest, test individual functions
- **Integration tests** (25%): Jest, test services + database
- **E2E tests** (15%): Cypress, test full user flows

**Target**: 80%+ code coverage on critical modules.

Run tests:
```bash
npm run test              # Watch mode
npm run test:coverage    # Coverage report
npm run e2e             # Cypress
```

See [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md).

---

## 🚢 Production Deployment

### Build Docker Images

```bash
docker build -f ops/docker/backend.dockerfile -t myapp-backend .
docker build -f ops/docker/frontend.dockerfile -t myapp-frontend .
```

### Run Production Stack

```bash
docker compose -f ops/compose/docker-compose.prod.yml up
```

Features:
- ✅ nginx reverse proxy (SSL, rate limiting)
- ✅ Health checks (auto-restart on failure)
- ✅ Secrets from environment (not hardcoded)
- ✅ Persistent volumes
- ✅ Log aggregation ready

See [ops/compose/docker-compose.prod.yml](ops/compose/docker-compose.prod.yml).

---

## 📈 Scaling (Future: Kubernetes)

This boilerplate is **K8s-ready** but starts with docker-compose. When ready:
- Add Helm charts in `ops/k8s/`
- Use persistent volumes for database
- Configure horizontal pod autoscaling
- Setup service mesh (optional: Istio)

---

## 🤝 Contributing

### Before You Code

1. **Check decisions**: [docs/AGENT_FRAMEWORK.md](docs/AGENT_FRAMEWORK.md)
2. **Find BDD scenario**: [specs/bdd/](specs/bdd/)
3. **Write tests first**: [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md)

### Branch & Commit

```bash
git checkout -b feat/my-feature
git commit -m "feat: add my feature"
git push origin feat/my-feature
```

### PR Checklist

- ✅ Tests written + passing
- ✅ Coverage > 80% on new code
- ✅ Linting passes (`npm run lint`)
- ✅ Documentation updated
- ✅ BDD scenario maps to implementation

---

## 🐛 Debugging

### Backend
```bash
# Node.js Inspector on port 9229
chrome://inspect

# Or VSCode debugger (see .vscode/launch.json)
```

### Frontend
```bash
# Vite dev server with source maps
# React DevTools browser extension
# Chrome DevTools (F12)
```

### Database
```bash
cd db && npx prisma studio  # Visual DB browser
```

See [docs/DEBUG_SETUP.md](docs/DEBUG_SETUP.md).

---

## 📝 Environment Setup

### Copy Template

```bash
cp .env.example .env
```

### Configure Values

```bash
# Backend (.env)
DATABASE_URL="postgresql://postgres:password@localhost:5432/boilerplate"
JWT_SECRET="your-secret-key-min-32-chars"
NODE_ENV="development"

# Frontend (.env)
VITE_API_URL="http://localhost:3001"
```

---

## ✅ Checklist: Is This Ready?

- ✅ Monorepo structure (npm workspaces)
- ✅ Shared packages (types, utils, config, logger)
- ✅ Database schema (Auth/Authz, Prisma)
- ✅ Auth module (JWT, refresh tokens, guards)
- ✅ Health endpoints (frontend + backend)
- ✅ Hot-reload (dev mode)
- ✅ Docker Compose (dev + prod)
- ✅ Tests setup (Jest, Cypress)
- ✅ Logging (Winston, correlation IDs)
- ✅ Documentation (complete)
- ✅ BDD scenarios (detailed)

**Status**: ✅ Ready for Phase 1 implementation.

---

## 🚀 Next Steps

1. **Read** [docs/INDEX.md](docs/INDEX.md) for documentation overview
2. **Review** [docs/AGENT_FRAMEWORK.md](docs/AGENT_FRAMEWORK.md) for decision registry
3. **Start Phase 1**: Initialize monorepo + infrastructure
4. **Write tests**: BDD scenarios → test cases
5. **Implement**: Code to pass tests

---

## 📞 Questions?

See [docs/INDEX.md](docs/INDEX.md) FAQ section.

---

## 📄 License

MIT (or your preferred license)

---

**Built for AI-driven development with strict BDD/TDD discipline.**
