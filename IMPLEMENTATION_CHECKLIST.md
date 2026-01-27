# Implementation Checklist

**Purpose**: Track progress through each phase of boilerplate implementation.

---

## Phase 1: Monorepo & Infrastructure

### Monorepo Setup
- [ ] Create root `package.json` with npm workspaces
  - [ ] `"workspaces": ["apps/*", "packages/*", "db"]`
  - [ ] Install: `npm install`
  - [ ] Verify: `npm ls -a` shows all workspaces

### Root Configuration
- [ ] `tsconfig.json` (base TypeScript config with path aliases)
- [ ] `.eslintrc.json` (shared ESLint rules)
- [ ] `.prettierrc` (code formatting)
- [ ] `.gitignore` (node_modules, .env, dist/, etc.)
- [ ] `.env.example` (template with all required vars)

### Shared Packages
- [ ] `packages/types/` with `package.json`, `src/index.ts`
- [ ] `packages/utils/` with utilities (validators, formatters, crypto)
- [ ] `packages/config/` with environment validation (Zod schema)
- [ ] `packages/logger/` with Winston wrapper + correlation ID handling

### Docker Setup
- [ ] `ops/docker/backend.dockerfile` (multi-stage build)
- [ ] `ops/docker/frontend.dockerfile` (multi-stage build)
- [ ] `ops/docker/db.dockerfile` (Prisma migration runner)
- [ ] `ops/compose/docker-compose.dev.yml` (hot-reload, debuggers)
- [ ] `ops/compose/docker-compose.prod.yml` (nginx, health checks)
- [ ] `ops/compose/.env.example` (template for compose env)

### Database Setup
- [ ] `db/package.json` with Prisma CLI
- [ ] `db/schema.prisma` with models:
  - [ ] User (email, password, name, isActive)
  - [ ] Role (name, description)
  - [ ] UserRole (junction table)
  - [ ] Permission (resource, action)
  - [ ] RolePermission (junction table)
  - [ ] RefreshToken (user_id, token, expiresAt, revokedAt)
- [ ] `db/migrations/0001_init/migration.sql` (auto-generated)
- [ ] `db/seeds/seed.ts` with test data (admin user, default roles)

### Verification
- [ ] `npm install` succeeds without errors
- [ ] `npm run type-check` passes (TypeScript strict)
- [ ] `npm run lint` passes (ESLint)
- [ ] `docker compose -f ops/compose/docker-compose.dev.yml up` starts all services
- [ ] Database migrations run automatically
- [ ] Seed data populated in postgres

---

## Phase 2: Backend (NestJS + Auth)

### NestJS App Structure
- [ ] `apps/backend/` initialized with NestJS CLI
- [ ] `apps/backend/src/main.ts` (app bootstrap)
- [ ] `apps/backend/src/app.module.ts` (root module)

### Auth Module
- [ ] `apps/backend/src/auth/`
  - [ ] `auth.module.ts` (imports Prisma, JWT)
  - [ ] `auth.service.ts` with methods:
    - [ ] `login(dto)` → returns access + refresh tokens
    - [ ] `refresh(refreshToken)` → new token pair
    - [ ] `logout(refreshToken)` → revoke token
    - [ ] `validatePassword(password, hash)` → bcrypt compare
    - [ ] `generateTokens(user)` → JWT claims
  - [ ] `auth.controller.ts` with endpoints:
    - [ ] `POST /auth/login`
    - [ ] `POST /auth/refresh`
    - [ ] `POST /auth/logout`
    - [ ] `GET /auth/me`

### Auth Guards & Interceptors
- [ ] `apps/backend/src/auth/guards/auth.guard.ts` (verify JWT)
- [ ] `apps/backend/src/auth/guards/permission.guard.ts` (check permissions)
- [ ] `apps/backend/src/common/interceptors/logging.interceptor.ts` (correlation ID + logging)
- [ ] `apps/backend/src/common/pipes/validation.pipe.ts` (input validation)

### Health Module
- [ ] `apps/backend/src/health/`
  - [ ] `health.controller.ts` with `GET /health`
  - [ ] Response includes: status, timestamp, dbConnected, version

### Logger Setup
- [ ] `apps/backend/src/logger/logger.service.ts` (Winston wrapper)
- [ ] Implements: `info()`, `debug()`, `warn()`, `error()` with context

### Configuration
- [ ] `apps/backend/.env` (DATABASE_URL, JWT_SECRET, etc.)
- [ ] `apps/backend/src/config/` with environment validation (Zod)

