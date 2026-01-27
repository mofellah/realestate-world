# GitHub Actions CI/CD Pipeline

**Template Location**: `.github/workflows/ci.yml`

Create this file in your GitHub repository to enable continuous integration.

---

## CI/CD Pipeline Overview

The pipeline runs on every push and pull request to **main** and **develop**.

**Jobs (ci.yml)**:
1. **lint-typecheck**: npm ci → npm run lint → npm run format:check (non-blocking) → npm run type-check
2. **test-backend**: npm ci → npm run test --workspace=@boilerplate/backend -- --coverage --maxWorkers=2 → upload coverage
3. **test-frontend**: npm ci → npm run test --workspace=@boilerplate/frontend -- --coverage --maxWorkers=2 → upload coverage
4. **build**: npm ci → npm run build (all workspaces) → upload dist artifacts
5. **docker-build** (push to main only): Build backend/frontend images with ops/docker/*.dockerfile using buildx (no push)

**E2E (e2e.yml)**:
- Separate workflow running Cypress against built backend/frontend with Postgres service.
- **Critical**: Runs `npx prisma migrate deploy` + `SEED_TEST_DATA=true npm run seed` before tests.

**Database Migrations in CI**:
1. **PR/push to develop**: Run `prisma migrate dev` to verify new migrations work
2. **Push to main**: Run `prisma migrate deploy` (production-safe, no prompts)
3. **E2E tests**: Run `prisma migrate deploy` + `SEED_TEST_DATA=true npm run seed` before Cypress

**Seeding Strategy**:
- **Development/Test pipelines**: `SEED_TEST_DATA=true npm run seed --workspace=db`
  - Includes baseline (roles, perms, admin+user) + test fixtures (moderator, testuser1, testuser2)
- **Staging/Production pipelines**: `npm run seed --workspace=db`
  - Baseline only (no test users)

---

## GitHub Actions Workflow Template

Create `.github/workflows/ci.yml` (current template):

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'

jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
        continue-on-error: true
      - run: npm run type-check

  test-backend:
    needs: lint-typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test --workspace=@boilerplate/backend -- --coverage --maxWorkers=2
      - uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./apps/backend/coverage/lcov.info
          flags: backend

  test-frontend:
    needs: lint-typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test --workspace=@boilerplate/frontend -- --coverage --maxWorkers=2
      - uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./apps/frontend/coverage/lcov.info
          flags: frontend

  build:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: backend-dist
          path: apps/backend/dist/
      - uses: actions/upload-artifact@v3
        with:
          name: frontend-dist
          path: apps/frontend/dist/

  docker-build:
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: ops/docker/backend.dockerfile
          push: false
          tags: boilerplate-backend:${{ github.sha }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: ops/docker/frontend.dockerfile
          push: false
          tags: boilerplate-frontend:${{ github.sha }}
```

---

## Running CI Locally

Simulate the CI pipeline on your machine:

```bash
# Run all checks (lint, test, build)
npm run lint
npm run type-check
npm run test
npm run test:coverage
npm run build

# Or run full pipeline
npm run ci

# Run E2E tests locally
docker compose -f ops/compose/docker-compose.dev.yml up
npm run e2e:run
docker compose -f ops/compose/docker-compose.dev.yml down

# Mirror e2e.yml locally (build + preview + migrations + seeds)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/boilerplate_test \
  npx prisma migrate deploy --schema=db/schema.prisma
SEED_TEST_DATA=true npm run seed --workspace=db
npm run build --workspace=@boilerplate/backend
npm run build --workspace=@boilerplate/frontend
npm run start:prod --workspace=@boilerplate/backend &
npm run preview --workspace=@boilerplate/frontend &
npm run e2e:run --workspace=@boilerplate/frontend
```

---

## Branch Protection (GitHub Settings)

To enforce code quality, add branch protection rules:

1. Go to **Settings** → **Branches** → **Add rule**
2. Apply to branch: `main`
3. Enable:
   - ✅ Require status checks to pass (CI workflow)
   - ✅ Require code reviews before merging (≥ 1 approval)
   - ✅ Require branches to be up to date
   - ✅ Include administrators

---

## Troubleshooting CI

### Tests Fail but Pass Locally

**Possible causes**:
- Node version mismatch (use same version locally)
- Docker issues (CI runs in containers)
- Race conditions (use `--maxWorkers=2` in CI)

**Fix**:
```bash
# Match CI environment
node --version  # Should be 20+
npm ci          # Clean install (use in CI)
npm run test -- --maxWorkers=2
```

### Coverage Check Fails

**Fix**:
```bash
npm run test:coverage  # Check coverage locally
# If < 80%, add tests until > 80%
```

### Build Times Out

**Increase timeout** in workflow:
```yaml
timeout-minutes: 45  # Increase from 30
```

### Docker Build Fails

**Check Dockerfile**:
```bash
docker build -f ops/docker/backend.dockerfile -t test:latest .
docker build -f ops/docker/frontend.dockerfile -t test:latest .
```

---

## CD (Continuous Deployment) - Future

When ready to deploy, add job after tests pass:

```yaml
deploy:
  needs: lint-test-build  # Only if tests pass
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Deploy to staging
      run: |
        # Your deploy script here
        # e.g., push to Docker registry, deploy to K8s
        echo "Deploying to staging..."

    - name: Run smoke tests
      run: |
        # Quick checks to verify deployment
        curl -f https://staging.example.com/health
```

---

## Best Practices

| Practice | Why |
|----------|-----|
| **Use `npm ci`** | Cleaner than `npm install` in CI (exact versions) |
| **Cache dependencies** | Speeds up workflow (`cache: 'npm'`) |
| **Set max workers** | Jest uses `--maxWorkers=2` in CI (limit CPU) |
| **Continue on error** | Optional checks (lint) don't fail the build |
| **Upload artifacts** | Save test reports, video (on failure) |
| **Timeout handling** | Set reasonable timeouts (30-45 min) |
| **Branch protection** | Require CI to pass before merging |

---

## References

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflows Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Jest in CI](https://jestjs.io/docs/getting-started#usage)
- [Cypress in CI](https://docs.cypress.io/guides/continuous-integration/ci-provider-examples)
