# Backend (NestJS + Fastify)

RESTful API service with JWT authentication and RBAC authorization.

## Structure

```
src/
├── auth/              # Authentication (login, register, refresh, logout)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── jwt.guard.ts
│   ├── roles.guard.ts
│   └── __tests__/     # Unit tests (9 files, 93 tests)
├── users/             # User management
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── __tests__/     # Unit tests
├── health/            # Health checks
│   ├── health.controller.ts
│   └── __tests__/
├── common/            # Shared utilities
│   ├── decorators/    # @Public(), @Roles()
│   ├── filters/       # Global exception filters
│   ├── interceptors/  # Correlation ID
│   └── types/         # Request types
├── config/            # Environment configuration
│   └── env.config.ts  # Zod validation
└── prisma/            # Prisma client module
    └── prisma.service.ts
```

## Key Patterns

- **Controllers**: Validation with class-validator DTOs
- **Services**: Business logic, injected via DI
- **Guards**: JWT authentication, RBAC authorization
- **Decorators**: `@Public()`, `@Roles('admin')`, `@User()`
- **Tests**: Unit tests in `__tests__/` alongside modules

## Development

```bash
# Install dependencies
npm install

# Run dev server with watch mode
npm run start:dev

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build

# Debug (Node.js Inspector on port 9229)
npm run start:debug
```

## Environment Variables

See `apps/backend/.env.example`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/boilerplate
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=3001
```

## Documentation

- [Architecture](../../docs/ARCHITECTURE.md) - System design
- [Project Context](../../docs/PROJECT_CONTEXT.md) - Database schema, auth flows, API contracts
- [Agent Framework](../../docs/AGENT_FRAMEWORK.md) - Code patterns (DR-001 to DR-010)
- [Test Strategy](../../docs/TEST_STRATEGY.md) - Testing approach
