# Agent Framework Review & Alignment Analysis

**Date**: 2026-01-24  
**Status**: Review Complete - Gaps & Recommendations Identified

---

## Executive Summary

The current agent framework has **good foundational structure** but is **misaligned with the new boilerplate** and the **AI-first BDD/TDD methodology** we just defined. Key issues:

| Issue | Severity | Impact |
|-------|----------|--------|
| **Outdated project context** | 🔴 High | Agents reference old real estate project, not new boilerplate |
| **Missing BDD/TDD guidance** | 🔴 High | Agents don't enforce BDD/TDD discipline (tests-first) |
| **Orchestrator not routing to BDD** | 🔴 High | No enforcement of AGENT_FRAMEWORK.md decisions |
| **Coder agent too generic** | 🟡 Medium | Doesn't reference decision registry or patterns |
| **No explicit decision tracking** | 🟡 Medium | Agents should link to DR-001 to DR-010 |
| **Test agent incomplete** | 🟡 Medium | Missing unit/integration/E2E structure from TEST_STRATEGY.md |
| **DevOps/Database too specific** | 🟡 Medium | Tailored to old project (OSM, PostGIS, France SRID) |
| **Data-Quality agent misplaced** | 🟢 Low | Not needed for boilerplate, but doesn't hurt |

---

## Agent-by-Agent Analysis

### 1. **Orchestrator Agent** ✅ GOOD BUT NEEDS UPDATES

**Current State**: Good structure, clear responsibilities.

**Problems**:
- ❌ References old "SRID 2154, architecture layers (Import → Transform → Enrichment)" — outdated
- ❌ No mention of AGENT_FRAMEWORK.md decision registry (DR-001-010)
- ❌ No enforcement of BDD/TDD gate: "spec + BDD scenarios + test plan before coding"
- ❌ Doesn't reference TEST_STRATEGY.md locations
- ❌ No link to BDD_FORMAT.md for scenario writing
- ❌ Missing: "Read AGENT_FRAMEWORK.md for decision registry"

**What's Good**:
- ✅ Clear gatekeeping (no dev without spec)
- ✅ Good handoff guidelines (which agent for what)
- ✅ Proper emphasis on documentation
- ✅ Enforcement of standards

**Recommendations**:
1. Update project context references (remove SRID 2154, old layers)
2. Add "Must read AGENT_FRAMEWORK.md for all decisions" as first step
3. Enforce BDD/TDD: "No coding without BDD scenario → test plan"
4. Link to new framework docs:
   - ARCHITECTURE.md (system design)
   - PROJECT_CONTEXT.md (database, auth)
   - AGENT_FRAMEWORK.md (decision registry)
   - TEST_STRATEGY.md (testing approach)
   - BDD_FORMAT.md (scenario writing)

---

### 2. **Coder Agent** ⚠️ NEEDS SIGNIFICANT UPDATE

**Current State**: Focused on real estate project, assumes old tech stack.

**Problems**:
- ❌ Assumes PostgreSQL 15, PostGIS, OSM data (wrong project!)
- ❌ References "Import → Transform → Enrichment" layers (outdated)
- ❌ No reference to AGENT_FRAMEWORK.md (10 decisions, code patterns)
- ❌ Doesn't mention BDD/TDD-first workflow
- ❌ No guidance on where to write tests (alongside code)
- ❌ Serena tools listed but no monorepo context
- ❌ Missing: Decision registry check, pattern reference, test location guidance
- ❌ No mention of shared packages (types, utils, config, logger)

**What's Good**:
- ✅ Clear workflow (understand → research → plan → implement → verify)
- ✅ Prioritizes Serena tools for efficient navigation
- ✅ Emphasizes reading ARCHITECTURE.md and PROJECT_CONTEXT.md
- ✅ Doesn't make assumptions without checking docs

**Recommendations**:
1. Update tech stack: React 19, NestJS, Fastify, Prisma (not PostGIS, osm2pgsql)
2. Replace old layer references with monorepo structure (apps/, packages/, db/)
3. Add CRITICAL: "Read AGENT_FRAMEWORK.md for decisions (DR-001-010) + code patterns"
4. Add BDD/TDD workflow:
   - Find BDD scenario in specs/bdd/
   - Write tests first (TEST_STRATEGY.md)
   - Implement to pass tests
