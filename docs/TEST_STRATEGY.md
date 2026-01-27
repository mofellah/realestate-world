# Testing Strategy & Discipline

**Last Updated**: 2026-01-24  
**Audience**: Developers, QA, AI agents

---

## Philosophy: BDD/TDD First

**TDD Discipline**:
1. Write BDD scenario (Gherkin)
2. Translate to failing tests
3. Write minimal code to pass tests
4. Refactor for clarity
5. Repeat

**Benefits**:
- Requirements are clear before coding
- Code is testable by design
- Regression prevention (tests catch breakage)
- Documentation (tests show how to use code)
- Confidence (code is proven to work)

**At a glance**:
- Coverage target: ≥80% overall; auth/users higher.
- Lint + type-check required before/with tests in CI.
- Backend tests: Jest in apps/backend/src/**/__tests__/
- Frontend tests: RTL/Jest in apps/frontend/src/__tests__/; Cypress E2E in apps/frontend/e2e.

---

## Test Pyramid

```
        E2E (Cypress)
      ╱             ╲
    ╱   Integration   ╲
  ╱       (Jest)       ╲
╱─────────────────────────╲
      Unit (Jest)
```

| Level | What | Count | Speed | Cost |
|-------|------|-------|-------|------|
| **Unit** | Single function/method | Many (60%) | Fast (ms) | Cheap |
| **Integration** | Service + DB interaction | Some (25%) | Slower (sec) | Medium |
| **E2E** | Full user flow (UI → API → DB) | Few (15%) | Slowest (min) | Expensive |

---

## Test Structure (Locations)

### Unit Tests (Jest)

**Location**: `src/module/__tests__/`

```
apps/backend/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   └── __tests__/               ← Test location
│   │       ├── auth.service.spec.ts
│   │       ├── auth.guard.spec.ts
│   │       └── fixtures/             ← Test data
│   │           └── auth-fixtures.ts
│   ├── posts/
│   │   ├── posts.service.ts
│   │   ├── posts.controller.ts
│   │   └── __tests__/
│   │       ├── posts.service.spec.ts
│   │       ├── posts.controller.spec.ts
│   │       └── fixtures/
│   │           └── posts-fixtures.ts
```

**Naming Convention**: `*.spec.ts` (Jest auto-discovers)

