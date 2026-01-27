## Style & Conventions
- TypeScript strict; prefer shared types from packages/types; avoid implicit any.
- BDD/TDD: scenario → tests → code; map specs/bdd/*.feature to tests in __tests__/ or e2e/.
- Tests live alongside code; Jest for unit/integration, RTL for components, Cypress for E2E; target 80%+ coverage on touched modules.
- Auth patterns: JWT + refresh tokens, RBAC guards; follow guards/interceptors patterns in AGENT_FRAMEWORK.md.
- Logging: structured JSON via packages/logger with correlation IDs; use interceptors for request logging.
- Env config via zod schemas in packages/config; fail-fast on missing/invalid env vars; use .env.example as template.
- Styling: Tailwind utilities + SCSS modules; theme via CSS variables; place global styles in frontend styles directory.
- Monorepo imports: prefer package imports (e.g., @boilerplate/logger) over deep relatives.
- Documentation updates: when architecture/decisions change, update AGENT_FRAMEWORK.md (DR entries) and INDEX.md links.
