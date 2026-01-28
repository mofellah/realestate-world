# Git Workflow Setup - Quick Start

**Date**: 2026-01-28  
**Purpose**: Initialize git workflow for Real Estate World Platform

---

## 1. Initialize Local Repository (if not done)

If you haven't initialized git yet:

```powershell
# Navigate to project root
cd c:\Users\fella\Desktop\projects\realestate-world

# Initialize git
git init

# Add all files
git add .

# Initial commit
git commit -m "chore: initial project setup with monorepo structure"
```

---

## 2. Connect to GitHub (if not done)

```powershell
# Add remote
git remote add origin https://github.com/mofellah/realestate-world.git

# Push main branch
git branch -M main
git push -u origin main
```

---

## 3. Create `develop` Branch

```powershell
# Create develop branch from main
git checkout -b develop

# Push develop to remote
git push -u origin develop
```

---

## 4. Set Up Branch Protection (via GitHub Web UI)

### Protect `main` Branch
1. Go to: https://github.com/mofellah/realestate-world/settings/branches
2. Click **"Add rule"**
3. **Branch name pattern**: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: **1**
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require status checks to pass before merging
     - Add checks: `lint`, `test`, `build` (will appear after first CI run)
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings
   - ✅ Restrict force pushes
   - ✅ Allow deletions: **NO**
5. Click **"Create"**

### Protect `develop` Branch
1. Click **"Add rule"** again
2. **Branch name pattern**: `develop`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Add checks: `lint`, `test`, `build`
   - ✅ Restrict force pushes
5. Click **"Create"**

---

## 5. Configure Auto-Delete Merged Branches (Optional)

1. Go to: https://github.com/mofellah/realestate-world/settings
2. Scroll to **"Pull Requests"** section
3. Enable: ✅ **Automatically delete head branches**

---

## 6. Start First Feature (Example: Auth Module)

```powershell
# Ensure you're on develop
git checkout develop
git pull origin develop

# Create feature branch for Issue #2 (Auth Module)
git checkout -b feature/2-auth-module

# Work on the feature...
# (Implement auth module according to issue #2 acceptance criteria)

# Commit frequently with conventional commits
git add apps/backend/src/auth/
git commit -m "feat(auth): implement JWT token generation service"

git add apps/backend/src/auth/__tests__/
git commit -m "test(auth): add unit tests for auth service"

# Push to remote
git push -u origin feature/2-auth-module
```

---

## 7. Create Pull Request

### Via GitHub Web UI
1. Go to: https://github.com/mofellah/realestate-world
2. Click **"Compare & pull request"** (appears after push)
3. **Base**: `develop` ← **Compare**: `feature/2-auth-module`
4. **Title**: `feat(auth): implement JWT authentication module`
5. **Description**: Fill PR template (link to issue, describe changes, checklist)
6. **Link Issue**: Add `Closes #2` in description
7. **Labels**: Add `backend`, `mvp`, `enhancement`
8. Click **"Create pull request"**

### Via GitHub CLI (if installed)
```powershell
gh pr create --base develop --head feature/2-auth-module --title "feat(auth): implement JWT authentication module" --body "Closes #2"
```

---

## 8. After PR Approval & Merge

```powershell
# Switch to develop
git checkout develop

# Pull latest changes (includes your merged feature)
git pull origin develop

# Delete local feature branch
git branch -d feature/2-auth-module

# (Remote branch auto-deleted if configured in step 5)
```

---

## 9. Typical Daily Workflow

### Morning - Start New Task
```powershell
# Update develop
git checkout develop
git pull origin develop

# Create feature branch for next issue (e.g., #3 - Property Module)
git checkout -b feature/3-property-module
```

### During Day - Commit Progress
```powershell
# Make changes...

# Commit frequently
git add .
git commit -m "feat(property): add property CRUD endpoints"

# Push periodically (backup + visibility)
git push origin feature/3-property-module
```

### End of Day - Update Branch
```powershell
# Fetch latest develop changes
git fetch origin develop

# Rebase your feature branch (keeps history clean)
git rebase origin/develop

# Resolve conflicts if any, then:
git push origin feature/3-property-module --force-with-lease
```

