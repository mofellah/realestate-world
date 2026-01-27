## Purpose
Production-ready monorepo boilerplate (React 19 + Vite, NestJS + Fastify, PostgreSQL 18, Prisma) with strict BDD/TDD, AI-friendly decisions/patterns, multi-env Docker Compose.

## Tech Stack
- Frontend: React 19, Vite, Tailwind, SCSS, TypeScript
- Backend: NestJS, Fastify, TypeScript, Prisma ORM
- DB: PostgreSQL 18, Prisma migrations/seeds
- Auth: JWT (access 15m) + refresh (7d) + RBAC, bcrypt hashes
- Testing: Jest, React Testing Library, Cypress, coverage target 80%+
- Observability: Winston JSON logs + correlation IDs
- Monorepo: npm workspaces (apps/*, packages/*, db)
- Containers: Docker + docker-compose (dev/prod)

## Structure (key paths)
- apps/backend/src (auth, users, health, common, config); __tests__ for unit/integration
- apps/frontend/src (pages, components, hooks, services, store, styles, utils); e2e for Cypress
- packages/types, packages/utils, packages/config (env validation with zod), packages/logger
- db/schema.prisma, migrations/, seeds/
- ops/docker (dockerfiles), ops/compose (docker-compose.dev.yml, docker-compose.prod.yml, .env.example)
- specs/bdd/*.feature, specs/decisions/
- docs/ (ARCHITECTURE, PROJECT_CONTEXT, AGENT_FRAMEWORK, TEST_STRATEGY, BDD_FORMAT, DEBUG_SETUP, CI_CD, INDEX)

## Key Decisions
See docs/AGENT_FRAMEWORK.md (DR-001–010): npm workspaces, React+Vite, NestJS+Fastify, Prisma, JWT+RBAC, Winston+correlation IDs, Jest/RTL/Cypress, Tailwind+SCSS, Node inspector/Vite HMR, Zod env validation.

## OS
Windows environment.
