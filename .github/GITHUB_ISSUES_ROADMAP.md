# GitHub Issues - MVP Roadmap

**Created**: 2026-01-28  
**Repository**: https://github.com/mofellah/realestate-world  
**Total Issues**: 23  
**Timeline**: Weeks 5-12 (Feb 3 - Mar 31, 2026)

---

## Issue Summary by Epic

### Epic #1: Backend Core (Issues #2-#6)
**Timeline**: Weeks 5-6 (Feb 3-10)

| # | Title | Type | Agent |
|---|-------|------|-------|
| #2 | Auth Module - Login, Register, JWT Tokens | Feature | Coder |
| #3 | Property/Asset Module - CRUD with Hierarchy Support | Feature | Coder |
| #4 | Listing Module - Create, Publish, Pause, Renew | Feature | Coder |
| #5 | Backend Guards & Interceptors - Auth, Permissions, Logging | Feature | Coder |
| #6 | Backend Testing - Auth, Property, Listing Modules | Testing | Test |

**Dependencies**: Database schema ✅, Types package ✅

---

### Additional Backend Features (Issues #7-#8)
**Timeline**: Weeks 5-6 (Feb 3-10)

| # | Title | Type | Agent |
|---|-------|------|-------|
| #7 | Agency Module - Team Management & Subscriptions | Feature | Coder |
| #8 | Messaging Module - Inquiries & Conversations | Feature | Coder |