### When Feature Complete
```powershell
# Final push
git push origin feature/3-property-module

# Create PR (via GitHub UI or CLI)
gh pr create --base develop --head feature/3-property-module --title "feat(property): implement property CRUD module" --body "Closes #3"
```

---

## 10. Handling Merge Conflicts

If conflicts occur during rebase:

```powershell
# Start rebase
git rebase origin/develop

# If conflicts:
# 1. Open conflicted files in VS Code
# 2. Resolve conflicts (choose changes or merge manually)
# 3. Mark as resolved
git add <conflicted-files>

# Continue rebase
git rebase --continue

# If you want to abort:
git rebase --abort

# After successful rebase, force push
git push origin feature/3-property-module --force-with-lease
```

---

## 11. Emergency Hotfix (Production Bug)

```powershell
# Create hotfix from main (not develop!)
git checkout main
git pull origin main
git checkout -b hotfix/101-critical-bug

# Fix the bug...
git commit -m "fix(auth): patch authentication bypass vulnerability"

# Push and create PR to main
git push origin hotfix/101-critical-bug
gh pr create --base main --head hotfix/101-critical-bug --title "fix(auth): patch auth bypass" --body "Closes #101"

# After merge to main, also merge to develop
git checkout develop
git pull origin develop
git merge hotfix/101-critical-bug
git push origin develop

# Delete hotfix branch
git branch -d hotfix/101-critical-bug
```

---

## 12. Verify Everything Works

```powershell
# Check remote branches
git branch -r

# Should show:
#   origin/main
#   origin/develop

# Check branch protection (via GitHub UI)
# Visit: https://github.com/mofellah/realestate-world/settings/branches

# Try to push directly to main (should fail if protection enabled)
git checkout main
git commit --allow-empty -m "test"
git push origin main  # ❌ Should be rejected
```

---

## 13. Useful Git Aliases (Optional)

Add to `~/.gitconfig`:

```ini
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --oneline --graph --decorate --all
    cleanlocal = !git branch --merged | grep -v \"\\*\\|main\\|develop\" | xargs -n 1 git branch -d
```

Usage:
```powershell
git co develop          # checkout develop
git br                  # list branches
git visual              # see branch graph
git cleanlocal          # delete merged local branches
```

---

## 14. Cheat Sheet Summary

| Action | Command |
|--------|---------|
| **Start feature** | `git checkout -b feature/X-name` |
| **Commit** | `git commit -m "type(scope): message"` |
| **Push** | `git push origin feature/X-name` |
| **Update with develop** | `git fetch origin && git rebase origin/develop` |
| **Create PR** | `gh pr create --base develop --head feature/X-name` |
| **After merge** | `git checkout develop && git pull && git branch -d feature/X-name` |

---

## 15. CI/CD Integration (After Issue #17)

Once GitHub Actions CI is set up (Issue #17), PRs will automatically:

1. ✅ Run linting (`npm run lint`)
2. ✅ Run type checking (`tsc --noEmit`)
3. ✅ Run tests (`npm run test`)
4. ✅ Build project (`npm run build`)
5. ✅ Report coverage

**Status checks** will appear in PR:
- All checks must pass before merge
- If checks fail, review logs and fix issues

---

## 16. Quick Reference Links

- **GitHub Repo**: https://github.com/mofellah/realestate-world
- **Issues**: https://github.com/mofellah/realestate-world/issues
- **Pull Requests**: https://github.com/mofellah/realestate-world/pulls
- **Actions (CI/CD)**: https://github.com/mofellah/realestate-world/actions
- **Settings**: https://github.com/mofellah/realestate-world/settings

---

## Need Help?

- **Git Workflow Details**: See `.github/GIT_WORKFLOW.md`
- **Conventional Commits**: https://www.conventionalcommits.org/
- **GitHub Flow**: https://guides.github.com/introduction/flow/
- **Git Cheat Sheet**: https://education.github.com/git-cheat-sheet-education.pdf

---

**Last Updated**: 2026-01-28  
**Status**: Ready to start development ✅
