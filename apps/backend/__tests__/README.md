# Backend Test Infrastructure

Comprehensive testing setup for the backend services with fixtures, mocks, and utilities.

## Quick Start

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode (auto-rerun on file changes)
npm run test -- --watch

# Run specific test file
npm run test -- auth.register.spec.ts

# Run tests matching a pattern
npm run test -- --testNamePattern="should register"

# Run with coverage report
npm run test -- --coverage
```

### Coverage Requirements

The project maintains **80%+ coverage** for critical paths:
- **Lines**: 80%+
- **Statements**: 80%+
- **Functions**: 80%+
- **Branches**: 75%+ (some branch coverage)

View coverage report:
```bash
npm run test -- --coverage
# HTML report: coverage/backend/lcov-report/index.html
```

## Test Structure

```
src/
├── __tests__/
│   ├── setup.ts              # Global test configuration
│   ├── fixtures/             # Test data factories
│   │   ├── user.fixtures.ts
│   │   ├── property.fixtures.ts
│   │   └── listing.fixtures.ts
│   ├── helpers/              # Test utilities
│   │   ├── prisma.mock.ts    # Prisma mocking utilities
│   │   └── test.utils.ts     # Common test helpers
│   └── README.md             # This file
├── auth/
│   ├── __tests__/
│   │   ├── auth.register.spec.ts
│   │   ├── jwt.guard.spec.ts
│   │   └── roles.guard.spec.ts
│   └── ...
├── users/
│   ├── __tests__/
│   │   └── users.service.spec.ts
│   └── ...
└── ...
```

## Writing Tests

### Using Fixtures

Import fixtures from `__tests__/fixtures` to create mock data:

```typescript
import * as userFixtures from '../../__tests__/fixtures/user.fixtures';
import * as propertyFixtures from '../../__tests__/fixtures/property.fixtures';
import * as listingFixtures from '../../__tests__/fixtures/listing.fixtures';

describe('MyService', () => {
  it('should create a user', async () => {
    const mockUser = userFixtures.createMockUser({
      email: 'custom@test.com',
    });
    // Test code
  });

  it('should list properties', async () => {
    const props = propertyFixtures.createMockProperties('user-123', 5);
    // Test code
  });
});
```

### Available Fixtures

#### User Fixtures (`user.fixtures.ts`)

```typescript
createMockUser(overrides?)              // Basic user
createMockAdmin(overrides?)             // Admin user
createMockUserWithEmail(email, overrides?)  // Specific email
createMockActiveUser(overrides?)        // Active user
createMockInactiveUser(overrides?)      // Inactive user
createMockUsers(count, overrides?)      // Batch create
```

#### Property Fixtures (`property.fixtures.ts`)

```typescript
createMockAddress(overrides?)           // Address entity
createMockProperty(userId, overrides?)  // Property
createMockProperties(userId, count, overrides?)  // Batch
createMockApartment(userId, overrides?) // Apartment type
createMockHouse(userId, overrides?)     // House type
```

#### Listing Fixtures (`listing.fixtures.ts`)

```typescript
createMockListing(propertyId, overrides?)          // Base listing
createMockSaleListing(propertyId, overrides?)      // Sale type
createMockRentalListing(propertyId, overrides?)    // Rental type
createMockShortTermListing(propertyId, overrides?) // Short-term
createMockPublishedListing(propertyId, overrides?) // Published
createMockListings(propertyId, count, overrides?)  // Batch
```

### Mocking Prisma

Use Prisma mock helpers for database operations:

```typescript
import { createMockPrismaClient, mockFindUnique, mockCreate } from '../../__tests__/helpers/prisma.mock';
import { PrismaService } from '../../prisma/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    // Create mocked PrismaService
    const mockPrisma = createMockPrismaClient();

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should find user by id', async () => {
    const mockUser = createMockUser({ id: 'user-123' });
    
    // Setup mock response
    mockFindUnique(prismaService.user, mockUser);

    // Test
    const result = await service.getUserById('user-123');

    // Verify
    expect(result).toEqual(mockUser);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
    });
  });
});
```

### Test Utilities

Helper functions for common test patterns:

```typescript
import {
  expectNotFoundException,
  expectForbiddenException,
  expectBadRequestException,
  createTestContext,
  sleep,
  generateTestId,
} from '../../__tests__/helpers/test.utils';

