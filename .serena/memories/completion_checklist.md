## Completion Checklist
- Requirements clear: spec + BDD scenario captured (specs/bdd/*.feature).
- Decisions honored: checked AGENT_FRAMEWORK.md (DR-001–010); add DR entry if new choice.
- Code + tests: added/updated tests (Jest/RTL/Cypress) with coverage target 80%+ on touched areas; tests passing.
- Docs updated: PROJECT_CONTEXT.md (schema/API/auth changes), AGENT_FRAMEWORK.md (decisions), INDEX/README if needed.
- Lint/format/type-check run (once scripts are wired): lint, format:check, type-check.
- Compose/CI/env: adjust ops/compose/.env.example if services/env vars changed; inform DevOps/Docs.
- Hand off summary to Orchestrator with file links and verification steps.