5. Add test location guidance:
   - Unit tests: `src/module/__tests__/*.spec.ts`
   - Integration: `src/module/__tests__/integration/`
   - E2E: `e2e/*.cy.ts` (Cypress)
6. Add shared package awareness (types, utils, config, logger)
7. Reference 10 code patterns in AGENT_FRAMEWORK.md

---

### 3. **Database Agent** 🟡 PARTIALLY APPLICABLE

**Current State**: Specialized for PostgreSQL 15 + PostGIS + French geospatial data.

**Problems**:
- ❌ Assumes OSM data, SRID 2154, road/amenity/building tables (wrong project!)
- ❌ No mention of Prisma ORM (we use this, not raw SQL)
- ❌ No reference to PROJECT_CONTEXT.md database schema (Auth/Authz)
- ❌ Missing: Prisma migration workflow, seeding guidance
- ❌ Doesn't reference ARCHITECTURE.md monorepo structure
- ❌ No link to TEST_STRATEGY.md for database testing

**What's Good**:
- ✅ Clear expertise areas (schema, indexing, optimization)
- ✅ Good SQL standards
- ✅ Strong on testing/validation approach

**Recommendations**:
1. Rename section references: Remove "OSM, PostGIS, SRID 2154" → use Auth/Authz schema
2. Add Prisma-first workflow:
   - Update `db/schema.prisma`
   - Run `npx prisma migrate dev --name <description>`
   - Update seeds
   - Test with `npx prisma studio`
3. Reference PROJECT_CONTEXT.md for Auth/Authz schema
4. Add guidance on seed scripts (db/seeds/seed.ts)
5. Link to TEST_STRATEGY.md for database testing
6. Add monorepo context (db/ in workspaces)

---

### 4. **Test Agent** ⚠️ NEEDS UPDATE TO MATCH FRAMEWORK

**Current State**: Designed for data validation + SQL tests (OSM-focused).

**Problems**:
- ❌ Assumes OSM import workflows (outdated)
- ❌ Doesn't cover Jest unit tests for NestJS/React
- ❌ No mention of React Testing Library
- ❌ No Cypress E2E guidance (only SQL tests)
- ❌ Missing: BDD scenario mapping to tests
- ❌ No reference to TEST_STRATEGY.md
- ❌ Doesn't mention test-first (TDD) workflow
- ❌ Missing: Unit test patterns, fixture organization, coverage targets

**What's Good**:
- ✅ Good structure (validation, transformation, query, integration layers)
- ✅ SQL test examples clear
- ✅ Emphasis on test organization

**Recommendations**:
1. Restructure for three-level testing:
   - **Unit**: Jest (backend + frontend), test locations (`__tests__/`)
   - **Component**: React Testing Library (BDD-focused)
   - **E2E**: Cypress (critical user flows)
2. Add BDD mapping:
   - Gherkin scenario → test cases
   - Reference BDD_FORMAT.md
3. Add TDD workflow: "Tests first, then implementation"
4. Add test organization guidance:
   - `__tests__/` alongside source
   - Fixtures for test data
   - Mocking patterns
5. Reference TEST_STRATEGY.md coverage targets (80%+)
6. Add patterns for common scenarios (auth, CRUD, health checks)

---

### 5. **DevOps Agent** 🟡 PARTIALLY APPLICABLE

**Current State**: Specialized for PowerShell, OSM pipelines, osm2pgsql.

**Problems**:
- ❌ Windows/PowerShell focus may not apply to all environments
- ❌ Assumes osm2pgsql, OSM data workflows (outdated)
- ❌ No mention of Docker Compose setup for boilerplate
- ❌ Missing: GitHub Actions CI/CD, docker-compose.dev.yml, docker-compose.prod.yml
- ❌ No reference to ARCHITECTURE.md for dev/prod environments
- ❌ Missing: Node.js debugging setup, hot-reload configuration
- ❌ No link to CI_CD.md for pipeline setup

**What's Good**:
- ✅ Good emphasis on error handling, logging
- ✅ Strong on automation and monitoring
- ✅ Docker and containerization knowledge

**Recommendations**:
1. Update workflow focus:
   - Docker Compose (dev/prod) instead of osm2pgsql pipelines
   - GitHub Actions CI/CD instead of OSM automation
   - Node.js debugging instead of PostGIS monitoring
2. Add environment setup guidance:
   - `docker-compose.dev.yml` (hot-reload, debuggers)
   - `docker-compose.prod.yml` (nginx, health checks)
   - `.env` configuration (secrets, ports)
