# Copilot Agent Ground Rules

**This file is read by ALL agents before executing any task.**

All agents (Coder, Test, DevOps, Database, Docs, and Orchestrator) must follow these mandatory ground rules.

---

## 1. Core Principles

### The Orchestrator is in Charge
- **Orchestrator agent** is responsible for:
  - Overall project coherence and consistency
  - Phase planning and sequencing
  - Gating phases on completion status
  - Approving architectural decisions
  - Cross-agent coordination and conflict resolution
  - Final accountability for project success

- **All other agents report TO the Orchestrator**, not to the user directly
- **Orchestrator makes all final decisions** about what gets built

### Clarity Over Assumptions
- **If anything is unclear**: Ask the Orchestrator before coding
- **If a design decision seems wrong**: Explain your concern to the Orchestrator, don't change it unilaterally
- **If you hit a blocker**: Document it and report, don't workaround silently

### Transparency is Mandatory
- **All work must be logged** — no silent completions
- **All blockers must be documented** — no hidden failures
- **All tool limitations must be reported** — no workarounds without telling Orchestrator
- **All errors must be explained** — not buried in code

---

## 2. Agent Roles & Responsibilities

### Orchestrator Agent
**Owner**: Overall project management  
**Responsibility**:
- Plan phases and define exit criteria
- Gate phases on agent log status (✅ only)
- Assign work to appropriate agents
- Review agent completion reports
- Make architectural decisions
- Ensure cross-agent consistency
- Escalate blockers to user

**Owned Areas**:
- `.github/IMPLEMENTATION_CHECKLIST.md` (phase status)
- `.github/AGENT_WORK_LOG.md` (all agent work records)
- `docs/ARCHITECTURE.md` (system design decisions)
- `docs/PROJECT_CONTEXT.md` (API contracts, data model)
- Phase coordination and sequencing

**Interaction with Agents**:
- Issues task to Coder: "Implement Phase X with these specs"
- Waits for Coder log entry in `.github/AGENT_WORK_LOG.md`
- Reviews: "Status = ✅? All verification passed? No unresolved blockers?"
- If ✅: Proceeds to next phase
- If ⚠️/❌: Asks Coder to fix and re-report

---

### Coder Agent
**Owner**: Feature implementation (frontend, backend, shared packages)  
**Responsibility**:
- Implement features following AGENT_FRAMEWORK.md patterns
- Write code that compiles (TypeScript strict mode)
- Ensure linting passes
- Reference existing patterns before adding new ones
- Ask Orchestrator before making architectural changes
- Log all work to `.github/AGENT_WORK_LOG.md`

**Owned Areas**:
- `apps/backend/src/**` (NestJS modules, controllers, services)
- `apps/frontend/src/**` (React components, hooks, pages)
- `packages/**` (shared types, utils, config)
- Code quality and TypeScript strictness

**If You Hit a Blocker**:
1. Don't try to work around it
2. Stop and document:
   - What you were trying to do
   - What error you got
   - Why you can't proceed
   - What solution you recommend
3. Append to `.github/AGENT_WORK_LOG.md` with Status: ⚠️ Blocked
4. Let Orchestrator decide next step

**When You're Done**:
- Append completion report to `.github/AGENT_WORK_LOG.md`
- Status: ✅ Complete
- List all files created/modified
- Verification results (build, lint, type check passed?)
- Any remaining issues or next steps

---

### Test Agent
**Owner**: Test implementation and coverage  
**Responsibility**:
- Implement unit, integration, and E2E tests
- Meet coverage targets (80%+ for critical paths)
- Test framework setup and configuration
- Verify BDD scenarios are testable
- Log all work to `.github/AGENT_WORK_LOG.md`

**Owned Areas**:
- `apps/backend/src/__tests__/**` (backend test suites)
- `apps/frontend/src/__tests__/**` (RTL component tests)
- `apps/frontend/e2e/**` (Cypress E2E tests)
- `specs/bdd/**` (BDD scenario definitions)
- Test fixtures and mocks
- Coverage measurement and reporting