**Dependencies**: Auth module (#2), Listing module (#4)

---

### Epic #9: Frontend (Issues #10-#15)
**Timeline**: Weeks 7-8 (Feb 10-24)

| # | Title | Type | Agent |
|---|-------|------|-------|
| #10 | Map Search - Interactive Property Discovery | Feature | Coder |
| #11 | Property Detail Page - Full Info & Contact Form | Feature | Coder |
| #12 | Auth Pages - Login, Register, Password Reset | Feature | Coder |
| #13 | Owner Dashboard - Properties, Listings, Inquiries | Feature | Coder |
| #14 | Agency Dashboard - Team, Portfolio, Subscription | Feature | Coder |
| #15 | Frontend Testing - Components & E2E Coverage | Testing | Test |

**Dependencies**: Backend API complete (#1-#8), Mock data ✅

---

### DevOps & Infrastructure (Issues #16-#17)
**Timeline**: Weeks 7-8 (Feb 10-24)

| # | Title | Type | Agent |
|---|-------|------|-------|
| #16 | Docker Compose Finalization - Dev & Production | DevOps | DevOps |
| #17 | CI/CD Pipeline - GitHub Actions Setup | DevOps | DevOps |

**Dependencies**: Tests exist (#6, #15), Docker setup started ✅

---

### Epic #18: Launch Prep (Issues #19-#22)
**Timeline**: Weeks 11-12 (Mar 24-31)

| # | Title | Type | Agent |
|---|-------|------|-------|
| #19 | Manual QA & Accessibility Testing | Testing | Test |
| #20 | Performance & Load Testing - NFR Validation | Testing | Test |
| #21 | Security Audit & Penetration Testing | Testing | Test |
| #22 | Go/No-Go Decision & Launch Checklist | Launch | Orchestrator |

**Dependencies**: All features complete (#1-#15), Infrastructure ready (#16-#17)

---

### Documentation (Issue #23)
**Timeline**: Ongoing (Weeks 7-10)

| # | Title | Type | Agent |
|---|-------|------|-------|
| #23 | API Documentation - Swagger/OpenAPI | Docs | Docs |

**Dependencies**: Backend modules complete (#2-#8)

---

## Milestone Breakdown

### Milestone 1: Backend Core (Weeks 5-6)
**Target Date**: Feb 10, 2026

**Issues**: #1, #2, #3, #4, #5, #6, #7, #8  
**Total**: 8 issues

**Exit Criteria**:
- [ ] All backend modules implemented
- [ ] 80%+ test coverage
- [ ] BDD scenarios automated
- [ ] API endpoints functional
- [ ] Guards/interceptors working

---

### Milestone 2: Frontend & Infrastructure (Weeks 7-8)
**Target Date**: Feb 24, 2026

**Issues**: #9, #10, #11, #12, #13, #14, #15, #16, #17, #23  
**Total**: 10 issues

**Exit Criteria**:
- [ ] Map search functional (<2s load)
- [ ] All pages implemented
- [ ] 70%+ test coverage
- [ ] Docker compose working
- [ ] CI/CD operational
- [ ] API documentation complete

---

### Milestone 3: Polish & Testing (Weeks 9-10)
**Target Date**: Mar 10, 2026

**Issues**: Integration testing, bug fixes, refinements  
**Total**: ~5-10 issues (to be created as needed)

**Exit Criteria**:
- [ ] All critical bugs fixed
- [ ] Performance optimizations applied
- [ ] User feedback incorporated
- [ ] Documentation finalized

---

### Milestone 4: Launch (Weeks 11-12)
**Target Date**: Mar 31, 2026

**Issues**: #18, #19, #20, #21, #22  
**Total**: 5 issues

**Exit Criteria**:
- [ ] All QA complete
- [ ] Performance targets met
- [ ] Security validated
- [ ] Go/No-Go: ✅ GO
- [ ] Production deployed

---

## Issue Labels Summary

### By Type
- `mvp`: 23 issues (all MVP-critical)
- `enhancement`: 16 issues (new features)
- `test`: 5 issues (testing tasks)
- `docs`: 2 issues (documentation)
- `critical`: 4 issues (blocking launch)

### By Area
- `backend`: 8 issues
- `frontend`: 6 issues
- `devops`: 2 issues
- `ci`: 1 issue

---

## Critical Path

The following issues are on the critical path and must be completed on time:

1. **Week 5-6**: #2 (Auth) → #3 (Property) → #4 (Listing) → #6 (Testing)
2. **Week 7-8**: #10 (Map Search) → #15 (Frontend Testing) → #17 (CI/CD)
3. **Week 11-12**: #19 (QA) → #20 (Performance) → #21 (Security) → #22 (Go/No-Go)

**Any delay in these issues delays launch.**

---

## Next Steps (Immediate Actions)

1. **Set up branch protection** (see `.github/GIT_WORKFLOW.md`):
   - `main`: Require PR + CI + 1 approval
   - `develop`: Require PR + CI
2. **Create `develop` branch**:
   ```bash
   git checkout -b develop
   git push origin develop
   ```
3. **Start with Issue #2** (Auth Module):
   - Create feature branch: `git checkout -b feature/2-auth-module`
   - Implement according to issue acceptance criteria
   - Follow BDD/TDD: Write tests first
   - Open PR: `feature/2-auth-module` → `develop`
4. **Track progress**:
   - Update issue status as you work
   - Comment on issues with progress updates
   - Link PRs to issues: `Closes #2`

---

## Git Workflow Quick Reference

### Start New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/2-auth-module
```

### Commit Work
```bash
git add .
git commit -m "feat(auth): implement JWT token generation"
```

### Push & Create PR
```bash
git push origin feature/2-auth-module
# Open PR on GitHub: feature/2-auth-module → develop
# Link issue: "Closes #2"
```

### After Merge
```bash
git checkout develop
git pull origin develop
git branch -d feature/2-auth-module
```

---

## Resources

- **Git Workflow**: [.github/GIT_WORKFLOW.md](.github/GIT_WORKFLOW.md)
- **PR Template**: [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)
- **Issue Templates**: [.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/)
- **Implementation Checklist**: [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)
- **Product Requirements**: [PRODUCT_REQUIREMENTS_COMPLETE.md](PRODUCT_REQUIREMENTS_COMPLETE.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **BDD Scenarios**: [specs/bdd/](specs/bdd/)
- **Test Strategy**: [docs/TEST_STRATEGY.md](docs/TEST_STRATEGY.md)

---

## Success Metrics (Week 12 - Launch)

### Platform Metrics
- [ ] 10,000+ searchers registered
- [ ] 500+ properties listed
- [ ] 50+ agencies onboarded
- [ ] €30,000+ MRR (monthly recurring revenue)

### Technical Metrics
- [ ] 99.5%+ uptime
- [ ] <2s map load time (p95)
- [ ] <500ms filter response (p95)
- [ ] 0 critical bugs
- [ ] 80%+ backend test coverage
- [ ] 70%+ frontend test coverage

### User Metrics
- [ ] 60%+ owner/agency response rate to inquiries
- [ ] 4.0+ average rating (owners/agencies)
- [ ] <5% churn rate

---

**Last Updated**: 2026-01-28  
**Owner**: Orchestrator Agent  
**Status**: All 23 MVP issues created ✅