3. Reference ARCHITECTURE.md for dev/prod differences
4. Add CI/CD pipeline setup (GitHub Actions)
5. Reference CI_CD.md for GitHub workflow template
6. Add Docker image build guidance (backend, frontend, db)

---

### 6. **Documentation Agent** ✅ MOSTLY GOOD

**Current State**: General documentation specialist.

**Problems**:
- ❌ References old "PROJECT_CONTEXT.md for OSM/real estate" (needs update)
- ❌ No mention of AGENT_FRAMEWORK.md as source of truth for decisions
- ❌ Missing: Guidance on updating decision registry (DR-001-010)
- ❌ No reference to BDD_FORMAT.md for scenario documentation
- ❌ Missing: Documentation structure for new boilerplate

**What's Good**:
- ✅ Clear writing standards
- ✅ Good workflow (understand → research → write → review)
- ✅ Emphasis on accuracy and examples
- ✅ Proper versioning and archiving

**Recommendations**:
1. Update project context to new boilerplate (React/NestJS/Prisma, not OSM)
2. Add AGENT_FRAMEWORK.md as source of truth for decisions
3. Add guidance: "When architecture changes, update DR-XXX in AGENT_FRAMEWORK.md"
4. Reference BDD_FORMAT.md for scenario documentation
5. Add documentation checklist:
   - Update main spec (specs/boilerplate.md)
   - Update decision registry (AGENT_FRAMEWORK.md)
   - Update database schema docs (PROJECT_CONTEXT.md)
   - Link new docs in INDEX.md

---

### 7. **Data-Quality Agent** 🟢 NOT CRITICAL FOR BOILERPLATE

**Current State**: Specialized for OSM data validation, duplicate detection, geometry validation.

**Problems**:
- ❌ Assumes OSM/PostGIS geospatial data (not applicable to boilerplate)
- ❌ No relevance to React/NestJS/Prisma stack
- ❌ Missing: Data validation for authentication/authorization schema

**What's Good**:
- ✅ Solid approach to validation
- ✅ Good query patterns
- ✅ Strong on testing and reporting

**Recommendations**:
1. Keep as-is for now (may be useful later for other projects)
2. Or: Repurpose for boilerplate data quality:
   - Validate seed data (users, roles, permissions)
   - Check referential integrity (user-role, role-permission)
   - Verify test data consistency
3. Or: Remove and defer to later projects

---

## Critical Gaps: What's Missing

### 1. **No BDD/TDD Enforcement** 🔴 CRITICAL
- Agents should enforce: "BDD scenario → tests → implementation"
- Missing: Link to BDD_FORMAT.md for scenario writing
- Missing: Link to TEST_STRATEGY.md for test-first approach
- **Fix**: Update all agents to enforce this workflow

### 2. **No Decision Registry Guidance** 🔴 CRITICAL
- Agents should check AGENT_FRAMEWORK.md for DR-001-010
- Missing: "Before coding, check if this decision was already made"
- Missing: Links to code patterns
- **Fix**: Add decision registry check to Coder, Database, DevOps agents

### 3. **Outdated Project Context** 🔴 CRITICAL
- All agents assume old real estate project (OSM, PostGIS, SRID 2154)
- Should reference new boilerplate (React, NestJS, Prisma, Auth/Authz)
- **Fix**: Update all project context sections

### 4. **Missing Framework Integration** 🟡 HIGH
- Agents don't reference new framework docs:
  - ARCHITECTURE.md
  - PROJECT_CONTEXT.md
  - AGENT_FRAMEWORK.md
  - TEST_STRATEGY.md
  - BDD_FORMAT.md
  - DEBUG_SETUP.md
  - CI_CD.md
- **Fix**: Add these as "must read" in each agent

### 5. **No Monorepo Guidance** 🟡 MEDIUM
- Agents should understand npm workspaces
- Missing: How to work with apps/, packages/, db/ structure
- Missing: Shared package references
- **Fix**: Add monorepo structure guidance

### 6. **No Test Location Guidance** 🟡 MEDIUM
- Agents (esp. Coder) should know where to write tests
- Missing: `__tests__/`, `__tests__/integration/`, `e2e/` guidance
- Missing: Jest vs Cypress guidance
- **Fix**: Add TEST_STRATEGY.md reference

---

