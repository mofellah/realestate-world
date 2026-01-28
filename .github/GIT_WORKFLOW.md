# Git Workflow & Branching Strategy

**Last Updated**: 2026-01-28  
**Project**: Real Estate World Platform  
**Repository**: https://github.com/mofellah/realestate-world

---

## Overview

This project follows a **Feature Branch Workflow** with **Conventional Commits** to ensure clean history, traceable changes, and safe production deployments.

---

## Branch Structure

### Main Branches

#### `main` (Production)
- **Purpose**: Production-ready code only
- **Protection**: ✅ Protected
  - Requires PR approval (1+ reviewers)
  - CI must pass (lint, test, build)
  - No direct commits allowed
  - Force push disabled
- **Deployment**: Automatically deploys to production (future: via CI/CD)
- **Lifetime**: Permanent

#### `develop` (Integration/Staging)
- **Purpose**: Integration branch for all features before release
- **Protection**: ✅ Protected
  - Requires PR
  - CI must pass
- **Deployment**: Automatically deploys to staging environment
- **Lifetime**: Permanent
- **Merge Strategy**: Squash merge from feature branches

---

### Working Branches

#### Feature Branches
- **Naming**: `feature/<issue-number>-<short-description>`
- **Examples**:
  - `feature/12-auth-module`
  - `feature/23-property-search-ui`
  - `feature/45-agency-dashboard`
- **Created From**: `develop`
- **Merged Into**: `develop`
- **Lifetime**: Deleted after merge

**Workflow**:
```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/12-auth-module

# 2. Work on feature (commit frequently)
git add .
git commit -m "feat(auth): implement JWT token generation"
git commit -m "test(auth): add unit tests for login service"

# 3. Keep branch updated with develop
git fetch origin
git rebase origin/develop

# 4. Push to remote
git push origin feature/12-auth-module

# 5. Open PR: feature/12-auth-module → develop
# 6. After approval + CI pass: Squash merge
# 7. Delete branch after merge
```

---

#### Bugfix Branches
- **Naming**: `bugfix/<issue-number>-<short-description>`
- **Examples**:
  - `bugfix/78-fix-login-redirect`
  - `bugfix/92-map-zoom-crash`
- **Created From**: `develop`
- **Merged Into**: `develop`
- **Lifetime**: Deleted after merge

**Workflow**: Same as feature branches

---

#### Hotfix Branches (Production Emergencies)
- **Naming**: `hotfix/<issue-number>-<short-description>`
- **Examples**:
  - `hotfix/101-critical-auth-bypass`
  - `hotfix/102-payment-failure`
- **Created From**: `main` (not develop!)
- **Merged Into**: `main` AND `develop`
- **Lifetime**: Deleted after merge

**Workflow**:
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/101-critical-auth-bypass

# 2. Fix the issue
git commit -m "fix(auth): patch authentication bypass vulnerability"

# 3. Push and create PR to main
git push origin hotfix/101-critical-auth-bypass
# Open PR: hotfix/101-critical-auth-bypass → main

# 4. After merge to main, also merge to develop
git checkout develop
git pull origin develop
git merge hotfix/101-critical-auth-bypass
git push origin develop

# 5. Delete hotfix branch
git branch -d hotfix/101-critical-auth-bypass
git push origin --delete hotfix/101-critical-auth-bypass
```

---

#### Release Branches (Optional for MVP)
- **Naming**: `release/<version>`
- **Examples**: `release/v1.0.0`, `release/v1.1.0`
- **Created From**: `develop`
- **Merged Into**: `main` AND `develop`
- **Use Case**: Final QA, bug fixes, version bumps before production release
- **Lifetime**: Deleted after merge

**Deferred**: Not needed until post-MVP stabilization phase.

---

## Commit Message Convention

We use **Conventional Commits** for structured, parseable commit history.

### Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types
| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add JWT refresh token rotation` |
| `fix` | Bug fix | `fix(search): correct map bounds calculation` |
| `docs` | Documentation only | `docs(readme): update setup instructions` |
| `style` | Code style (formatting, no logic change) | `style(frontend): apply Prettier formatting` |
| `refactor` | Code restructuring (no behavior change) | `refactor(api): extract query builder to util` |
| `test` | Add/update tests | `test(auth): add integration tests for login flow` |
| `chore` | Tooling, config, dependencies | `chore(deps): upgrade Prisma to 6.2.0` |
| `perf` | Performance improvement | `perf(map): add clustering for 1000+ markers` |
| `ci` | CI/CD changes | `ci(github): add E2E test workflow` |
| `build` | Build system changes | `build(webpack): optimize bundle splitting` |
| `revert` | Revert previous commit | `revert: feat(auth): add JWT refresh (commit abc123)` |

