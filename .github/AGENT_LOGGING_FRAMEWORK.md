# Agent Logging & Accountability Framework

**Purpose**: Ensure all agents (Coder, Database, Test, DevOps, Docs) log their work, errors, blockers, and limitations. This creates a discoverable, auditable record of project work.

**Enforcement**: Orchestrator MUST NOT proceed to next phase without reviewing agent logs.

---

## 1. Mandatory Agent Logging Protocol

### Every Agent MUST:

1. **Log to `.github/AGENT_WORK_LOG.md`** after each phase
2. **Include completion report** with structured format (see below)
3. **Document any errors/blockers** before they become hidden failures
4. **Log tool limitations** when encountered (e.g., runSubagent tool doesn't relay output)
5. **Provide verification results** (build, tests, linting)
6. **List all deliverables** (files created/modified)
7. **Timestamp each entry** for audit trail
8. **Recommend next steps** for Orchestrator

### Unacceptable Outcomes:

- ❌ Agent completes work silently (no log entry)
- ❌ Agent fails but doesn't document why
- ❌ Agent encounters blocker but doesn't report it
- ❌ Agent's log entry is incomplete (missing verification or deliverables)
- ❌ Orchestrator proceeds without reading agent log

---

## 2. Agent Completion Report Format

**Location**: `.github/AGENT_WORK_LOG.md` (append after each phase)

**Template**:

```markdown
## Phase X - [Agent Name] Report

**Status**: ✅ Complete | ⚠️ Blocked | ❌ Failed  
**Timestamp**: YYYY-MM-DD HH:MM UTC  
**Agent**: [Coder | Database | Test | DevOps | Docs]  
**Task**: [Brief 1-2 line description]

### What Was Done

- [Task 1]: ✅ Completed (or ⚠️ Blocked due to X, or ❌ Failed: Y)
- [Task 2]: ✅ Completed
- [Task 3]: ⚠️ Blocked - reason explained below

### Verification Results

- **Build**: ✅ Pass / ❌ Errors (list errors if failed)
- **Linting**: ✅ Pass / ❌ Errors (list specific files with errors)
- **Type Check**: ✅ Pass / ❌ Errors (list specific files with errors)
- **Tests** (if applicable): X passed, Y failed (list failing tests)
- **Coverage** (if applicable): Z% achieved
- **Startup** (if applicable): ✅ Server running on port XXXX / ❌ Failed to start

### Deliverables

- [File 1] - Brief description
- [File 2] - Brief description
- [Directory 1/] - Brief description

### Blockers / Limitations / Errors

**If Status = ⚠️ or ❌, document**:

1. **Blocker 1**: Description
   - Root cause: Why did this happen?
   - Impact: What's broken?
   - Attempted solutions: What did agent try?
   - Recommended fix: How to resolve?
   - Blocking further progress: Yes/No

2. **Limitation**: [e.g., "runSubagent tool doesn't relay output"]
   - Workaround needed: [describe workaround]

### Recommended Next Steps

- If Status = ✅: "Proceed to Phase X+1"
- If Status = ⚠️: "Fix blocker before proceeding to Phase X+1, specifically: [list what needs fixing]"
- If Status = ❌: "Phase failed. Agent recommends: [detailed recommendation]"

---
```

**Example (Phase 5 - Test Agent)**:

```markdown
## Phase 5 - Test Agent Report

**Status**: ✅ Complete  
**Timestamp**: 2026-01-24 14:22 UTC  
**Agent**: Test  
**Task**: Execute all backend tests, fix failures, report coverage

### What Was Done

- Test suite execution: ✅ All 8 suites passing (initial: 5 failed, 3 passed)
- Failure analysis: ✅ Root cause identified (environment validation at import time)
- Mock fixes applied: ✅ jest.mock('@boilerplate/config') added to all spec files
- ExecutionContext mocks: ✅ Enhanced jwt.guard tests with switchToHttp().getResponse()
- Coverage validation: ✅ Auth 86.58%, Users 82.14%, Health 62.50% (all ≥ 60% threshold)

### Verification Results

- **Build**: ✅ Pass
- **Type Check**: ✅ Pass (no TypeScript errors)
- **Tests**: 8/8 suites passed, 93 tests passed (0 failed)
- **Coverage**: 
  - auth.service: 86.58% ✅
  - users.service: 82.14% ✅
  - health.controller: 62.50% ✅
- **Linting**: ✅ Pass

### Deliverables

- apps/backend/src/auth/__tests__/auth.service.spec.ts (updated)
- apps/backend/src/auth/__tests__/auth.controller.spec.ts (updated)
- apps/backend/src/auth/__tests__/jwt.guard.spec.ts (updated)
- apps/backend/src/auth/__tests__/jwt.strategy.spec.ts (updated)
- apps/backend/src/auth/__tests__/roles.guard.spec.ts (updated)
- apps/backend/src/users/__tests__/users.controller.spec.ts (updated)
- apps/backend/src/users/__tests__/users.service.spec.ts (updated)
- apps/backend/src/health/__tests__/health.controller.spec.ts (updated)
- apps/backend/src/common/__tests__/fixtures.ts (created)

### Blockers / Limitations / Errors

None - all blockers from initial failures have been resolved.

### Recommended Next Steps

Proceed to Phase 6 (Frontend Setup & Auth UI). Backend is production-ready with full test coverage.

---
```

---

## 3. Orchestrator Enforcement Responsibilities

### Before Delegating Phase X:

- [ ] Phase X-1 must be marked ✅ Complete in AGENT_WORK_LOG.md
- [ ] All blockers from Phase X-1 must be resolved
- [ ] Create clear spec or BDD scenarios for Phase X
- [ ] Define exit criteria for Phase X

### During Delegation:

- [ ] Provide agent with:
  - Spec location and requirements
  - Reference documents (ARCHITECTURE.md, PROJECT_CONTEXT.md, etc.)
  - Exit criteria checklist
  - Instruction: "Append completion report to .github/AGENT_WORK_LOG.md"

### After Agent Completes:

- [ ] **Wait for log entry** in .github/AGENT_WORK_LOG.md (do NOT assume silence = success)
- [ ] **Review completion report** for:
  - Status (✅ / ⚠️ / ❌)
  - Verification results (build, tests, linting all passing)
  - All deliverables listed and accounted for
  - No unresolved blockers
- [ ] **Verify manually** if needed:
  - Run build: `npm run build --workspace=<phase>`
  - Run tests (if applicable): `npm run test --workspace=<phase>`
  - Check linting: `npm run lint --workspace=<phase>`
- [ ] **If Status = ⚠️ or ❌**: Ask agent to fix and re-report
- [ ] **If Status = ✅ and all verified**: Update todo list and proceed to next phase
- [ ] **Document outcome** in .github/AGENT_WORK_LOG.md if orchestrator made manual changes

### Gating Rule (STRICT):

**Orchestrator MUST NOT proceed to Phase X+1 until Phase X log shows ✅ Complete.**

---

## 4. Agent Responsibilities (All Agents)

### Every Agent MUST:

1. **Read AGENT_FRAMEWORK.md** (this document) before starting work
2. **Understand exit criteria** for the phase
3. **Execute work** following ARCHITECTURE.md patterns
4. **Capture errors/blockers** as they occur (don't hide them)
5. **Build/test/lint** to verify work before reporting
6. **Append completion report** to .github/AGENT_WORK_LOG.md
7. **Format report exactly** per template above
8. **Include verification results** (not optional)
9. **List all deliverables** by file path
10. **Document any blockers** with root cause + recommended fix

### If Blocker Encountered:

- [ ] Do NOT proceed silently
- [ ] Document blocker in report
- [ ] Explain root cause (tool limit? env issue? design mismatch?)
- [ ] Recommend solution for Orchestrator
- [ ] Set Status = ⚠️ or ❌
- [ ] Append report to .github/AGENT_WORK_LOG.md immediately

### If Tool Limitation Encountered:

- [ ] Document limitation clearly
- [ ] Provide workaround (if any)
- [ ] Recommend how Orchestrator should handle it
- [ ] Example: "runSubagent tool doesn't relay output → Orchestrator should manually verify files after delegation"

---

## 5. Audit Trail & Accountability

### For Each Phase:

**Logged Data** (discoverable in .github/AGENT_WORK_LOG.md):
- Agent name
- Start/completion timestamp
- Tasks completed vs. blocked/failed
- Build/test/lint status
- Coverage metrics
- Deliverables (exact file paths)
- Blockers with root causes
- Recommended next steps

### User Access:

User can ask anytime:
- "What happened in Phase 5?" → Read .github/AGENT_WORK_LOG.md → Phase 5 section
- "Why did Phase 6 fail?" → Read Phase 6 report → Blockers section
- "When was Phase X done?" → Read timestamp in Phase X report
- "What files did Coder create?" → Read Deliverables in Phase 6 report

---

## 6. Current Implementation Status

### ✅ Implemented:

- Agent Reporting Protocol (docs/AGENT_FRAMEWORK.md)
- .github/AGENT_WORK_LOG.md created with Phases 1-5 logged
- Orchestrator responsibilities documented
- Memory file documenting workflow solution

### 🔄 In Progress:

- Enforce agent logging for Phases 6-10
- Create agent-specific log templates (Coder, Test, DevOps, Docs)
- Strengthen verification checks (build/test/lint mandatory)

### ❌ To Do:

- Add CI/CD hook to prevent merge if agent logs are incomplete
- Create dashboard/report of Phase completion status
- Add agent timeouts (if no log after 5 min, assume failure)

---

## 7. Decision Registry Impact

**Decision DR-005** (Agent-Driven Development):
- Updated: "All agents log work to .github/AGENT_WORK_LOG.md"
- Updated: "Orchestrator gates phases on agent log status (✅ only)"
- Updated: "Tool limitations and blockers are logged transparently"

---
