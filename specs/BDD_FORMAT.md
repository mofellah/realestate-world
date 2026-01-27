# BDD Format & Gherkin Conventions

**Last Updated**: 2026-01-24  
**Audience**: Developers, QA, AI agents

---

## Overview

BDD (Behavior-Driven Development) uses **Gherkin syntax** to write testable scenarios in plain English. Each scenario maps to test cases.

---

## Gherkin Syntax

### Basic Structure

```gherkin
Feature: Feature Name
  Brief description of what this feature does.

  Background:
    # Shared steps before each scenario
    Given the application is running
    And database is seeded with test data

  Scenario: Descriptive scenario name
    Given some initial state
    When an action happens
    Then verify the outcome
    And another outcome
```

### Keywords

| Keyword | Purpose | Example |
|---------|---------|---------|
| **Feature** | Feature description | `Feature: User Authentication` |
| **Scenario** | Single test case | `Scenario: User logs in with valid credentials` |
| **Given** | Initial state (precondition) | `Given user with email "user@example.com" exists` |
| **When** | Action (trigger) | `When user submits login form` |
| **Then** | Expected outcome (assertion) | `Then user receives access token` |
| **And** | Additional step (any type) | `And user is redirected to dashboard` |
| **But** | Negation/exception | `But user cannot access admin page` |
| **Background** | Shared setup before each scenario | (database seeded, app running) |

---

## Location & Naming

### File Structure

```
specs/
├── boilerplate.md                 # Main spec (overview + BDD scenarios)
└── bdd/                           # Detailed BDD features
    ├── auth.feature               # Authentication scenarios
    ├── health.feature             # Health check scenarios
    ├── posts.feature              # CRUD scenarios (future)
    ├── users.feature              # User management (future)
    └── fixtures/
        ├── users.json             # Test data
        └── permissions.json
```

### Naming Conventions

- **File**: `feature-name.feature` (kebab-case)
- **Scenario**: Descriptive, action-oriented (e.g., "User logs in successfully")
- **Steps**: Clear, testable, use values not variables

**Good**:
```gherkin
Scenario: User logs in with valid credentials
  Given a user with email "admin@example.com" exists
  When the user submits the login form with password "admin123"
  Then the user receives an access token
```

**Bad**:
```gherkin
Scenario: Login works
  Given user $USER exists
  When user logs in
  Then it works
```

---

## Example: auth.feature

```gherkin
Feature: User Authentication
  Authenticate users via JWT tokens with refresh token rotation.

  Background:
    Given the application is running
    And database contains test users:
      | email                | password | role    |
      | admin@example.com    | admin123 | admin   |
      | user@example.com     | user123  | user    |
      | moderator@example.com| mod123   | moderator |

  Scenario: User logs in with valid credentials
    Given a user with email "user@example.com" exists
    When the user submits a login request with email "user@example.com" and password "user123"
    Then the response status is 200
    And the response contains an access token
    And the response contains a refresh token
    And the access token expires in 900 seconds
    And the refresh token is stored in the database

  Scenario: User cannot login with invalid password
    Given a user with email "user@example.com" exists
    When the user submits a login request with email "user@example.com" and password "wrongpassword"
    Then the response status is 401
    And the response contains error "Invalid credentials"
    And no tokens are returned

  Scenario: User refreshes access token
    Given a user with email "user@example.com" is logged in
    And the user has a valid refresh token
    When the user submits a refresh request with the refresh token
    Then the response status is 200
    And the response contains a new access token
    And the old refresh token is revoked (revokedAt is set)
    And a new refresh token is issued

  Scenario: User cannot refresh with revoked token
    Given a user with email "user@example.com" is logged in
    And the user's refresh token has been revoked
    When the user submits a refresh request with the revoked token
    Then the response status is 401
    And the response contains error "Token revoked or expired"

  Scenario: User logs out
    Given a user with email "user@example.com" is logged in
    And the user has a valid refresh token stored in the database
    When the user submits a logout request
    Then the response status is 200
    And the user's refresh token is revoked (revokedAt is set)
    And subsequent refresh attempts fail

  Scenario: User receives proper error on invalid email
    When the user submits a login request with email "nonexistent@example.com" and password "anypassword"
    Then the response status is 401
    And the response contains error "User not found"

  Scenario: Access token includes correct claims
    Given a user with email "user@example.com" and role "user" is logged in
    When the user decodes the access token
    Then the token contains claim "sub" with user ID
    And the token contains claim "email" with value "user@example.com"
    And the token contains claim "roles" with value ["user"]
    And the token contains claim "permissions" with user's permissions
```