### Scope (Optional but Recommended)
- `auth`, `property`, `listing`, `agency`, `messaging`, `search`, `map`, `dashboard`, `payment`, `email`, `db`, `docker`, `ci`, `docs`

### Examples
```bash
# Good commits
git commit -m "feat(auth): implement login endpoint with JWT"
git commit -m "fix(search): prevent map crash on invalid coordinates"
git commit -m "test(property): add unit tests for listing creation"
git commit -m "docs(api): update authentication flow diagram"
git commit -m "chore(deps): update TypeScript to 5.3"

# Bad commits (avoid)
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "updates"
```

### Multi-line Commits (for complex changes)
```bash
git commit -m "feat(search): add proximity filter to map search

- Add 500m, 1km, 5km radius options
- Integrate with Mapbox distance calculation
- Update PropertySearchDto with proximityRadius field
- Add unit tests for distance filtering logic

Closes #45"
```

---

## Pull Request Workflow

### 1. Create PR
- **Title**: Same format as commit message (`feat(auth): implement login endpoint`)
- **Description**: Use PR template (`.github/PULL_REQUEST_TEMPLATE.md`)
- **Link Issue**: `Closes #12` or `Fixes #23`
- **Reviewers**: Assign 1+ team members
- **Labels**: Apply relevant labels (`backend`, `frontend`, `critical`, etc.)

### 2. PR Checklist (Required)
- [ ] Code compiles (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] Coverage maintained (>80% backend, >70% frontend)
- [ ] BDD scenarios updated (if feature changes)
- [ ] Documentation updated (if API/architecture changes)
- [ ] No merge conflicts with `develop`
- [ ] Self-reviewed code

### 3. Review Process
- **Reviewers check**:
  - Code quality (follows patterns in `docs/AGENT_FRAMEWORK.md`)
  - Tests coverage
  - Performance implications
  - Security concerns
- **Approval required**: 1+ approvers
- **CI must pass**: All checks green

### 4. Merge Strategy
- **Squash Merge** (default for feature → develop)
  - Combines all feature commits into single commit
  - Clean linear history on develop
  - Preserves full history on feature branch (until deletion)
- **Merge Commit** (for hotfix → main, release → main)
  - Preserves full commit history
  - Clear merge points

### 5. Post-Merge
- **Delete feature branch** (automated via GitHub setting)
- **Deploy to staging** (if merging to develop)
- **Deploy to production** (if merging to main)

---

## Branch Protection Rules

### `main` Branch
```yaml
Protection Settings:
  - Require pull request before merging: ✅
  - Require approvals: 1
  - Dismiss stale approvals when new commits pushed: ✅
  - Require status checks to pass: ✅
    - lint
    - test
    - build
    - e2e (future)
  - Require branches to be up to date: ✅
  - Require conversation resolution: ✅
  - Do not allow bypassing settings: ✅
  - Restrict force pushes: ✅ (no one)
  - Allow deletions: ❌
```

### `develop` Branch
```yaml
Protection Settings:
  - Require pull request before merging: ✅
  - Require approvals: 1 (optional for MVP solo work)
  - Require status checks to pass: ✅
    - lint
    - test
    - build
  - Allow force pushes: ❌
```

---

## GitHub Issue Workflow

### Issue Lifecycle
1. **Created**: Issue opened with template, labeled, assigned to milestone
2. **Triaged**: Orchestrator assigns to agent, links to epic/parent issue
3. **In Progress**: Developer creates feature branch, updates issue
4. **PR Open**: Links PR to issue (`Closes #X`)
5. **Merged**: Issue auto-closes when PR merged
6. **Verified**: QA confirms fix on staging

