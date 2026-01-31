# Documentation Index

**Last Updated**: January 29, 2026  
**Status**: Core Features Complete | Testing 97.4% Pass Rate

---

## 📖 Quick Navigation

**New to the project?** Start with these essential docs:

1. **[../README.md](../README.md)** — Project overview (5 min)
2. **[../QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** — Commands & tips (3 min)
3. **[../QUICK_START.md](../QUICK_START.md)** — Setup guide (10 min)
4. **[PROJECT_HISTORY.md](PROJECT_HISTORY.md)** — Current status (10 min)

---

## 📚 Core Documentation

### Architecture & Design

1. **[specs/boilerplate.md](../specs/boilerplate.md)** (START HERE)
   - Goals, acceptance criteria, BDD scenarios
   - Tech stack decisions
   - Database schema overview

2. **[docs/ARCHITECTURE.md](./ARCHITECTURE.md)**
   - System design & architecture
   - Why each tech choice was made
   - Directory structure
   - Development flow

3. **[docs/PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)**
   - Detailed database schema (Prisma)
   - Auth & authorization flows
   - API contracts
   - Environment setup

4. **[docs/AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md)** ⭐ **FOR AI AGENTS**
   - Decision registry (DR-XXX)
   - Code patterns & examples
   - Workflow for implementing features
   - Common pitfalls & solutions

5. **[docs/CODER_AGENT_PLAYBOOK.md](./CODER_AGENT_PLAYBOOK.md)**
   - 1-page coder entrypoint
   - Must-reads, commands, test locations
   - BDD/TDD gate + logging reminder

6. **[specs/BDD_FORMAT.md](../specs/BDD_FORMAT.md)**
   - Gherkin syntax & conventions
   - How to write BDD scenarios
   - Mapping scenarios to tests
   - Examples (auth.feature, health.feature)

7. **[docs/TEST_STRATEGY.md](./TEST_STRATEGY.md)**
   - Testing pyramid (unit, integration, E2E)
   - Where to write tests (file locations)
   - Test examples (Jest, React Testing Library, Cypress)
   - TDD/BDD discipline
   - Coverage targets & CI pipeline

8. **[docs/DEBUG_SETUP.md](./DEBUG_SETUP.md)**
   - Backend debugging (Node.js Inspector)
   - Frontend debugging (Vite + React DevTools)
   - Structured logging & correlation IDs
   - Troubleshooting common issues

---

## 🎯 Quick Start

### For Developers (Getting Started)

```bash
# 1. Read the main spec
cat specs/boilerplate.md

# 2. Read architecture
cat docs/ARCHITECTURE.md

# 3. Start dev stack
docker compose -f ops/compose/docker-compose.dev.yml up

# 4. Open frontend
http://localhost:3000

# 5. Debug backend
chrome://inspect
```

### For AI Agents (Implementing Features)

```
1. Read: docs/AGENT_FRAMEWORK.md (decisions, patterns)
2. Find: Relevant BDD scenario (specs/bdd/*.feature)
3. Check: TEST_STRATEGY.md (test locations & patterns)
4. Write: Tests first (TDD)
5. Implement: Code to pass tests
6. Verify: All tests pass, coverage > 80%
```

---

## 🏗️ Project Structure

```
boilerplate/
├── specs/                          # Specifications & BDD scenarios
│   ├── boilerplate.md              # Main spec (requirements)
│   ├── BDD_FORMAT.md               # How to write BDD scenarios
│   └── bdd/                        # Detailed feature files
│       ├── auth.feature
│       ├── health.feature
│       └── fixtures/               # Test data
├── docs/                           # Documentation
│   ├── ARCHITECTURE.md             # System design
│   ├── PROJECT_CONTEXT.md          # Database, auth, API
│   ├── AGENT_FRAMEWORK.md          # AI agent guide
│   ├── TEST_STRATEGY.md            # Testing approach
│   ├── DEBUG_SETUP.md              # Debugging guide
│   ├── INDEX.md                    # This file
│   └── API.md                      # API docs (auto-generated)
├── apps/
│   ├── backend/                    # NestJS API
│   │   ├── src/
│   │   │   ├── auth/               # Auth module
│   │   │   ├── health/             # Health check
│   │   │   └── common/             # Guards, interceptors, pipes
│   │   └── __tests__/              # Unit + integration tests
│   └── frontend/                   # React 19 + Vite
│       ├── src/
│       │   ├── pages/              # Route pages
│       │   ├── components/         # UI components
│       │   ├── styles/             # Tailwind + SCSS
│       │   └── services/           # API client
│       └── e2e/                    # Cypress tests
├── packages/
│   ├── types/                      # Shared TypeScript types
│   ├── utils/                      # Shared utilities
│   ├── config/                     # Environment config
│   └── logger/                     # Observability module
├── db/                             # Database
│   ├── schema.prisma               # Prisma schema
│   ├── migrations/                 # Prisma migrations
│   └── seeds/                      # Seed scripts
├── ops/
│   ├── docker/                     # Dockerfiles
│   │   ├── backend.dockerfile
│   │   ├── frontend.dockerfile
│   │   └── nginx.conf
│   └── compose/                    # Docker Compose configs
│       ├── docker-compose.dev.yml
│       └── docker-compose.prod.yml
├── .github/
│   └── workflows/                  # CI/CD pipelines
│       └── ci.yml
├── .env.example                    # Environment template
├── package.json                    # Root monorepo config
├── tsconfig.json                   # Root TypeScript config
└── README.md                       # Setup guide
```

---

## 🔑 Key Decisions (Decision Registry)

See [docs/AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md) for detailed rationale.

| Decision | Choice | Why |
|----------|--------|-----|
| **Monorepo** | npm workspaces | Zero extra tooling, npm 7+ native |
| **Frontend** | React 19 + Vite | Latest, fast HMR, large ecosystem |
| **Backend** | NestJS + Fastify | Modular, fast, TypeScript-first |
| **ORM** | Prisma | Type-safe, auto-migrations, great DX |
| **Database** | PostgreSQL 18 | Proven at scale, ACID, PostGIS ready |
| **Auth** | JWT + Refresh + RBAC | Stateless, scalable, hierarchical perms |
| **Styling** | Tailwind + SCSS | Rapid UI, advanced theming |
| **Testing** | Jest + RTL + Cypress | All levels: unit, integration, E2E |
| **Observability** | Winston + correlation IDs | Structured logs, request tracing |
| **Debugging** | Node.js Inspector + DevTools | Built-in, no extra tooling |

---

## 📊 Tech Stack Summary

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, SCSS |
| **Backend** | NestJS, Fastify, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 18, Prisma migrations |
| **Auth** | JWT (HS256), bcrypt, RBAC |
| **Testing** | Jest, React Testing Library, Cypress |
| **Observability** | Winston (logs), correlation IDs, structured JSON |
| **DevOps** | Docker, Docker Compose, GitHub Actions |
| **Monorepo** | npm workspaces |

---

## 🎬 Development Workflow

### Phase 1: Foundation (Monorepo + Infrastructure)
- Initialize npm workspaces
- Create shared packages (types, utils, config, logger)
- Setup Prisma + database schema
- Create Dockerfiles + docker-compose configs

### Phase 2: Backend (NestJS + Auth)
- Initialize NestJS with Fastify
- Implement auth module (login, refresh, guards)
- Implement health endpoint
- Add logging + error handling

### Phase 3: Frontend (React + Vite)
- Initialize React 19 + Vite
- Setup Tailwind + SCSS
- Implement API client + auth service
- Build health check page

### Phase 4: Database (Migrations + Seeds)
- Finalize Prisma schema
- Create migrations
- Setup seed script

### Phase 5: Testing (Jest + Cypress)
- Write unit tests (auth, services)
- Write integration tests (auth flow + DB)
- Write E2E tests (critical user flows)

### Phase 6: CI/CD (GitHub Actions)
- Setup linting checks (ESLint, Prettier)
- Setup test pipeline
- Setup build pipeline

---

## ✅ Acceptance Criteria

By end of Phase 1-3, the boilerplate should:

- ✅ Monorepo structure follows best practices (npm workspaces)
- ✅ `docker compose -f ops/compose/docker-compose.dev.yml up` starts all services
- ✅ Frontend (port 3000) and backend (port 3001) respond to health checks
- ✅ Hot-reload works for both frontend and backend in dev mode
- ✅ Authentication (JWT + refresh) works end-to-end
- ✅ Database initializes with Prisma migrations + seed data
- ✅ Structured logging with correlation IDs functional
- ✅ Shared packages (types, utils, config, logger) consumable by apps
- ✅ Tests written first (BDD/TDD discipline)
- ✅ 80%+ code coverage on critical modules
- ✅ TypeScript strict mode enforced
- ✅ ESLint + Prettier enforced across monorepo

---

## 🚀 Getting Started (For Next Implementation)

1. **Read** [docs/AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md)
2. **Check** relevant BDD scenario in [specs/bdd/](../specs/bdd/)
3. **Follow** testing strategy from [docs/TEST_STRATEGY.md](./TEST_STRATEGY.md)
4. **Write tests** before code (TDD)
5. **Implement** to pass tests
6. **Run** full test suite: `npm run test:all`
7. **Debug** with guides from [docs/DEBUG_SETUP.md](./DEBUG_SETUP.md)

---

## 🤔 FAQ

### Q: Where do I put my code?
**A**: See directory structure in [ARCHITECTURE.md](./ARCHITECTURE.md#directory-structure). For specific patterns, see [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md#code-patterns).

### Q: How do I write a test?
**A**: Follow [TEST_STRATEGY.md](./TEST_STRATEGY.md). Write BDD scenario first, then map to test cases.

### Q: How do I debug?
**A**: See [DEBUG_SETUP.md](./DEBUG_SETUP.md). Backend: Node.js Inspector on 9229. Frontend: Chrome DevTools.

### Q: Why Prisma over TypeORM?
**A**: See decision DR-004 in [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md#dr-004-database-postgresql-18--prisma-migrations).

### Q: How do I add a new feature?
**A**: Write BDD scenario (specs/bdd/) → tests → implementation. See [BDD_FORMAT.md](../specs/BDD_FORMAT.md).

### Q: What if I need to change architecture?
**A**: Add a new decision (DR-XXX) to [AGENT_FRAMEWORK.md](./AGENT_FRAMEWORK.md#decision-log-future-decisions), discuss with team.

---

## 📞 Conventions

- **Files**: kebab-case (auth.service.ts)
- **Classes**: PascalCase (AuthService)
- **Functions**: camelCase (validatePassword)
- **Types**: PascalCase (LoginDto)
- **Constants**: UPPER_SNAKE_CASE (JWT_EXPIRY)
- **Branch**: feat/feature-name, fix/bug-name, docs/doc-name
- **Commit**: `feat: add login endpoint`, `test: add auth tests`, `docs: update README`

---

## 🔗 Related Links

- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)
- [Jest Docs](https://jestjs.io/)
- [Cypress Docs](https://docs.cypress.io/)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## � Historical Documentation

**Archived documentation** (superseded or completed):
- **[archive/README.md](archive/README.md)** — Index of archived docs
- **[sessions/](sessions/)** — Development session summaries

These folders contain historical status reports, bug fix summaries, and session notes that have been consolidated into current documentation.

---

## �📝 Notes

- This framework is **AI-optimized**: every decision, pattern, and location is explicit
- Strict **BDD/TDD discipline**: tests before code, scenarios first
- Monorepo-first: no Kubernetes yet, scale horizontally with docker-compose
- Security-first: secrets never hardcoded, JWT rotation, RBAC
- Observable: structured logs, correlation IDs, no surprises

---

**Status**: ✅ Framework complete and ready for Phase 1 implementation.
