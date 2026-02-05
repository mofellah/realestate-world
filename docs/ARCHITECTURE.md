# Architecture & System Design

**Last Updated**: 2026-01-24  
**Status**: Foundation (Monorepo, no K8s yet)

---

## Overview

This is a **monorepo-based, AI-optimized, BDD/TDD-first boilerplate** for building scalable web applications. It combines:
- **React 18 + Vite** (frontend)
- **NestJS + Fastify + Prisma** (backend & ORM)
- **PostgreSQL 18** (database)
- **npm workspaces** (monorepo coordination)
- **Strict BDD/TDD discipline** (tests & specs first)
- **Multi-environment Docker Compose** (dev with debugging, prod with nginx)

---

## Why These Choices?

### Frontend: React 18 + Vite

**React 18**
- Stable, widely adopted, and compatible with current dependencies
- Mature ecosystem and tooling
- Strong community support

**Vite**
- Sub-100ms HMR (hot module reload) for fast feedback loops
- Native ESM (no webpack complexity)
- Instant dev server startup

**Tailwind CSS + SCSS/PostCSS**
- Utility-first approach reduces CSS bloat
- SCSS/PostCSS for complex theming, variables, mixins
- Minimal CSS bundle size in production

**Why NOT**: Next.js (too opinionated for a boilerplate), Angular (heavyweight), Svelte (smaller ecosystem)

---

### Backend: NestJS + Fastify

**NestJS**
- Decorator-based dependency injection (clear, scalable)
- Built-in guards, interceptors, pipes (clean auth/logging)
- TypeScript first-class support
- OpenAPI/Swagger integration (automatic API docs)

**Fastify** (not Express)
- 2-3x faster than Express
- Better performance under load (critical for scaling)
- Native streaming support
- Modern async/await patterns

**Why NOT**: Express (slower, legacy patterns), Hapi (overcomplicated), Fastify-only (lacks structure)

---

### ORM: Prisma

**Prisma**
- Type-safe query builder (catches errors at compile time)
- Auto-generated migrations (version-controlled DB schema)
- Built-in seeding (test data consistency)
- Excellent developer experience (schema-first)

**Why NOT**: TypeORM (verbose, verbose, verbose), Sequelize (legacy), Raw SQL (unmaintainable)

---

### Database: PostgreSQL 18

- Latest stable, proven in production
- ACID compliance (data integrity)
- PostGIS extension ready (for future spatial data)
- Scaling: physical replication, connection pooling ready

---

### Monorepo: npm Workspaces

- Zero extra tooling (npm 7+ native)
- Shared dependencies (single node_modules for entire project)
- Local package references (e.g., `import { Logger } from "@mono/logger"`)
- Hoisted dependencies, flat install

**Why NOT**: Yarn Workspaces (less mature), Lerna (over-engineered for this scale), Pnpm (less adoption)

---

### Auth: JWT + Refresh Tokens + RBAC

**JWT (stateless)**
- No session table bloat
- Self-contained claims (user ID, roles, permissions)
- Scalable across multiple backend instances

**Refresh Tokens**
- Access token short-lived (15 min) → revocable
- Refresh token long-lived (7 days) → stored in DB
- Rotation on refresh (old token invalidated)

**RBAC (Role-Based Access Control)**
- Users have roles (admin, user, moderator)
- Roles have permissions (resource:action, e.g., "post:create")
- Hierarchical (future enhancement: "admin" can do "user" actions)

---

### Observability: Winston + Correlation IDs

**Winston (JSON Logging)**
- Structured logs (JSON format, machine-readable)
- Levels: debug, info, warn, error
- Multiple transports (console, file, cloud)

**Correlation IDs (X-Trace-ID)**
- Every request gets unique trace ID
- Propagated through logs
- Enables request tracing across logs

**Why NOT**: Pino (faster, but heavier setup), Bunyan (older), ELK (defer to later phases)

---

### Debugging: Node.js Inspector + Chrome DevTools

**Backend (Node.js Inspector)**
- Port 9229 exposed in docker-compose.dev.yml
- Accessible via `chrome://inspect`
- Breakpoints, watch expressions, step debugging
- Console output in VSCode Debug Console

**Frontend (Vite + Browser DevTools)**
- Source maps preserved (debug original TypeScript)
- React DevTools browser extension
- Hot Module Replacement (state preserved on file change)

---

### Testing: Jest + React Testing Library + Cypress