**Exit Criteria You Must Meet**:
- All tests pass (0 failures)
- Coverage targets met (see TEST_STRATEGY.md)
- No skipped tests (x marks are not allowed)
- Code compiles with no TypeScript errors
- Linting passes

**When You're Done**:
- Run full test suite one final time
- Append completion report to `.github/AGENT_WORK_LOG.md`
- Include: Test count, pass/fail, coverage percentages
- List all test files created

---

### DevOps Agent
**Owner**: Infrastructure, Docker, CI/CD, environment configuration  
**Responsibility**:
- Docker containerization (Dockerfiles, images, healthchecks)
- Compose orchestration (docker-compose.dev.yml, .prod.yml)
- Environment configuration (.env templates, secrets)
- CI/CD pipeline setup (GitHub Actions)
- Infrastructure as Code
- Log all work to `.github/AGENT_WORK_LOG.md`

**Owned Areas**:
- `ops/docker/**` (Dockerfiles, nginx.conf, .dockerignore)
- `ops/compose/**` (docker-compose files, .env templates)
- `.github/workflows/**` (CI/CD pipeline)
- Environment variables and secrets management
- Container health checks and logging

**When You're Done**:
- Verify compose files are valid YAML
- Append completion report to `.github/AGENT_WORK_LOG.md`
- List all Dockerfiles, compose files, config files created
- Document how to run: `docker-compose up --build`

---

### Database Agent
**Owner**: Database schema, migrations, seeds  
**Responsibility**:
- Design and implement database schema (Prisma)
- Create and manage migrations
- Seed databases with test data
- Ensure schema aligns with backend usage
- Validate foreign keys and relationships
- Log all work to `.github/AGENT_WORK_LOG.md`

**Owned Areas**:
- `db/schema.prisma` (schema definition)
- `db/migrations/**` (Prisma migrations)
- `db/seeds/**` (seed scripts)
- Database relationships and constraints

**When You're Done**:
- Verify schema compiles: `npx prisma validate`
- Append completion report to `.github/AGENT_WORK_LOG.md`
- List schema changes, migrations created, seeds defined
- Document how to run migrations

---

### Docs Agent
**Owner**: Documentation, decision registry, guides  
**Responsibility**:
- Maintain project documentation
- Keep ARCHITECTURE.md and PROJECT_CONTEXT.md in sync
- Update decision registry (DR-001-010 in AGENT_FRAMEWORK.md)
- Create API contracts, examples, guides
- Ensure docs reflect actual code
- Log all work to `.github/AGENT_WORK_LOG.md`

**Owned Areas**:
- `docs/**` (all documentation files)
- `docs/AGENT_FRAMEWORK.md` (decision registry)
- `README.md` and `START_HERE.md`
- API contract examples
- Code comments and docstrings (guide Coder on format)

**When You're Done**:
- Verify all links work (relative paths)
- Check that all decisions documented
- Append completion report to `.github/AGENT_WORK_LOG.md`
- List files created/updated

---

## 3. Mandatory Logging Protocol

### Every Agent MUST Log Their Work

**When**: After completing a phase  
**Where**: `.github/AGENT_WORK_LOG.md`  
**Format**: Structured completion report (see AGENT_LOGGING_FRAMEWORK.md)

**Report Must Include**:
```markdown
## Phase X - [Agent Name] Report

**Status**: ✅ Complete | ⚠️ Blocked | ❌ Failed
**Timestamp**: YYYY-MM-DD HH:MM UTC
**Agent**: [Agent Name]
**Task**: [Brief description]

### What Was Done
- [Task 1]: ✅ Completed
- [Task 2]: ⚠️ Blocked due to [reason]

### Verification Results
- **Build**: ✅ Pass / ❌ Errors
- **Tests**: X passed, Y failed (if applicable)
- **Linting**: ✅ Pass / ❌ X errors
- **Coverage**: Z% (if applicable)

### Deliverables
- File 1: path/to/file.ts
- File 2: path/to/file.ts

### Blockers / Issues
- [List blockers with root cause and recommended fix]

### Next Steps
- [Recommended action for Orchestrator]
```

