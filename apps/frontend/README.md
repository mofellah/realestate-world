# Frontend (React 18 + Vite)

React SPA with Tailwind CSS, TypeScript, and Zustand state management.

## Structure

```
src/
├── pages/             # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   └── NotFound.tsx
├── components/        # Reusable UI components
│   ├── auth/          # Auth-related components
│   ├── layout/        # Layout components (Header, Footer, etc.)
│   └── common/        # Shared components (Button, Input, etc.)
├── hooks/             # Custom React hooks
│   ├── useAuth.ts     # Auth state management
│   └── useApi.ts      # API call wrapper
├── services/          # API services
│   ├── auth-service.ts    # Authentication API calls
│   └── api-client.ts      # Axios instance with interceptors
├── store/             # Zustand stores
│   └── auth-store.ts  # Auth state (user, tokens)
├── styles/            # Global styles
│   ├── index.scss     # Main stylesheet
│   └── tailwind.css   # Tailwind directives
├── utils/             # Utility functions
│   ├── api-error.ts   # Error handling
│   └── validators.ts  # Form validation
└── __tests__/         # React Testing Library tests (56 tests)
    ├── pages/         # Page component tests
    ├── components/    # Component tests
    └── utils/         # Utility tests

e2e/                   # Cypress E2E tests
└── cypress/
    └── e2e/           # E2E test specs
```

## Key Patterns

- **Components**: Functional components with TypeScript
- **State**: Zustand for global state (auth, user)
- **Routing**: React Router v6
- **Forms**: Controlled components with validation
- **Styling**: Tailwind utility classes + SCSS modules
- **API**: Axios with interceptors for auth tokens
- **Tests**: RTL for components, Cypress for E2E

## Development

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:5173)
npm run dev

# Run unit tests (RTL)
npm run test

# Run unit tests with coverage
npm run test:cov

# Run E2E tests (Cypress)
npm run test:e2e

# Open Cypress UI
npm run cypress:open

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

See `apps/frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3001
```

## Documentation

- [Architecture](../../docs/ARCHITECTURE.md) - System design
- [Project Context](../../docs/PROJECT_CONTEXT.md) - API contracts, auth flows
- [Agent Framework](../../docs/AGENT_FRAMEWORK.md) - Code patterns (DR-001 to DR-010)
- [Test Strategy](../../docs/TEST_STRATEGY.md) - Testing approach