---

## Example: health.feature

```gherkin
Feature: Health Checks
  Verify application and service health.

  Scenario: Backend health endpoint responds
    Given the application is running
    When I make a GET request to "/health"
    Then the response status is 200
    And the response body contains:
      | field        | value          |
      | status       | ok             |
      | timestamp    | <current-date> |
      | dbConnected  | true           |
      | version      | <app-version>  |

  Scenario: Frontend health endpoint responds
    Given the frontend application is running on port 3000
    When I navigate to "/"
    Then the page loads successfully
    And the page contains "Boilerplate App"
    And browser console has no errors
```

---

## Mapping Scenarios to Tests

### Scenario → Test Cases

For each scenario, create test cases at each level:

**BDD Scenario**:
```gherkin
Scenario: User logs in with valid credentials
  Given a user with email "admin@example.com" exists
  When the user submits a login request
  Then the user receives an access token
```

**Maps to Unit Test** (auth.service.spec.ts):
```typescript
describe('AuthService.login', () => {
  it('should return access token for valid credentials', async () => {
    const user = createMockUser({ email: 'admin@example.com' });
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
    
    const result = await authService.login({
      email: 'admin@example.com',
      password: 'admin123',
    });
    
    expect(result.accessToken).toBeTruthy();
  });
});
```

**Maps to Integration Test** (auth-flow.spec.ts):
```typescript
describe('Auth Flow', () => {
  it('should login and store refresh token in database', async () => {
    const user = await prisma.user.create({ data: createMockUser() });
    
    const result = await authService.login({
      email: user.email,
      password: 'password',
    });
    
    const stored = await prisma.refreshToken.findFirst({
      where: { userId: user.id },
    });
    expect(stored).toBeTruthy();
  });
});
```

**Maps to E2E Test** (auth.cy.ts):
```typescript
describe('Authentication (E2E)', () => {
  it('should login and redirect to dashboard', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('accessToken')).toBeTruthy();
    });
  });
});
```

---

## Step Implementation (Test Hooks)

Steps are implemented as **test hooks** in each testing framework.

### Jest Hooks

```typescript
// auth.service.spec.ts
let authService: AuthService;
let prisma: PrismaService;

// Given: Setup
beforeEach(async () => {
  authService = new AuthService(prisma);
});

// Given: User exists
const givenUserExists = async (email: string) => {
  return prisma.user.create({
    data: createMockUser({ email }),
  });
};

// When: User logs in
const whenUserLogsIn = async (email: string, password: string) => {
  return authService.login({ email, password });
};

// Then: Verify access token
const thenUserReceivesAccessToken = (result) => {
  expect(result.accessToken).toBeTruthy();
};

// Scenario
it('User logs in with valid credentials', async () => {
  await givenUserExists('user@example.com');
  const result = await whenUserLogsIn('user@example.com', 'user123');
  thenUserReceivesAccessToken(result);
});
```

### Cypress Hooks

```typescript
// auth.cy.ts
Cypress.Commands.add('givenUserExists', (email: string) => {
  cy.request('POST', 'http://localhost:3001/test/seed-user', {
    email,
    password: 'password',
  });
});

Cypress.Commands.add('whenUserLogsIn', (email: string, password: string) => {
  cy.visit('http://localhost:3000/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('thenUserIsRedirected', (path: string) => {
  cy.url().should('include', path);
});

// Scenario
it('User logs in with valid credentials', () => {
  cy.givenUserExists('user@example.com');
  cy.whenUserLogsIn('user@example.com', 'user123');
  cy.thenUserIsRedirected('/dashboard');
});
```