describe('MyService', () => {
  it('should throw NotFoundException for missing entity', async () => {
    // Will throw if the promise doesn't throw NotFoundException
    await expectNotFoundException(
      service.getNonExistentUser('missing-id'),
    );
  });

  it('should throw ForbiddenException for unauthorized access', async () => {
    await expectForbiddenException(
      service.deleteUserAsGuest('user-123'),
    );
  });

  it('should create context for correlated logging', () => {
    const context = createTestContext('user-123');
    expect(context.correlationId).toBeDefined();
    expect(context.userId).toBe('user-123');
  });

  it('should handle async delays', async () => {
    const start = Date.now();
    await sleep(100);
    expect(Date.now() - start).toBeGreaterThanOrEqual(100);
  });
});
```

## Test Patterns

### Unit Tests

Test a single service method in isolation:

```typescript
describe('PropertiesService.createProperty', () => {
  let service: PropertiesService;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    // Module setup with mocked dependencies
  });

  it('should create a property with valid input', async () => {
    // Arrange
    const input = { title: 'Test', bedrooms: 3 };
    const mockProperty = createMockProperty('user-123');
    jest.spyOn(prismaService.property, 'create')
      .mockResolvedValue(mockProperty);

    // Act
    const result = await service.createProperty('user-123', input);

    // Assert
    expect(result.id).toBe(mockProperty.id);
    expect(prismaService.property.create).toHaveBeenCalled();
  });
});
```

### Integration Tests

Test multiple components working together:

```typescript
describe('Property Listing - Integration', () => {
  // Use jest.setTimeout(30000) for longer integration tests

  it('should list properties with filters', async () => {
    // Test without mocking PrismaService
    // Use real database or test database
  });
});
```

### Error Scenarios

Always test error paths:

```typescript
describe('UsersService - Error Handling', () => {
  it('should handle duplicate email gracefully', async () => {
    mockPrismaService.user.create.mockRejectedValue(
      new ConflictException('Email already exists'),
    );

    await expectConflictException(
      service.createUser({ email: 'taken@test.com', password: '...' }),
    );
  });

  it('should return 404 for missing user', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expectNotFoundException(
      service.getUserById('missing-id'),
    );
  });
});
```

## Common Patterns from PropertiesService

The PropertiesService tests showcase best practices:

1. **Proper mocking**: All Prisma methods mocked in beforeEach
2. **Arrange-Act-Assert**: Clear test structure
3. **Mock verification**: Check that mocks were called correctly
4. **Error handling**: Test both success and failure paths
5. **Fixtures**: Use mock data consistently
6. **Cleanup**: jest.clearAllMocks() in afterEach

See `properties/__tests__/properties.service.spec.ts` as a reference.

## Configuration

### Jest Config (`jest.config.js`)

- **Preset**: `ts-jest` for TypeScript support
- **Timeout**: 10s for unit tests (increase with `jest.setTimeout(ms)` in tests)
- **Coverage**: 80%+ thresholds for critical paths
- **Setup**: `src/__tests__/setup.ts` runs before tests
- **Test patterns**: 
  - `src/**/__tests__/**/*.spec.ts`
  - `src/**/?(*.)+(spec).ts`

### Environment Variables

Tests run with variables from `.env.test`:
- `NODE_ENV=test`
- `DATABASE_URL=postgresql://test:test@localhost:5432/boilerplate_test`
- `JWT_SECRET=test-secret-key...`
- Other config as needed

### Global Setup (`src/__tests__/setup.ts`)

- Sets test environment variables
- Configures global mocks (fetch, etc.)
- Provides test context utilities
- Suppresses expected errors

## Debugging Tests

### Run Single Test
```bash
npm run test -- users.service.spec.ts
```

### Run With Debug Output
```bash
npm run test -- --verbose
```

### Run With Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### View Coverage Report
```bash
npm run test -- --coverage
open coverage/backend/lcov-report/index.html
```

## Troubleshooting

### Tests timeout
- Increase timeout: `jest.setTimeout(30000)` in test file
- Check for unresolved promises
- Ensure mocks are returning immediately

### Cannot find module
- Check that module aliases in jest.config.js match tsconfig.json
- Verify file paths are correct

### Prisma mock errors
- Ensure you're using `createMockPrismaClient()` for proper typing
- Check that mock setup matches actual method signatures
- Use `as any` only as last resort (with comment explaining why)

### Type errors in tests
- Ensure fixtures are properly imported
- Check that mocked service matches actual interface
- Use `as any` only as last resort (with comment explaining why)

## Coverage Goals

Critical paths require 80%+ coverage:
- **Auth services**: Registration, JWT validation, role guards
- **User services**: Get user, list users
- **Property services**: CRUD operations, filtering
- **Listing services**: Create, update, publish operations

Non-critical utilities can have lower coverage but should have representative tests.

## Continuous Integration

Tests run automatically in CI on:
- Pull requests
- Commits to main branch
- Nightly builds

All tests must pass before merging to main.

---

**Last Updated**: 2026-01-28  
**Reference Pattern**: PropertiesService Tests  
**Coverage Target**: 80%+