## Recommended Updates (Priority Order)

### 🔴 CRITICAL (Do First)

1. **Update Orchestrator Agent**
   - Remove old project references
   - Add: "Check AGENT_FRAMEWORK.md for decision registry"
   - Add: "BDD scenario → tests → implementation" enforcement
   - Add: Framework docs as context sources

2. **Update Coder Agent**
   - Replace project context (OSM → React/NestJS/Prisma)
   - Add: AGENT_FRAMEWORK.md (decisions, patterns)
   - Add: BDD/TDD workflow
   - Add: Test location guidance

3. **Update Test Agent**
   - Replace project context (OSM import → Jest/RTL/Cypress)
   - Add: Three-level testing (unit, component, E2E)
   - Add: BDD scenario mapping
   - Add: TDD workflow
   - Reference TEST_STRATEGY.md

### 🟡 HIGH (Do Next)

4. **Update Database Agent**
   - Replace project context (OSM → Auth/Authz schema)
   - Add: Prisma migration workflow
   - Add: Seed script guidance
   - Remove: PostGIS/SRID references (keep as optional)

5. **Update DevOps Agent**
   - Replace project context (OSM pipelines → Docker Compose)
   - Add: GitHub Actions CI/CD
   - Add: docker-compose.dev.yml / .prod.yml
   - Add: Node.js debugging setup

6. **Update Documentation Agent**
   - Update project context
   - Add: AGENT_FRAMEWORK.md as source of truth
   - Add: Decision registry updates (DR-XXX)
   - Add: Documentation checklist

### 🟢 LOW (Optional)

7. **Data-Quality Agent**
   - Keep as-is (may be useful later)
   - Or repurpose for auth/seed data validation
   - Or remove and defer to other projects

---

## Simplified Agent Structure (Recommendation)

### Keep These 6 Agents

```
orchestrator.agent.md      ← Route work, enforce standards
├── coder.agent.md         ← Code features (React/NestJS)
├── database.agent.md      ← Schema, migrations, seeds (Prisma)
├── devops.agent.md        ← Infrastructure, CI/CD, Docker
├── test.agent.md          ← Testing (Jest, RTL, Cypress)
└── docs.agent.md          ← Documentation & decision registry
```

### What Each Agent Does (Updated)

| Agent | Responsibility | Key Context |
|-------|-----------------|-------------|
| **Orchestrator** | Plan tasks, enforce BDD/TDD gate, route work | AGENT_FRAMEWORK.md (decisions), specs/boilerplate.md |
| **Coder** | Implement features following patterns | ARCHITECTURE.md, AGENT_FRAMEWORK.md (patterns, DR-001-010) |
| **Database** | Schema design, migrations, seeds | PROJECT_CONTEXT.md, db/schema.prisma, Prisma workflow |
| **Test** | Write tests (unit, integration, E2E) | TEST_STRATEGY.md, BDD_FORMAT.md, test locations |
| **DevOps** | Docker, CI/CD, infrastructure | ops/compose/, .github/workflows/, ARCHITECTURE.md |
| **Docs** | Maintain docs, update decisions | AGENT_FRAMEWORK.md (decisions), docs/INDEX.md |

### Remove
- **Data-Quality Agent** — Not needed for boilerplate (defer to other projects)

---

## Framework Integration Checklist

### Before Using Any Agent

- [ ] Agent understands new boilerplate (React 19, NestJS, PostgreSQL, Prisma)
- [ ] Agent reads ARCHITECTURE.md for system design
- [ ] Agent reads PROJECT_CONTEXT.md for database + auth flows
- [ ] Agent reads AGENT_FRAMEWORK.md for decisions (DR-001-010) + patterns
- [ ] Agent reads TEST_STRATEGY.md for testing approach
- [ ] Agent enforces BDD/TDD: spec → scenarios → tests → code
- [ ] Agent knows where code/tests/config belong (see ARCHITECTURE.md structure)
- [ ] Agent understands monorepo (apps/, packages/, db/)

### For Each Agent Type

**Orchestrator**:
- [ ] Enforce BDD gate before coding
- [ ] Check decision registry (AGENT_FRAMEWORK.md)
- [ ] Verify spec + scenarios + tests planned
- [ ] Route to correct specialist agent