### Issue Labels
| Label | Purpose | Color |
|-------|---------|-------|
| `mvp` | Must-have for MVP launch | Red |
| `phase-2` | Deferred to Phase 2 | Yellow |
| `critical` | Blocking/urgent | Red |
| `backend` | Backend work (NestJS) | Blue |
| `frontend` | Frontend work (React) | Cyan |
| `database` | Database schema/migrations | Purple |
| `devops` | Docker/CI/CD | Orange |
| `test` | Testing work | Green |
| `docs` | Documentation | Gray |
| `bug` | Bug fix | Red |
| `enhancement` | New feature | Blue |
| `question` | Needs clarification | Pink |
| `duplicate` | Duplicate issue | Gray |
| `wontfix` | Will not implement | Gray |

### Milestones
- **Week 5-6**: Backend Core (Auth, Property, Listing)
- **Week 7-8**: Frontend & Maps
- **Week 9-10**: Contact & Dashboards
- **Week 11-12**: Testing & Launch Prep

---

## Versioning Strategy

### Semantic Versioning (Post-MVP)
- **Format**: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### MVP Versioning
- **Current**: `0.x.x` (pre-release)
- **MVP Launch**: `1.0.0`

---

## Quick Reference Commands

### Daily Workflow
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/12-auth-module

# Commit work
git add .
git commit -m "feat(auth): implement login endpoint"

# Keep updated with develop
git fetch origin
git rebase origin/develop

# Push to remote
git push origin feature/12-auth-module

# After PR approval
git checkout develop
git pull origin develop
git branch -d feature/12-auth-module
```

### Emergency Hotfix
```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/101-critical-bug

# Fix and commit
git commit -m "fix(auth): patch security vulnerability"

# Push and create PR to main
git push origin hotfix/101-critical-bug

# After merge to main, also update develop
git checkout develop
git merge hotfix/101-critical-bug
git push origin develop
```

### Cleanup
```bash
# Delete local merged branches
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

# Prune remote-tracking branches
git fetch --prune
```

---

## CI/CD Integration (Future)

### GitHub Actions (`.github/workflows/ci.yml`)
```yaml
on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: [lint, test, build]
    runs-on: ubuntu-latest
    steps:
      - # Deploy to staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [lint, test, build]
    runs-on: ubuntu-latest
    steps:
      - # Deploy to production
```

---

## Best Practices

### DO ✅
- Create small, focused feature branches (1-3 days of work)
- Commit frequently with clear messages
- Rebase feature branches with develop regularly
- Write tests before marking PR ready
- Link issues to PRs (`Closes #X`)
- Delete branches after merge
- Keep commits atomic (one logical change per commit)

### DON'T ❌
- Commit directly to `main` or `develop`
- Create long-lived feature branches (>1 week)
- Push broken code (always run tests locally first)
- Use vague commit messages ("fix", "update", "WIP")
- Force push to shared branches
- Merge without PR review
- Leave branches undeleted after merge

---

## Troubleshooting

### Merge Conflict Resolution
```bash
# Update feature branch with latest develop
git checkout feature/12-auth-module
git fetch origin
git rebase origin/develop

# If conflicts occur
# 1. Fix conflicts in editor
# 2. Mark as resolved
git add <conflicted-files>
git rebase --continue

# Push updated branch (may need force push after rebase)
git push origin feature/12-auth-module --force-with-lease
```

### Undo Last Commit (Not Pushed)
```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes and commit
git reset --hard HEAD~1
```

### Revert Merged PR
```bash
# Create revert commit
git revert -m 1 <merge-commit-sha>
git push origin develop
```

---

## Questions & Support

- **Workflow questions**: Check `docs/CODER_AGENT_PLAYBOOK.md`
- **Code standards**: See `docs/AGENT_FRAMEWORK.md` (Decision Registry)
- **Architecture**: Refer to `docs/ARCHITECTURE.md`
- **Git issues**: Ask Orchestrator agent

---

**Last Updated**: 2026-01-28  
**Owner**: Orchestrator Agent  
**Review Frequency**: Monthly or when workflow changes
