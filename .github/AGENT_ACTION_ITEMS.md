# Agent Action Items - Phase 3 Continuation

**Issued**: 2026-01-28 10:00 UTC  
**Authority**: Orchestrator  
**Status**: Active assignments

---

## 🔴 DATABASE AGENT - ACTION REQUIRED (BLOCKING)

**Issue**: #24 - Schema Validation & Design Review  
**Priority**: P0 (CRITICAL - blocks other agents)  
**Status**: Awaiting pickup

### Your Task

Review `db/schema.prisma` and resolve 3 ambiguities:

#### 1. User `name` Field Decision

**Current State**: Tests conflict
- `auth.register.spec.ts:95` expects name to be set
- `auth.register.spec.ts:259` expects name to be null

**Action**:
```
1. Open db/schema.prisma
2. Find: model User
3. Decide: Is 'name' field required or optional?
4. Update the field:
   - Required: name String
   - Optional: name String?
5. Add comment explaining decision:
   // name field is [REQUIRED/OPTIONAL] because [reason]
```

**Sign-Off**: Comment in schema must clearly state your decision

---

#### 2. User Role Pattern Decision

**Current State**: Schema has BOTH (must choose one)
```prisma
model User {
  role String @default("user")  // ← Simple role string
  userRoles UserRole[]          // ← RBAC relationship
}
```

**Action**:
```
1. Decide: Use SIMPLE or RBAC pattern?

   Option A: SIMPLE (keep role String field)
   - Simple queries: WHERE role = 'admin'
   - No permissions per role
   - Tests expecting userRoles must be deleted

   Option B: RBAC (use userRoles[] relationship)
   - Complex queries: JOIN user_role, role
   - Full permission support per role
   - Keep tests expecting userRoles
   - Remove role field from User

2. Update db/schema.prisma accordingly
3. Add comment explaining decision:
   // User role uses [SIMPLE/RBAC] pattern because [reason]
```

**Sign-Off**: Schema must have only one pattern, not both

---

#### 3. Listing Design Decision

**Current State**: Unconfirmed (blocks ListingService)

**Action**:
```
1. Confirm ListingType enum values (e.g.):
   enum ListingType {
     RESIDENTIAL      // House, apartment, condo
     COMMERCIAL       // Office, retail
     LAND             // Vacant land
     MIXED_USE        // Combined
   }

2. Confirm Address relationship:
   - Option A: Direct reference
     model Listing {
       address Address @relation(...)
       addressId String
     }
   
   - Option B: Embedded fields
     model Listing {
       street String
       city String
       zipCode String
     }

3. Confirm required fields on Listing:
   - title: required (always)
   - description: required or optional?
   - pricePerMonth: required or optional?
   - availableFrom: required or optional?
   - paymentTerms: required or optional?

4. Update db/schema.prisma with confirmed design
5. Add comments explaining each decision
```

**Sign-Off**: Schema must clearly document Listing structure

---

### Deliverable

**Update `db/schema.prisma`**:
```prisma
// Example after your decisions:

model User {
  // ... existing fields ...
  // name is REQUIRED because we need user identification
  name String
  
  // Using SIMPLE role pattern because:
  // - MVP doesn't need complex permissions
  // - Simpler queries
  role String @default("user")
}

enum ListingType {
  RESIDENTIAL
  COMMERCIAL
  LAND
}

model Listing {
  // ... fields ...
  // Uses direct Address reference for data integrity
  address Address @relation(...)
  addressId String
}
```

### Exit Criteria

✅ When Database Agent signs off:
```markdown
## Phase 3b - Database Agent Schema Validation Report

**Status**: ✅ Complete
**Timestamp**: [ISO date UTC]
**Agent**: Database Agent

### Decisions Made

1. **User name field**: [REQUIRED/OPTIONAL] because [reason]
2. **User role pattern**: [SIMPLE/RBAC] because [reason]
3. **Listing design**: 
   - Address: [DIRECT/EMBEDDED]
   - ListingType values: [list confirmed values]
   - Required fields: [list]

### Files Updated
- db/schema.prisma (with decision comments)

### Next Steps
✅ Coder agent may now proceed with ListingService implementation
```

**Append report to**: `.github/AGENT_WORK_LOG.md`

---

## 🟡 TEST AGENT - READY TO START (PARALLEL)