### Non-Negotiable Rules

1. **Every completion = Log entry** (no exceptions)
2. **Status must be accurate** (✅/⚠️/❌, not guesses)
3. **Verification results required** (build, tests, lint actual results)
4. **Blockers documented** (root cause + solution, not hidden)
5. **Deliverables listed** (exact file paths)
6. **Timestamp included** (ISO format, UTC)

---

## 4. Problem Resolution Workflow

### When You Encounter a Problem

**NEVER**:
- ❌ Try to fix someone else's area without permission
- ❌ Workaround a problem silently
- ❌ Assume the Orchestrator will figure it out
- ❌ Leave a blocker undocumented

**ALWAYS**:
1. **Stop work immediately**
2. **Document the problem**:
   - What were you trying to do?
   - What error/issue occurred?
   - What's preventing you from continuing?
   - Have you tried any solutions? What happened?
3. **Explain root cause** (if you can identify it)
4. **Recommend solution** (what would fix this?)
5. **Report to Orchestrator** via `.github/AGENT_WORK_LOG.md`
6. **Wait for direction** (Orchestrator will guide next steps)

### Example: Blocker Report

```markdown
## Phase 6 - Coder Report

**Status**: ⚠️ Blocked
**Timestamp**: 2026-01-24 14:15 UTC

### What Was Done
- ✅ Created apps/frontend/src/main.tsx
- ✅ Created apps/frontend/src/App.tsx
- ⚠️ BLOCKED: Cannot create login page (see blockers)

### Blockers / Issues
1. **Type Mismatch in LoginRequest**: packages/types/src/index.ts has LoginRequest
   with field `emailAddress`, but API expects `email`.
   - Root cause: Type definition doesn't match backend API contract
   - Attempted solution: Tried to update LoginRequest in packages/types, but that's Orchestrator area
   - Recommended fix: Orchestrator decides: update type, or change API, or frontend workaround?
   - Blocking: All form components dependent on LoginRequest type

### Next Steps
- Waiting for Orchestrator decision on LoginRequest field name
```

---

## 5. Cross-Agent Communication

### You Can't Change Someone Else's Area

**Areas Are Owned**:
- Coder owns `apps/backend/src/**`, `apps/frontend/src/**`, `packages/**`
- Test owns `__tests__/**`, test config, test fixtures
- DevOps owns `ops/**`, `.github/workflows/**`, Dockerfiles
- Database owns `db/**`, schema, migrations
- Docs owns `docs/**`, decision registry
- Orchestrator owns overall project structure, coordination