**Jest (Unit + Integration)**
- Single config, runs everywhere (Node.js)
- Snapshot testing (regression detection)
- Coverage reports (`npm run test:coverage`)

**React Testing Library (Component Tests)**
- Tests user behavior, not implementation
- Encourages accessible component design
- Standard in React ecosystem

**Cypress (E2E)**
- User-centric (browsers real scenarios)
- Easy debugging (time-travel debugging)
- Runs critical flows end-to-end

**TDD Discipline**
- Write tests BEFORE code
- Each feature has a BDD scenario → test cases → implementation
- See [TEST_STRATEGY.md](TEST_STRATEGY.md)

---

### Styling: Tailwind + SCSS/PostCSS

**Tailwind (Utility Classes)**
- Rapid UI development (pre-built utilities)
- Consistent spacing, colors, typography
- Minimal CSS bundle (unused utilities purged)

**SCSS/PostCSS (Complex Styles)**
- Variables, mixins, nesting (reduce duplication)
- PostCSS plugins (autoprefixer, nested, custom media)
- Theme management (light/dark mode via CSS variables)

**Integration**
- Tailwind as base layer
- SCSS modules for component-scoped styles
- CSS variables for theme (colors, fonts, spacing)

---

## Directory Structure

```
boilerplate/
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml             # Lint, test, build
│       └── deploy.yml         # Deploy to staging/prod (future)
├── apps/
│   ├── backend/                # NestJS API
│   │   ├── src/
│   │   │   ├── auth/           # Auth module, guards, services
│   │   │   ├── users/          # Users module, CRUD
│   │   │   ├── health/         # Health check endpoint
│   │   │   ├── common/         # Decorators, interceptors, pipes
│   │   │   ├── config/         # Environment validation (zod)
│   │   │   └── main.ts         # App bootstrap
│   │   ├── __tests__/          # Unit + integration tests
│   │   ├── tsconfig.json      # Extends root
│   │   └── package.json       # App-specific deps
│   └── frontend/               # React 18 + Vite
│       ├── src/
│       │   ├── pages/          # Page components (routing)
│       │   ├── components/     # Reusable components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── services/       # API client, auth service
│       │   ├── store/          # State management (Zustand or Redux)
│       │   ├── styles/         # Global styles, Tailwind config
│       │   ├── utils/          # Helpers
│       │   └── main.tsx        # React entry point
│       ├── e2e/                # Cypress E2E tests
│       ├── vite.config.ts     # Vite configuration
│       ├── tsconfig.json      # Extends root
│       └── package.json       # App-specific deps
├── packages/                   # Shared libraries
│   ├── types/                  # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── api.ts          # API request/response types
│   │   │   ├── auth.ts         # Auth-related types
│   │   │   └── database.ts     # Database models (mirror from Prisma)
│   │   └── package.json
│   ├── utils/                  # Shared utilities
│   │   ├── src/
│   │   │   ├── crypto.ts       # Password hashing, JWT
│   │   │   ├── validators.ts   # Input validation (zod schemas)
│   │   │   └── formatters.ts   # Date, currency formatting
│   │   └── package.json
│   ├── config/                 # Environment + app config
│   │   ├── src/
│   │   │   ├── env.ts          # Zod schema for env vars
│   │   │   ├── app.ts          # App-level config
│   │   │   └── database.ts     # DB connection config
│   │   └── package.json
│   └── logger/                 # Observability module
│       ├── src/
│       │   ├── logger.ts       # Winston wrapper
│       │   ├── correlation.ts  # X-Trace-ID handling
│       │   └── index.ts        # Exports
│       └── package.json
├── db/                         # Database
│   ├── schema.prisma           # Prisma schema (Auth/Authz)
│   ├── migrations/             # Auto-generated Prisma migrations
│   ├── seeds/
│   │   ├── seed.ts             # Main seed script
│   │   └── data/               # Seed data (JSON)
│   └── package.json           # Prisma CLI
├── ops/                        # Operations
│   ├── docker/
│   │   ├── backend.dockerfile
│   │   ├── frontend.dockerfile
│   │   ├── db.dockerfile       # DB migrations runner
│   │   └── nginx.conf          # Reverse proxy (prod)
│   └── compose/
│       ├── docker-compose.dev.yml     # Dev: hot-reload, debuggers
│       └── docker-compose.prod.yml    # Prod: nginx, health checks
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # This file
│   ├── PROJECT_CONTEXT.md      # Schema, auth flow, API contracts
│   ├── AGENT_FRAMEWORK.md      # AI agent guide (decisions, patterns)
│   ├── TEST_STRATEGY.md        # Testing approach, test locations
│   ├── BDD_FORMAT.md           # BDD scenario format, mapping to tests
│   ├── DEBUG_SETUP.md          # Debugging configuration & usage
│   └── API.md                  # API documentation (auto-generated from Swagger)
├── specs/                      # Specifications & BDD scenarios
│   ├── boilerplate.md          # Main boilerplate spec
│   ├── bdd/                    # Detailed BDD scenarios (Gherkin format)
│   │   ├── auth.feature        # Authentication & authorization
│   │   ├── health.feature      # Health check scenarios
│   │   └── crud.feature        # CRUD operations (future)
│   └── decisions/              # Decision logs (ADRs)
├── .env.example                # Environment variables template
├── .eslintrc.json              # ESLint config (shared)
├── .prettierrc                 # Prettier config (shared)
├── tsconfig.json               # Root TypeScript config
├── package.json                # Root workspaces definition
└── README.md                   # Setup & quick start
```