---

## Best Practices

### 1. Write Scenarios BEFORE Code

```gherkin
✅ Good: Scenario written, test fails, code written, test passes

❌ Bad: Code written, scenario written after, test forced to pass
```

### 2. Use Real Values, Not Placeholders

```gherkin
✅ Good:
  When the user submits a login request with email "admin@example.com"

❌ Bad:
  When the user submits a login request with email $EMAIL
```

### 3. One Scenario = One Behavior

```gherkin
✅ Good:
  Scenario: User logs in with valid credentials
  Scenario: User cannot login with invalid password
  Scenario: User refreshes access token

❌ Bad:
  Scenario: User authentication
    And the user logs in
    And the user refreshes the token
    And the user logs out
```

### 4. Given, When, Then Order

```gherkin
✅ Good Order:
  Given (setup) → When (action) → Then (verify)

❌ Bad Order:
  When (action) → Given (setup) → Then (verify)
```

### 5. Avoid Implementation Details

```gherkin
✅ Good (behavior-focused):
  Then the user receives an access token
  And the refresh token is stored in the database

❌ Bad (implementation-focused):
  Then prisma.refreshToken.create is called with userId
  And the JWT is signed with RS256 algorithm
```

---

## Scenario Data (Tables)

Use tables for multiple test cases:

```gherkin
Scenario Outline: Users with different roles
  Given a user with role "<role>" exists
  When the user accesses the "<resource>" endpoint
  Then the response status is <status>

  Examples:
    | role      | resource | status |
    | admin     | /admin   | 200    |
    | user      | /admin   | 403    |
    | moderator | /posts   | 200    |
```

---

## Linking BDD to Code

### In Test File Comments

```typescript
// Implement this scenario: specs/bdd/auth.feature:12
// Scenario: User logs in with valid credentials

describe('AuthService.login', () => {
  it('should return access token for valid credentials', async () => {
    // Maps to: Given user exists, When login, Then token returned
    ...
  });
});
```

### In Feature File Comments

```gherkin
# Implementation: apps/backend/src/auth/__tests__/auth.service.spec.ts:25
# Implementation: e2e/auth.cy.ts:15
Scenario: User logs in with valid credentials
  ...
```

---

## Running & Debugging

### Run Tests by Scenario

```bash
# Jest (by scenario name)
npm run test -- --testNamePattern="User logs in with valid credentials"

# Cypress (by feature)
npm run e2e:run -- --spec "e2e/auth.cy.ts"
```

### Debug Failed Scenario

1. **Read scenario** (specs/bdd/*.feature)
2. **Check tests** (mapped in comments)
3. **Run test in debug mode**:
   ```bash
   npm run test -- --testNamePattern="scenario-name" --debug
   ```
4. **Check logs** (trace IDs, structured logs)
5. **Fix code** or **update scenario** if spec was wrong

---

## Continuous Updates

As features are added:

1. **Write scenario** → specs/bdd/feature.feature
2. **Create tests** → __tests__/ and e2e/
3. **Implement code** → pass tests
4. **Update main spec** → specs/boilerplate.md
5. **Link in comments** → tests ↔ scenarios

---

## Template: New Feature

### 1. Write Feature File

```gherkin
# specs/bdd/new-feature.feature
Feature: Feature Name
  Brief description.

  Scenario: User does something
    Given ...
    When ...
    Then ...
```

### 2. Write Tests

```typescript
// apps/backend/src/module/__tests__/module.spec.ts
// Implementation: specs/bdd/new-feature.feature:5
describe('NewModule', () => {
  it('should handle the scenario', async () => {
    ...
  });
});
```

### 3. Implement Code

```typescript
// apps/backend/src/module/module.service.ts
// Implements: specs/bdd/new-feature.feature:5
export class NewService {
  ...
}
```

### 4. Update Main Spec

```markdown
# specs/boilerplate.md
- Scenario: User does something (new feature)
  - Given ...
  - When ...
  - Then ...
```

---

## References

- [Gherkin Syntax](https://cucumber.io/docs/gherkin/reference/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