### Package.json Scripts
- [ ] `"start:dev"` (NestJS dev with hot-reload)
- [ ] `"start:prod"` (production start)
- [ ] `"test"` (Jest tests)
- [ ] `"test:coverage"` (coverage report)

### Verification
- [ ] `npm run start:dev --workspace=@mono/backend` works
- [ ] Health endpoint: `curl http://localhost:3001/health` → 200 OK
- [ ] Login endpoint: `curl -X POST http://localhost:3001/auth/login` → tokens
- [ ] Guards protect endpoints
- [ ] Tests pass: `npm run test --workspace=@mono/backend`

---

## Phase 3: Frontend (React 19 + Vite)

### Vite App Structure
- [ ] `apps/frontend/` initialized with Vite + React 19
- [ ] `apps/frontend/src/main.tsx` (entry point)
- [ ] `apps/frontend/vite.config.ts` (build config, env vars)

### Tailwind + SCSS Setup
- [ ] `apps/frontend/tailwind.config.ts` (Tailwind config)
- [ ] `apps/frontend/src/styles/global.css` (Tailwind directives)
- [ ] `apps/frontend/src/styles/` for SCSS modules

### Pages & Components
- [ ] `apps/frontend/src/pages/`
  - [ ] `LoginPage.tsx` (login form)
  - [ ] `DashboardPage.tsx` (protected page)
  - [ ] `HealthPage.tsx` (health check)
- [ ] `apps/frontend/src/components/`
  - [ ] `Button.tsx` (Tailwind + SCSS)
  - [ ] `Form.tsx` (reusable form)

### API Client & Services
- [ ] `apps/frontend/src/services/api.ts` (axios/fetch wrapper)
  - [ ] Auto-attach Authorization header
  - [ ] Handle token refresh on 401
  - [ ] Set X-Trace-ID header
- [ ] `apps/frontend/src/services/auth.ts` (login, logout, token management)

### State Management (Optional)
- [ ] `apps/frontend/src/store/` (Zustand or Redux Toolkit)
  - [ ] User state (id, email, roles, token)
  - [ ] Auth state (isLoading, error)

### Package.json Scripts
- [ ] `"dev"` (Vite dev server with HMR)
- [ ] `"build"` (production build)
- [ ] `"preview"` (preview production build)
- [ ] `"test"` (Jest tests)
- [ ] `"e2e"` (Cypress tests)

### Verification
- [ ] `npm run dev --workspace=@mono/frontend` starts on port 3000
- [ ] HMR works (change code, browser updates instantly)
- [ ] Health page loads: http://localhost:3000/health
- [ ] Login page accessible: http://localhost:3000/login
- [ ] Tests pass: `npm run test --workspace=@mono/frontend`

---

## Phase 4: Database (Migrations & Seeds)

### Prisma Schema Finalization
- [ ] Review `db/schema.prisma` for completeness
- [ ] All models have proper relationships
- [ ] Indexes defined for performance
- [ ] Timestamps (createdAt, updatedAt) on all entities

### Migrations
- [ ] Create migration: `cd db && npx prisma migrate dev --name init`
- [ ] Review migration SQL
- [ ] Migration runs on docker-compose start

### Seed Script
- [ ] `db/seeds/seed.ts` creates:
  - [ ] Test users: admin@example.com, user@example.com, moderator@example.com
  - [ ] Default roles: admin, user, moderator
  - [ ] Default permissions (40+ total)
  - [ ] Role-permission mappings
- [ ] Seed runs automatically on docker-compose dev startup

### Verification
- [ ] Migrations in `db/migrations/` (version controlled)
- [ ] `npx prisma migrate status` shows "Up to date"
- [ ] `npx prisma studio` shows all seeded data
- [ ] Database auto-initializes on `docker compose up`

---

## Phase 5: Testing (BDD/TDD)

### BDD Scenarios
- [ ] `specs/bdd/auth.feature` (6+ scenarios)
  - [ ] Login with valid credentials
  - [ ] Login with invalid password
  - [ ] Refresh token flow
  - [ ] Logout and revoke
  - [ ] Permission-based access
- [ ] `specs/bdd/health.feature` (2+ scenarios)
  - [ ] Backend health check
  - [ ] Frontend health check

### Unit Tests
- [ ] `apps/backend/src/auth/__tests__/auth.service.spec.ts`
  - [ ] login() returns tokens
  - [ ] login() throws on invalid password
  - [ ] refresh() rotates tokens
  - [ ] logout() revokes token
  - [ ] Token includes proper claims
