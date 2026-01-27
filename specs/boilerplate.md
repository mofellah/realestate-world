# Boilerplate Spec

## Goals
- Create a production-ready monorepo with React 19, NestJS, PostgreSQL 18, Prisma ORM
- Support fast development setup with hot-reload and comprehensive production setup
- Implement enterprise-grade observability (logging, tracing, metrics)
- Enable scaling across projects with shared packages (types, utils, config, logger)
- Provide separate docker-compose configurations for dev, staging, and production

## Acceptance Criteria
- Monorepo structure follows npm workspaces best practices
- `docker compose -f ops/compose/docker-compose.dev.yml up` starts all services (frontend, backend, db)
- Frontend and backend health endpoints return 200 OK when stack is running
- Database initializes with Prisma migrations and seed data automatically
- Authentication (JWT + refresh tokens) works end-to-end
- Hot-reload works for both backend (NestJS) and frontend (React 19) in dev mode
- Observability: structured logging, request tracing (X-Trace-ID), error tracking functional
- Shared packages (types, utils, logger, config) are consumable by apps/
- Production docker-compose uses nginx reverse proxy, health checks, proper secrets management
- TypeScript strict mode, ESLint, Prettier enforced across all packages
- Database schema documented, migrations reversible, seed data included

## BDD Scenarios
**(See specs/bdd/ directory for detailed feature files. Format: Gherkin syntax.)**

- **Scenario: Development environment with debugging and hot-reload**
  - Given docker and docker-compose are installed
  - When I run `docker compose -f ops/compose/docker-compose.dev.yml up`
  - Then frontend (port 3000), backend (port 3001), and db (port 5432) are accessible
  - And hot-reload works (changing React/NestJS code auto-updates without rebuild)
  - And backend debugger is accessible via `chrome://inspect` (Node.js Debugger)
  - And frontend debugger works in Chrome DevTools (Vite dev server)
  - And console logs appear in terminal (backend) and browser (frontend)

- **Scenario: Health endpoints respond**
  - Given the dev stack is running
  - When I curl `http://localhost:3001/health` (backend)
  - And I curl `http://localhost:3000/api/health` (frontend)
  - Then both return 200 OK with status details (db connection, uptime, version)

- **Scenario: Authentication and Authorization flow works**
  - Given the stack is running
  - And user table has test users with roles (admin, user, moderator)
  - When I POST to `/auth/login` with valid credentials
  - Then I receive access token (JWT) + refresh token
  - And access token contains claims: sub (user ID), role, permissions
  - And subsequent requests with bearer token are authenticated
  - And refresh token endpoint renews access without re-login
  - And unauthorized users cannot access protected routes

- **Scenario: Database migrations and seeds run automatically**
  - Given docker-compose starts the stack
  - When postgres container initializes
  - Then Prisma migrations run automatically (auth schema)
  - And seed data is populated (users, roles, permissions)

- **Scenario: Observability and debugging work**
  - Given the stack is running
  - When I make a request to the backend
  - Then request is logged with structured format (JSON)
  - And trace ID (X-Trace-ID) is propagated across services
  - And errors include stack trace + context (user, endpoint, method)
  - And dev console shows debug logs with proper levels (debug, info, warn, error)

- **Scenario: Production stack is secure and resilient**
  - Given I run `docker compose -f ops/compose/docker-compose.prod.yml up`
  - Then all services have health checks defined
  - And nginx reverse proxy sits in front of backend (port 80/443)
  - And secrets are injected via environment files (not in code)
  - And services restart on failure with exponential backoff

## Decisions
- **Frontend**: React 19 + Vite (fast HMR) + Tailwind CSS + SCSS/PostCSS for advanced styles
- **Backend**: NestJS + Fastify (high performance, modular) with Node.js Inspector for debugging
- **ORM**: Prisma (type-safe, great DX, migrations, seeding)
- **Database**: PostgreSQL 18 (latest stable) with Auth/Authz schema
- **Monorepo**: npm workspaces (built-in, no extra tooling)
- **Auth**: JWT (access) + Refresh tokens with rotation + role-based access control (RBAC)
- **Styling**: Tailwind CSS + SCSS/PostCSS for components + utility classes
- **Observability**: Winston (structured JSON logging) + correlation IDs (X-Trace-ID) + Node.js debugger in dev
- **Testing**: Jest (unit + integration) + React Testing Library (frontend) + Cypress (E2E) + strict TDD/BDD
- **Separate Compose**: dev.yml (hot-reload, debuggers exposed), prod.yml (optimized, nginx, secrets)
- **Shared Packages**: types, utils, config, logger (common across apps)
- **TypeScript**: Strict mode, path aliases, monorepo references
- **Debugging (Dev)**: Node.js Inspector (backend port 9229) + Chrome DevTools (frontend) + console.log with structured logging

## Test Strategy
**(See docs/TEST_STRATEGY.md for detailed approach)**
- **Unit Tests**: Jest, each module in `__tests__/` folder, 80%+ coverage target
- **Integration Tests**: Services + database, Prisma client mocked/real, in `__tests__/integration/`
- **E2E Tests**: Cypress for critical user flows (auth, CRUD), in `e2e/` folder
- **TDD Discipline**: Write tests BEFORE implementation, BDD scenarios map to test cases
- **Location**: Tests live alongside code (`src/module/__tests__/`) for easy discoverability

## Debug Configuration (Development)
**(See docs/DEBUG_SETUP.md for detailed setup)**
- **Backend**: Node.js Inspector on port 9229, available in docker-compose.dev.yml
  - Access via `chrome://inspect` or VSCode Debugger (launch config provided)
  - Breakpoints, watch expressions, step debugging supported
  - Console logs show in VSCode Debug Console and Docker logs
- **Frontend**: Vite dev server with source maps, React DevTools in browser
  - Hot Module Replacement (HMR) on file change, state preserved
  - Browser DevTools shows original TypeScript (source maps)
  - ESLint warnings shown in console, Prettier auto-format on save

## Database Schema (Auth/Authz)
**(See docs/PROJECT_CONTEXT.md and db/schema.prisma for detailed schema)**
- **User**: id, email, password (hashed), name, created_at, updated_at, is_active
- **Role**: id, name (admin, user, moderator), description
- **UserRole**: user_id, role_id (many-to-many)
- **Permission**: id, resource, action (create, read, update, delete)
- **RolePermission**: role_id, permission_id (many-to-many)
- **RefreshToken**: id, user_id, token (JWT), expires_at, created_at
- Seed data includes: test admin user, default roles, basic permissions