**Issue**: #25 - Test Infrastructure & Fixtures  
**Priority**: P1 (parallel work - doesn't depend on schema)  
**Status**: Can start immediately

### Your Task

Create test infrastructure while Database Agent works on schema.

#### 1. Update Jest Configuration

**File**: `apps/backend/jest.config.js`

Remove deprecation warnings by moving config from `globals` to `transform`:
```javascript
// OLD (deprecated):
globals: {
  'ts-jest': {
    isolatedModules: true,
  },
}

// NEW (recommended):
transform: {
  '^.+\\.ts$': ['ts-jest', {
    isolatedModules: true,
  }],
}
```

**Result**: `npm test` should run without deprecation warnings

---

#### 2. Create Test Setup File

**File**: `apps/backend/src/__tests__/setup.ts`

```typescript
// Global test setup
import 'reflect-metadata';

// Suppress Winston logs during tests (only show errors)
process.env.LOG_LEVEL = 'error';
process.env.NODE_ENV = 'test';

// Optional: Global test helpers
beforeAll(() => {
  console.log('Test suite starting...');
});

afterAll(() => {
  console.log('Test suite complete');
});
```

**Benefit**: Clean test output, consistent environment

---

#### 3. Create Fixture Factories

**File**: `apps/backend/src/__tests__/fixtures/users.fixtures.ts`

```typescript
export const createMockUser = (overrides = {}) => ({
  id: 'user-001',
  email: 'test@example.com',
  name: 'Test User',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockAdminUser = (overrides = {}) =>
  createMockUser({
    email: 'admin@example.com',
    name: 'Admin User',
    ...overrides,
  });
```

**File**: `apps/backend/src/__tests__/fixtures/properties.fixtures.ts`

```typescript
export const createMockProperty = (overrides = {}) => ({
  id: 'prop-001',
  title: 'Beautiful Apartment',
  description: 'Spacious 2BR',
  ownerId: 'user-001',
  addressId: 'addr-001',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

**File**: `apps/backend/src/__tests__/fixtures/listings.fixtures.ts` (stub for now)

```typescript
// When schema validated, fill this in:
export const createMockListing = (overrides = {}) => ({
  // ... to be completed once schema confirmed
  ...overrides,
});
```

---

#### 4. Create Prisma Mock Helper

**File**: `apps/backend/src/__tests__/helpers/prisma.mock.ts`

```typescript
export const createMockPrismaService = () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  property: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Add more models as needed
});
```

**Usage in tests**:
```typescript
const mockPrisma = createMockPrismaService();
```

---

#### 5. Create Test Utilities

**File**: `apps/backend/src/__tests__/helpers/test-utils.ts`

```typescript
import { TestingModule, Test } from '@nestjs/testing';

export const createTestingModule = async (providers) => {
  return Test.createTestingModule({
    providers,
  }).compile();
};

export const createPaginationParams = (page = 1, limit = 10) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const expectToThrowException = async (fn, ExceptionClass) => {
  try {
    await fn();
    fail('Should have thrown exception');
  } catch (error) {
    expect(error).toBeInstanceOf(ExceptionClass);
  }
};
```

---

#### 6. Create Test README

**File**: `apps/backend/src/__tests__/README.md`

```markdown
# Backend Test Suite

## Structure

- `fixtures/` - Mock data generators
- `helpers/` - Test utilities and Prisma mocks
- `**/*.spec.ts` - Test files (co-located with code)

## Creating a New Test

1. Import fixtures:
   \`\`\`typescript
   import { createMockUser, createMockProperty } from '../fixtures';
   \`\`\`

2. Setup Prisma mock:
   \`\`\`typescript
   const mockPrisma = createMockPrismaService();
   \`\`\`

3. Create module:
   \`\`\`typescript
   const module = await createTestingModule([
     ServiceClass,
     { provide: PrismaService, useValue: mockPrisma },
   ]);
   \`\`\`

## Running Tests

\`\`\`bash
npm test                          # All tests
npm test -- --watch             # Watch mode
npm test -- --coverage          # With coverage
\`\`\`

## Coverage Target

- Minimum: 80% coverage on critical paths
- Target: 90% coverage
```

---

### Exit Criteria

✅ When complete:
```markdown
## Phase 3c - Test Agent Infrastructure Report

**Status**: ✅ Complete
**Timestamp**: [ISO date UTC]

### Deliverables
- ✅ Jest config updated (no deprecation warnings)
- ✅ Test setup file created
- ✅ Fixture factories implemented
- ✅ Prisma mock helpers ready
- ✅ Test utilities created
- ✅ README with usage guide

### Ready For
- Coder agent to implement ListingService tests
- Schema-specific fixture updates
```

**Append report to**: `.github/AGENT_WORK_LOG.md`

---

## 🟡 DEVOPS AGENT - READY TO START (PARALLEL)