- [ ] `apps/backend/src/health/__tests__/health.controller.spec.ts`
  - [ ] Health endpoint returns 200
  - [ ] Includes status, timestamp, dbConnected

### Integration Tests
- [ ] `apps/backend/src/auth/__tests__/integration/auth-flow.spec.ts`
  - [ ] Full login → refresh → logout flow
  - [ ] Refresh token stored in DB
  - [ ] Revoked token not usable

### Component Tests (Frontend)
- [ ] `apps/frontend/src/components/__tests__/Button.spec.tsx`
- [ ] `apps/frontend/src/components/__tests__/LoginForm.spec.tsx`
  - [ ] Form validation
  - [ ] API call on submit
  - [ ] Error handling

### E2E Tests (Cypress)
- [ ] `apps/frontend/e2e/auth.cy.ts`
  - [ ] User can log in
  - [ ] Token stored after login
  - [ ] Can access protected page
  - [ ] Refresh token on expiry
  - [ ] Can log out
- [ ] `apps/frontend/e2e/health.cy.ts`
  - [ ] Health page loads
  - [ ] Shows success message

### Coverage
- [ ] `npm run test:coverage` shows:
  - [ ] Statements > 80%
  - [ ] Branches > 75%
  - [ ] Functions > 80%
  - [ ] Lines > 80%

### Verification
- [ ] `npm run test` passes (Jest)
- [ ] `npm run e2e:run` passes (Cypress)
- [ ] `npm run test:coverage` shows > 80%
- [ ] `npm run lint` passes (no ESLint errors)

---

## Phase 6: CI/CD (GitHub Actions)

### GitHub Actions Pipeline
- [ ] `.github/workflows/ci.yml` created with jobs:
  - [ ] Lint (ESLint, Prettier, TypeScript)
  - [ ] Test (Jest unit + integration)
  - [ ] Coverage check (> 80%)
  - [ ] Build (Docker images)
  - [ ] E2E (Cypress)

### GitHub Configuration
- [ ] Branch protection rules on `main`:
  - [ ] Require CI to pass
  - [ ] Require code review
  - [ ] Require branches up to date
- [ ] GitHub Secrets configured (if needed for deploy)

### Local Simulation
- [ ] Run locally: `npm run lint && npm run test && npm run build`
- [ ] Should match CI behavior

### Verification
- [ ] Push to GitHub triggers workflow
- [ ] All checks pass (green checkmark)
- [ ] PRs require passing checks before merge

---

## Final Verification

### Stack Running
- [ ] `docker compose -f ops/compose/docker-compose.dev.yml up` ✅
- [ ] Frontend: http://localhost:3000 ✅
- [ ] Backend: http://localhost:3001/health ✅
- [ ] Database: Prisma Studio on port 5555 ✅

### Functionality
- [ ] Can login: POST /auth/login ✅
- [ ] Get protected resource: GET /auth/me (with token) ✅
- [ ] Refresh token: POST /auth/refresh ✅
- [ ] Logout: POST /auth/logout ✅

### Code Quality
- [ ] `npm run lint` passes ✅
- [ ] `npm run type-check` passes ✅
- [ ] `npm run test` passes ✅
- [ ] `npm run test:coverage` > 80% ✅

### Documentation
- [ ] All 8 docs complete ✅
- [ ] Decision registry (DR-001 to DR-010) ✅
- [ ] Code patterns documented ✅
- [ ] BDD scenarios mapped to tests ✅

### Debugging
- [ ] Node.js Inspector works (port 9229) ✅
- [ ] Frontend hot-reload works ✅
- [ ] Logs include correlation IDs ✅
- [ ] Prisma Studio accessible ✅

---

## Success: ✅ Boilerplate Complete!

When all checkboxes are checked, your boilerplate is production-ready and can be used as a template for multiple projects.

---

## Next: Using the Boilerplate

For new projects:

1. **Copy boilerplate** to new directory
2. **Update package names** (change @mono to @yourproject)
3. **Update environment** (.env for your setup)
4. **Start from Phase 5** (add your features, follow BDD/TDD)

---

**Remember**: 
- Tests first (BDD/TDD)
- Follow patterns from [docs/AGENT_FRAMEWORK.md](docs/AGENT_FRAMEWORK.md)
- Check decisions in decision registry
- Run `npm run test:all` before committing
- Update docs when architecture changes
