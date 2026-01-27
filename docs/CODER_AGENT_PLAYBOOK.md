# Coder Agent Playbook (1 page)

**Audience**: Coder agent

---

## Must-Reads (order)
1. docs/AGENT_FRAMEWORK.md (decisions DR-001–DR-010, patterns)
2. docs/ARCHITECTURE.md (what lives where)
3. docs/PROJECT_CONTEXT.md (schema, auth/RBAC, API flows)
4. docs/TEST_STRATEGY.md (test locations, coverage targets)
5. specs/BDD_FORMAT.md + specs/bdd/*.feature (scenarios to implement)
6. .github/AGENT_LOGGING_FRAMEWORK.md (log every phase)

---

## Non-Negotiables
- BDD/TDD gate: scenario → test plan → tests → implementation. No code before scenarios/tests exist.
- Use decision registry DR-001–DR-010; do not invent new patterns without approval.
- Put code and tests in documented locations; keep changes minimal and pattern-aligned.

---

## Monorepo Map
- apps/backend: NestJS + Fastify + Prisma; tests in src/**/__tests__/ (unit + integration).
- apps/frontend: React 19 + Vite; tests in src/__tests__/ (RTL/Jest); Cypress E2E in apps/frontend/e2e.
- packages/: shared types, utils, config (zod env), logger (Winston + trace ID).
- db/: Prisma schema, migrations, seeds.
- ops/compose/: docker-compose.dev.yml (dev, HMR, inspector), docker-compose.prod.yml (nginx).
- ops/docker/: backend.dockerfile, frontend.dockerfile, db.dockerfile, nginx.conf.

---

## Testing Targets & Locations
- Backend unit/integration: src/module/__tests__/*.spec.ts (Jest). Integration under __tests__/integration when DB involved.
- Frontend unit/component: src/__tests__/*.{test,spec}.tsx (RTL + Jest).
- E2E: apps/frontend/e2e/*.cy.ts (Cypress, hits built frontend + backend).
- Coverage: ≥80% overall; auth/users paths higher. Follow TEST_STRATEGY for details.

---

## Commands (root)
- Install: npm ci
- Lint: npm run lint
- Format check: npm run format:check
- Type check: npm run type-check
- Backend tests: npm run test --workspace=@boilerplate/backend -- --coverage
- Frontend tests: npm run test --workspace=@boilerplate/frontend -- --coverage
- E2E: npm run e2e:run (after backend/frontend running) or use workflow e2e.yml
- Dev stack: docker compose -f ops/compose/docker-compose.dev.yml up

---

## Shared Packages to Reuse
- @boilerplate/types: shared API/domain types
- @boilerplate/utils: crypto, formatters, helpers
- @boilerplate/config: zod env schemas + typed accessors
- @boilerplate/logger: Winston logger + correlation IDs

---

## Logging & Handover
- After each phase, append to .github/AGENT_WORK_LOG.md using .github/AGENT_LOGGING_FRAMEWORK.md template (status, verification, deliverables, timestamp).

---

## When to Pause & Ask
- Missing/ambiguous specs or scenarios
- Decision not covered by DR-001–DR-010
- Schema/API contract mismatch
- Test location or coverage uncertainty
- Tooling blockers (note them in the work log)