**Issue**: #26 - Docker & CI/CD Setup  
**Priority**: P1 (parallel work - doesn't depend on schema)  
**Status**: Can start immediately

### Your Task

Finalize Docker and CI/CD infrastructure.

#### 1. Update Dockerfiles

**Backend Dev** (`ops/docker/backend.dev.dockerfile`):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000 9229
CMD ["npm", "run", "dev"]
```

**Frontend Dev** (`ops/docker/frontend.dev.dockerfile`):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

**Database** (`ops/docker/db.dockerfile`):
```dockerfile
FROM postgis/postgis:18-3.4
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=realestate_dev
COPY . /app
RUN chmod +x /app/ops/docker/init-postgis.sh
HEALTHCHECK --interval=5s --timeout=5s --retries=5 \
  CMD pg_isready -U postgres
```

---

#### 2. Update Docker Compose Files

**Dev Compose** (`ops/compose/docker-compose.dev.yml`):
```yaml
version: '3.8'
services:
  backend:
    build:
      context: ../..
      dockerfile: ops/docker/backend.dev.dockerfile
    ports:
      - "3000:3000"
      - "9229:9229"
    volumes:
      - ../../apps/backend:/app/apps/backend
      - /app/node_modules
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/realestate_dev
      NODE_ENV: development
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ../..
      dockerfile: ops/docker/frontend.dev.dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ../../apps/frontend:/app/apps/frontend
      - /app/node_modules
    environment:
      VITE_API_URL: http://localhost:3000

  db:
    build:
      context: ../..
      dockerfile: ops/docker/db.dockerfile
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: realestate_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**Prod Compose** (`ops/compose/docker-compose.prod.yml`):
```yaml
version: '3.8'
services:
  backend:
    build:
      context: ../..
      dockerfile: ops/docker/backend.dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://...
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ../..
      dockerfile: ops/docker/frontend.dockerfile
    ports:
      - "3001:3000"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

---

#### 3. Create GitHub Actions Workflows

**Test Workflow** (`.github/workflows/test.yml`):
```yaml
name: Test

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:backend -- --coverage
```

**Build Workflow** (`.github/workflows/build.yml`):
```yaml
name: Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
```

**Docker Workflow** (`.github/workflows/docker.yml`):
```yaml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      
      - run: docker compose -f ops/compose/docker-compose.dev.yml build
      - run: docker compose -f ops/compose/docker-compose.dev.yml up -d
      - run: sleep 10
      - run: docker compose -f ops/compose/docker-compose.dev.yml exec -T backend npm run type-check
      - run: docker compose -f ops/compose/docker-compose.dev.yml down
```

---

#### 4. Create Documentation

**File**: `ops/README.md`

```markdown
# DevOps & Infrastructure

## Local Development

### Start Services
\`\`\`bash
docker compose -f ops/compose/docker-compose.dev.yml up --build
\`\`\`

### Check Status
\`\`\`bash
# Backend health
curl http://localhost:3000/health

# Frontend
http://localhost:5173

# Database
psql -h localhost -U postgres
\`\`\`

## Ports Reference

| Service | Port | Purpose |
|---------|------|---------|
| Backend | 3000 | REST API |
| Frontend | 5173 | React dev |
| Database | 5432 | PostgreSQL |
| Debug | 9229 | Node debugger |

## CI/CD Pipelines

Workflows run on:
- **Pull requests**: Full test suite
- **Main push**: Build + test + docker build
```

---

#### 5. Create Environment Template

**File**: `.env.example`

```
# Backend
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/realestate_dev
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRATION=3600

# Frontend
VITE_API_URL=http://localhost:3000

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=realestate_dev
```

---

### Verification

Before signing off, run:
```bash
docker compose -f ops/compose/docker-compose.dev.yml up --build

# Wait 30 seconds for migrations...

# In another terminal:
curl http://localhost:3000/health
# Should return: {"status":"ok","db":true}

curl http://localhost:5173
# Should show React app
```

---

### Exit Criteria

✅ When complete:
```markdown
## Phase 3d - DevOps Agent Docker & CI/CD Report

**Status**: ✅ Complete
**Timestamp**: [ISO date UTC]

### Deliverables
- ✅ All Dockerfiles updated
- ✅ docker-compose.dev.yml complete
- ✅ docker-compose.prod.yml complete
- ✅ GitHub Actions workflows (3 files)
- ✅ Environment templates created
- ✅ Documentation complete

### Verification
- ✅ `docker compose up --build` runs cleanly
- ✅ Backend health check passes
- ✅ Frontend hot-reload works
- ✅ Database migrations auto-run
- ✅ All GitHub Actions valid YAML

### Ready For
- Local development workflow
- CI/CD automation
- Production deployment
```

**Append report to**: `.github/AGENT_WORK_LOG.md`

---

## Summary

| Agent | Task | Status | Issue |
|-------|------|--------|-------|
| Database | Schema Validation | 🔴 BLOCKING | #24 |
| Test | Test Infrastructure | 🟡 READY | #25 |
| DevOps | Docker & CI/CD | 🟡 READY | #26 |
| Coder | Listing Service | ⏸️ WAITING | Awaiting DB |

**Timeline**: Database agent holds critical path. Test + DevOps can complete in parallel.