---

## Development Flow (Monorepo)

**Docker locations**
- Dockerfiles: ops/docker/backend.dockerfile, frontend.dockerfile, db.dockerfile, nginx.conf
- Compose: ops/compose/docker-compose.dev.yml (dev with HMR + inspector 9229), ops/compose/docker-compose.prod.yml (prod with nginx proxy)


### 1. Install Dependencies
```bash
npm install              # Installs all workspaces + root
```

### 2. Run Development Stack
```bash
docker compose -f ops/compose/docker-compose.dev.yml up
# Starts: frontend (3000), backend (3001), postgres (5432)
# With hot-reload and debuggers exposed
```

### 3. Debug (Backend)
```
Open chrome://inspect → Connect to backend (Node.js Inspector)
Or use VSCode debugger launch config (provided)
```

### 4. Test Locally
```bash
npm run test              # Jest tests (all workspaces)
npm run test:coverage    # Coverage report
npm run e2e             # Cypress E2E tests
```

### 5. Check Code Quality
```bash
npm run lint            # ESLint
npm run format:check   # Prettier
npm run type-check    # TypeScript strict
```

---

## CI/CD Pipeline (GitHub Actions)

See [.github/workflows/](../.github/workflows/) for details.

1. **Lint**: ESLint, Prettier check, TypeScript strict
2. **Test**: Jest (unit + integration), coverage check
3. **E2E**: Cypress tests in docker-compose
4. **Build**: Build Docker images (backend, frontend)
5. **Deploy** (future): Push to registry, deploy to staging/prod

---

## Production Deployment (Future: K8s)

When ready to scale beyond docker-compose:
- Helm charts in `ops/k8s/`
- Persistent volumes for DB
- Service mesh (optional: Istio)
- Autoscaling policies (HPA)

---

## Key Design Principles

| Principle | Implementation |
|-----------|-----------------|
| **Type Safety** | TypeScript strict mode + Prisma codegen + Zod runtime validation |
| **Observability** | Structured JSON logging + correlation IDs + health endpoints |
| **Testability** | TDD/BDD discipline, tests live alongside code, fast test feedback |
| **Maintainability** | Monorepo + shared packages, clear module boundaries, consistent patterns |
| **Scalability** | Stateless backend, connection pooling, async operations, resource limits |
| **Security** | Secrets management, JWT rotation, RBAC, input validation, SQL injection prevention |
| **Developer Experience** | Hot-reload, source maps, local debugging, clear error messages |
| **AI-Optimized** | Explicit decisions, documented patterns, BDD/TDD discipline, clear structure |

---

## Next Steps

1. ✅ Review this architecture with the team
2. ⏭️ Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for database schema & auth flow
3. ⏭️ Read [AGENT_FRAMEWORK.md](AGENT_FRAMEWORK.md) for AI agent guidance
4. ⏭️ Read [TEST_STRATEGY.md](TEST_STRATEGY.md) for testing approach
5. ⏭️ Start with Phase 1 (monorepo setup)

---

## Questions or Concerns?

- Schema changes? Update `db/schema.prisma` and create migrations
- New package needed? Add to `packages/` and export from package.json
- Tech stack change? Document decision in this file (ADR style)
