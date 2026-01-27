# Master Agent Instructions Convention (2026-01-24)

## What Changed

Created **`.github/copilot-instructions.md`** — A master ground rules file that is **automatically read by ALL agents** before they execute any task.

## Why This Matters

Previously:
- Each agent had individual agent files (coder.agent.md, test.agent.md, etc.)
- Instructions were scattered across multiple files
- Agents might not see unified ground rules
- Easy for agents to forget about logging, blockers, Orchestrator authority

Now:
- **Single source of truth** for all agent behavior
- **Automatically included** in every agent's context by GitHub Copilot
- **Unified enforcement** of Agent Reporting Protocol
- **Clear role definitions** for all agents
- **Tool limitation documentation** visible to all agents

## What's in `.github/copilot-instructions.md`

```markdown
# Copilot Agent Ground Rules (MASTER INSTRUCTIONS)

1. **Core Principles** (3 rules)
   - Orchestrator is in charge
   - Clarity over assumptions
   - Transparency is mandatory

2. **Agent Roles & Responsibilities** (6 agents)
   - Orchestrator (overall coordination)
   - Coder (frontend/backend implementation)
   - Test (test suites)
   - DevOps (Docker/CI/CD)
   - Database (schema/migrations)
   - Docs (documentation)

3. **Mandatory Logging Protocol** (all agents)
   - Where: `.github/AGENT_WORK_LOG.md`
   - Format: Structured completion report
   - Requirements: Status, what was done, verification, deliverables, blockers

4. **Problem Resolution Workflow** (what to do when hitting blockers)
   - Stop immediately (don't workaround)
   - Document issue with root cause
   - Ask Orchestrator (don't try to fix other agents' areas)

5. **Cross-Agent Communication** (how agents coordinate)
   - Can't change someone else's area
   - Must go through Orchestrator
   - Document dependencies clearly

6. **Tool Limitations** (explicit documentation)
   - runSubagent doesn't relay output reliably
   - Agents must append to work log (file-based communication)
   - Orchestrator manually verifies

7. **Quality Standards** (code, docs, consistency)
   - TypeScript strict mode
   - All tests pass, no skips
   - Follow existing patterns

8. **Communication Channels**
   - Primary: `.github/AGENT_WORK_LOG.md` (append completion report)
   - Secondary: Code comments, file READMEs

9. **Exit Criteria Gating**
   - Orchestrator only proceeds if Status = ✅
   - If ⚠️/❌, agent must fix and re-report

10. **Quick Checklist** (before reporting done)
    - All tasks done or blocked?
    - Verification passed? (build, test, lint)
    - Deliverables listed?
    - Blockers documented?
    - Timestamp included?
    - Appended to work log?

11. **Known Tool Limitations**
    - runSubagent tool limitation documented
    - Workaround: file-based communication

12. **When in Doubt**
    - Read AGENT_FRAMEWORK.md
    - Read ARCHITECTURE.md
    - Read PROJECT_CONTEXT.md
    - Read this file (copilot-instructions.md)
    - Ask Orchestrator
```

## Updated Agent Files

Each agent file now starts with:
```markdown
# [Agent Name] Agent

**READ FIRST**: [.github/copilot-instructions.md](.github/copilot-instructions.md) — Master ground rules for ALL agents.
```

Updated:
- `.github/agents/coder.agent.md`
- `.github/agents/test.agent.md`
- `.github/agents/devops.agent.md`
- `.github/agents/docs.agent.md`

## How It Works

**When you delegate Phase X to an agent**:

1. GitHub Copilot automatically includes `.github/copilot-instructions.md` in the agent's context
2. Agent reads the master ground rules
3. Agent reads their specific role + responsibilities
4. Agent reads the Mandatory Logging Protocol
5. Agent reads this instruction prompt (Phase X task)
6. Agent executes Phase X
7. Agent appends completion report to `.github/AGENT_WORK_LOG.md`
8. Orchestrator reads the work log and verifies completion

## Benefits

✅ **Unified enforcement** — All agents follow same rules
✅ **Clear expectations** — No confusion about logging, blockers, authority
✅ **Tool limitations transparent** — Agents know about runSubagent issue
✅ **Single source of truth** — One file to maintain (copilot-instructions.md)
✅ **Automatic inclusion** — Copilot reads it for all agents
✅ **Scalable** — Easy to add new agents, new rules

## Future Improvements

- Could add role-specific sections (each agent reads their section)
- Could add decision registry summary (10 key decisions)
- Could add common patterns for each role (Coder patterns, Test patterns, etc.)
- Could add troubleshooting section (common blockers and solutions)