**Coder**:
- [ ] Read AGENT_FRAMEWORK.md (patterns, decisions)
- [ ] Find BDD scenario in specs/bdd/
- [ ] Write tests first (TEST_STRATEGY.md)
- [ ] Implement following code patterns
- [ ] Verify tests pass + linting passes

**Database**:
- [ ] Update Prisma schema in db/schema.prisma
- [ ] Create migration: `npx prisma migrate dev`
- [ ] Update seeds in db/seeds/
- [ ] Test with `npx prisma studio`

**Test**:
- [ ] Map BDD scenario to test cases
- [ ] Write unit tests (Jest) in __tests__/
- [ ] Write E2E tests (Cypress) in e2e/
- [ ] Target 80%+ coverage

**DevOps**:
- [ ] Setup docker-compose.dev.yml (hot-reload)
- [ ] Setup docker-compose.prod.yml (nginx, health)
- [ ] Configure GitHub Actions (.github/workflows/ci.yml)
- [ ] Setup branch protection rules

**Docs**:
- [ ] Update relevant framework docs
- [ ] Add decision to AGENT_FRAMEWORK.md if new
- [ ] Link in docs/INDEX.md
- [ ] Update PROJECT_CONTEXT.md if schema changed

---

## Connection Quality Assessment

| Connection | Current | Target | Gap |
|-----------|---------|--------|-----|
| **Orchestrator → Framework** | ⚠️ References old project | ✅ Uses AGENT_FRAMEWORK.md | Update context |
| **Coder → Decisions** | ❌ Ignores DR-001-010 | ✅ Checks before coding | Add decision check |
| **Test → BDD** | ❌ No BDD guidance | ✅ Maps scenarios to tests | Add BDD workflow |
| **Database → Prisma** | ❌ Assumes raw SQL | ✅ Uses migrations + seeds | Replace with Prisma |
| **DevOps → Docker Compose** | ⚠️ Assumes PowerShell/OSM | ✅ Manages compose files | Update workflow |
| **Docs → Decisions** | ⚠️ General docs only | ✅ Owns decision registry | Add DR tracking |

---

## Implementation Priority

### Phase 1: Quick Fixes (1-2 hours)
1. Update Orchestrator context (remove SRID, old layers)
2. Add "Read AGENT_FRAMEWORK.md" to all agents
3. Update project context references (OSM → React/NestJS)
4. Add framework doc links to each agent

### Phase 2: Alignment (2-3 hours)
1. Update Coder agent (patterns, test locations, decision check)
2. Update Test agent (BDD mapping, three-level testing)
3. Update Database agent (Prisma workflow, seeds)
4. Update DevOps agent (Docker Compose, GitHub Actions)

### Phase 3: Validation (30 min)
1. Test agent workflow with sample task
2. Verify agents read framework docs
3. Check BDD/TDD enforcement
4. Verify decision registry checks

---

## Summary of Recommendations

| Aspect | Current State | Recommendation | Effort |
|--------|---------------|-----------------|--------|
| **Project Context** | Old (OSM, PostGIS, SRID) | New (React, NestJS, Prisma) | 30 min |
| **BDD/TDD Enforcement** | Missing | Add to all agents | 1 hour |
| **Decision Registry** | Not referenced | Add AGENT_FRAMEWORK.md check | 45 min |
| **Test Strategy** | OSM-focused | Add Jest, RTL, Cypress guidance | 1 hour |
| **Framework Integration** | Loose | Add doc links to each agent | 30 min |
| **Monorepo Understanding** | Missing | Add apps/, packages/, db/ guidance | 45 min |
| **Agent Count** | 7 agents | 6 agents (remove data-quality) | Optional |

**Total Effort**: 4-5 hours for full update

---

## Conclusion

✅ **Good foundation**: Agents have clear structure, responsibilities, and workflows.

⚠️ **Needs alignment**: Current agents still reference old project (OSM/PostGIS) instead of new boilerplate.

🔴 **Missing enforcement**: No BDD/TDD gate, no decision registry checks, no framework integration.

📋 **Action items**:
1. Update all agent contexts to new boilerplate
2. Add AGENT_FRAMEWORK.md decision registry checks
3. Enforce BDD/TDD workflow (spec → scenarios → tests → code)
4. Link to new framework docs (ARCHITECTURE.md, TEST_STRATEGY.md, etc.)
5. Add test location and code pattern guidance

Once updated, agents will be **fully aligned with the boilerplate framework** and **enforce strict BDD/TDD discipline** across all development work.