**Example** (`auth.service.spec.ts`):
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    // Setup
    const module = await Test.createTestingModule({
      providers: [AuthService, PrismaService],
    }).compile();

    service = module.get(AuthService);
    prisma = module.get(PrismaService);
  });

  describe('login', () => {
    it('should return access + refresh tokens on valid credentials', async () => {
      // Arrange
      const loginDto = { email: 'user@example.com', password: 'password' };
      const user = { id: 'user-123', email: 'user@example.com', password: 'hashed' };
      
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(service, 'validatePassword').mockResolvedValue(true);
      jest.spyOn(service, 'generateTokens').mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      // Arrange
      const loginDto = { email: 'user@example.com', password: 'wrong' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(service, 'validatePassword').mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
```

**Test Data (Fixtures)**:
```typescript
// auth-fixtures.ts
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'user@example.com',
  password: 'hashed-password',
  name: 'Test User',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockToken = (overrides = {}) => ({
  accessToken: 'eyJhbGc...',
  refreshToken: 'eyJhbGc...',
  expiresIn: 900,
  ...overrides,
});

// Usage in tests:
const user = createMockUser({ email: 'admin@example.com' });
```

---

### Integration Tests (Jest + Real/Mocked DB)

**Location**: `src/module/__tests__/integration/`

```
apps/backend/
├── src/
│   ├── auth/
│   │   └── __tests__/
│   │       └── integration/
│   │           ├── auth-flow.spec.ts   ← Integration tests
│   │           └── fixtures/
│   │               └── test-db-fixtures.ts
```

**When to Write Integration Tests**:
- Service depends on database
- Service depends on external service (mocked)
- Complex workflow spanning multiple services

**Example** (`auth-flow.spec.ts`):
```typescript
describe('Auth Flow (Integration)', () => {
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    // Connect to test database (or use in-memory)
    prisma = new PrismaService();
    authService = new AuthService(prisma);
    
    // Create test schema
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        ...
      );
    `);
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany();
    await prisma.refreshToken.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should complete login → refresh → logout flow', async () => {
    // Create test user
    const user = await prisma.user.create({
      data: createMockUser(),
    });

    // Login
    const { accessToken, refreshToken } = await authService.login({
      email: user.email,
      password: 'password',
    });
    expect(accessToken).toBeTruthy();

    // Verify refresh token stored
    const stored = await prisma.refreshToken.findFirst({
      where: { userId: user.id },
    });
    expect(stored).toBeTruthy();

    // Refresh
    const { accessToken: newAccess } = await authService.refresh(refreshToken);
    expect(newAccess).toBeTruthy();

    // Logout (revoke)
    await authService.logout(refreshToken);
    const revoked = await prisma.refreshToken.findFirst({
      where: { userId: user.id, revokedAt: { not: null } },
    });
    expect(revoked).toBeTruthy();
  });
});
```

---

### E2E Tests (Cypress)

**Location**: `e2e/`

```
apps/frontend/
├── e2e/
│   ├── auth.cy.ts              ← Cypress tests
│   ├── health.cy.ts
│   └── fixtures/
│       └── users.json          ← Seed data for E2E
```

**Naming Convention**: `*.cy.ts` (Cypress auto-discovers)

**When to Write E2E Tests**:
- Critical user flows (auth, CRUD, checkout)
- Cross-system integration (UI → API → DB)
- Regression prevention (high-value, low-cost bugs)

**Example** (`auth.cy.ts`):
```typescript
describe('Authentication Flow (E2E)', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should login with valid credentials', () => {
    // Navigate to login
    cy.get('a[href="/login"]').click();

    // Fill form
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();

    // Verify redirect + authenticated UI
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard');
  });

  it('should show healthy backend status', () => {
    cy.visit('http://localhost:3000/health');
    cy.contains('status').should('exist');
  });
});
```

**Custom Commands** (`cypress/support/commands.ts`):
```typescript
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('http://localhost:3000/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});
```

---

## Test Coverage Targets

| Module | Target | Rationale |
|--------|--------|-----------|
| **Auth** | 90%+ | Critical, security-sensitive |
| **Database** | 85%+ | ORM correctness important |
| **API Controllers** | 80%+ | Happy path + error cases |
| **Utilities** | 80%+ | Reused across codebase |
| **UI Components** | 70%+ | Visual changes less critical |
| **Overall** | 80%+ | Practical balance |

**Check Coverage**:
```bash
npm run test:coverage

# Output:
# ────────────────────────────────────
# File      | % Stmts | % Branch | % Funcs | % Lines
# ────────────────────────────────────
# auth      | 92.3    | 88.5     | 95.2    | 91.8
# posts     | 85.1    | 79.3     | 88.2    | 84.9
# ...
# ────────────────────────────────────
# Total     | 82.5    | 78.9     | 85.3    | 82.1
```

---

## Running Tests

### Jest (Unit + Integration)

```bash
# Run all tests (watch mode)
npm run test

# Run specific file
npm run test -- auth.service.spec.ts

# Run with coverage
npm run test:coverage

# Run single test suite
npm run test -- --testNamePattern="login"

# Update snapshots
npm run test -- -u
```

### Cypress (E2E)

```bash
# Open Cypress UI (interactive)
npm run e2e:open

# Run headless
npm run e2e:run

# Run specific spec
npm run e2e:run -- --spec "e2e/auth.cy.ts"

# Debug single test
npm run e2e:debug -- --spec "e2e/auth.cy.ts"
```

### All Tests (CI)

```bash
npm run test:all  # Jest + Cypress
```

---

## BDD Scenario → Test Mapping

**BDD Scenario** (specs/bdd/auth.feature):
```gherkin
Scenario: User logs in successfully
  Given a user with email "user@example.com" exists
  When the user submits login form with valid credentials
  Then user receives access and refresh tokens
  And user is redirected to dashboard
  And tokens are stored securely
```

**Maps to**:
- **Unit Test** (`auth.service.spec.ts`):
  ```typescript
  it('should return tokens on valid credentials', ...)
  ```
- **Integration Test** (`auth-flow.spec.ts`):
  ```typescript
  it('should complete login and store refresh token in DB', ...)
  ```
- **E2E Test** (`auth.cy.ts`):
  ```typescript
  it('should login and redirect to dashboard', ...)
  ```

---

## Test Writing Checklist

Before you commit a feature:

- [ ] BDD scenario written (specs/bdd/)
- [ ] Unit tests written + passing (80%+ coverage for module)
- [ ] Integration tests written (if touching DB/external services)
- [ ] E2E test written (if user-facing feature)
- [ ] All tests pass: `npm run test:all`
- [ ] Coverage report reviewed: `npm run test:coverage`
- [ ] ESLint passes: `npm run lint`
- [ ] No hardcoded credentials in tests
- [ ] Test data is isolated (fixtures, not shared state)
- [ ] Error paths tested (negative cases, edge cases)

---

## Common Pitfalls

| Pitfall | Avoid | Instead |
|---------|-------|---------|
| Testing implementation | Mocking internals | Test behavior & output |
| Too many mocks | Mock > 50% of deps | Mock only external services |
| Slow tests | Slow DB queries in tests | Use in-memory DB or mocks |
| Flaky E2E tests | Hard waits (cy.wait(5000)) | Wait for elements/network |
| No test data cleanup | Share fixtures across tests | Clean up after each test |
| Poor test names | `test('it works')` | `test('should login with valid credentials')` |

---

## Continuous Integration

See `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  lint-test-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm run lint        # ESLint
      - run: npm run test        # Jest
      - run: npm run test:cov    # Coverage check (>80%)
      - run: npm run build       # Build all apps
      - run: npm run e2e:run     # Cypress (docker-compose up)
```

**PR Requirements**:
- ✅ All tests pass
- ✅ Coverage > 80%
- ✅ Linting passes
- ✅ Build succeeds

---

## References

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Docs](https://docs.cypress.io/)
- [Testing Pyramid (Martin Fowler)](https://martinfowler.com/bliki/TestPyramid.html)
- [BDD in Practice](https://cucumber.io/blog/bdd/)