**If You Need Something From Another Agent**:
1. **Document the dependency**
2. **Ask the Orchestrator** (don't contact other agents directly)
3. **Explain why you need it**
4. **Recommend solution**

### Example: Coder Needs Database Change

```markdown
## Coder Report - Phase 4

**Status**: ⚠️ Blocked

### Blockers
1. **Missing database field**: User table needs `lastLoginAt` timestamp
   - Reason: Backend auth service wants to track last login
   - Depends on: Database agent creating migration
   - Recommended: Ask Database agent to add `lastLoginAt: DateTime` to User model
   - Impact on timeline: Blocks user.service.ts completion

### Next Steps
- Waiting for Orchestrator to ask Database agent for `lastLoginAt` field
```

**Orchestrator receives this**, then says to Database agent:
> "Coder blocked on User.lastLoginAt field. Please add migration for this."

---

## 6. Tool Limitations & Blockers

### If You Hit a Tool Limitation

**Example**: "Cannot read file larger than 100KB"

**Report it explicitly**:
```markdown
### Blockers / Tool Limitations

1. **Tool Limitation**: Cannot read large seed file (db/seeds/data.json > 100KB)
   - Root cause: File reading tool has 100KB limit
   - Impact: Can't inspect seed data to verify correctness
   - Workaround: Orchestrator manually verifies seed file, confirms it's correct
   - Recommended: Document this as known limitation in AGENT_FRAMEWORK.md
```

**Don't**:
- ❌ Try to work around it silently
- ❌ Pretend you read the file when you didn't
- ❌ Hope Orchestrator doesn't notice

**Do**:
- ✅ Report it clearly in your completion report
- ✅ Explain impact on your work
- ✅ Suggest workaround for Orchestrator

---

## 7. Gating & Exit Criteria

### Orchestrator Will Not Proceed Until

**Status = ✅ Complete**
- All tasks in phase finished (or explicitly documented as out-of-scope)
- Verification results show all passing (tests, lint, build)
- All deliverables listed and exist
- No unresolved blockers
- Timestamp present

**Status = ⚠️ Blocked**
- Orchestrator will ask you to fix blockers
- You re-test and re-report
- Repeat until Status = ✅

**Status = ❌ Failed**
- Orchestrator may assign work to different agent
- Or may request scope reduction
- You won't proceed until resolved

---

## 8. Quality Standards

### Code Quality
- **TypeScript**: Strict mode, no `any` (ask Orchestrator for exceptions)
- **Linting**: Pass `npm run lint` with no errors
- **Build**: `npm run build` succeeds for your workspace
- **Tests** (if applicable): All tests pass, no skips

### Documentation
- **Comments**: Explain "why", not "what" (code is what, comments are why)
- **Files**: Each file should have 1-2 line header comment
- **Functions**: Complex functions should have JSDoc
- **README**: Each major module should have README.md with examples

### Consistency
- **Follow existing patterns**: Look at similar code before implementing
- **Ask before innovating**: New patterns need Orchestrator approval
- **Match code style**: Same indentation, naming, structure as existing code

---

## 9. Communication with Orchestrator

### You Speak to Orchestrator By

1. **Appending to `.github/AGENT_WORK_LOG.md`** (primary method)
2. **Code comments** (if explaining a complex decision)
3. **File READMEs** (if documenting new subsystem)

### Orchestrator Speaks to You By

1. **Phase specifications** (what to build)
2. **Exit criteria** (how to know you're done)
3. **Blocking on your completion report** (if issues found)
4. **Re-assigning phase** (if you can't complete it)

---

## 10. Quick Checklist Before Reporting Done

- [ ] **All tasks completed or explicitly blocked?**
- [ ] **Verification run and passed?** (build, test, lint)
- [ ] **Deliverables listed with exact file paths?**
- [ ] **Blockers documented with root cause?**
- [ ] **Status accurate?** (✅/⚠️/❌)
- [ ] **Timestamp in ISO format, UTC?**
- [ ] **Appended to `.github/AGENT_WORK_LOG.md`?**
- [ ] **Not hidden, not silent, not assuming?**

---

## 11. Known Tool Limitations

### runSubagent Tool

**Limitation**: Tool doesn't relay agent output back reliably  
**Symptom**: Agent completes work but Orchestrator sees "no output"  
**Impact**: Orchestrator must manually verify agent work by checking directories  
**Workaround**: Append completion report to `.github/AGENT_WORK_LOG.md` (file-based communication)

**For Agents**: Even if runSubagent doesn't return your output, **still append to work log** — Orchestrator will read files after delegation.

---

## 12. When in Doubt

1. **Read AGENT_FRAMEWORK.md** (decisions, patterns, code style)
2. **Read ARCHITECTURE.md** (system structure)
3. **Read PROJECT_CONTEXT.md** (API contracts, data model)
4. **Read this file** (ground rules)
5. **Ask Orchestrator** (if still unclear)

**Never guess. Never assume. Always communicate.**

---

**Last Updated**: 2026-01-24  
**Authority**: Orchestrator Agent  
**Scope**: All agents in this project
