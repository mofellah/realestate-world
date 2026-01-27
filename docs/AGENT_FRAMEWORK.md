# Agent Framework: Decision Log & Patterns

**Last Updated**: 2026-01-24  
**Audience**: AI agents (Coder, Database, DevOps, Test, Docs)

---

## Purpose

This document is your **decision registry**. Before you implement anything, check here. It tells you:
- **Why** each choice was made
- **Where** code belongs (file locations)
- **How** to follow established patterns
- **What** tradeoffs were accepted

### Quick Links
- Coder Playbook: docs/CODER_AGENT_PLAYBOOK.md
- Logging protocol: .github/AGENT_LOGGING_FRAMEWORK.md

### Decision Quick Digest (DR-001–DR-010)
- DR-001 Monorepo: npm workspaces; apps/*, packages/*, db/
- DR-002 Frontend: React 19 + Vite; Tailwind + SCSS/PostCSS
- DR-003 Backend: NestJS + Fastify; Prisma ORM
- DR-004 Database: PostgreSQL 18; Prisma migrations/seeds
- DR-005 Auth: JWT (access/refresh) + RBAC; bcrypt
- DR-006 Observability: Winston JSON logs + correlation IDs
- DR-007 Testing: Jest + RTL + Cypress; BDD/TDD-first; ≥80% coverage
- DR-008 Styling: Tailwind utilities + SCSS modules; theme via CSS vars
- DR-009 Debugging: Node Inspector 9229; Vite HMR; chrome://inspect / VSCode
- DR-010 Env: Zod validation in @boilerplate/config; .env.example required

### Actions for Coders (alignment highlights)
- Enforce BDD/TDD: scenario → test plan → tests → implementation before coding.
- Always consult DR-001–DR-010 and reuse patterns; avoid new patterns without approval.
- Follow monorepo placement: backend in apps/backend, frontend in apps/frontend, shared code in packages/*, schema/migrations in db/.
- Put tests where they belong: backend __tests__/ (unit/integration), frontend src/__tests__/ (RTL/Jest), E2E in apps/frontend/e2e.
- Use shared packages (@boilerplate/types, utils, config, logger) instead of duplicating code.
- Log every phase in .github/AGENT_WORK_LOG.md using .github/AGENT_LOGGING_FRAMEWORK.md.

---

## Decisions Made (Decision Register)

### DR-001: Monorepo Strategy (npm Workspaces)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Tool** | npm workspaces (not Yarn, Lerna, Pnpm) | Built-in to npm 7+, zero extra tooling, simplicity |
| **Structure** | `apps/*` (apps), `packages/*` (shared) | Clear separation, scalable to 10+ packages |
| **Dependencies** | Hoisted to root, shared across workspaces | Faster install, smaller disk footprint |
| **Publishing** | Local reference only (no npm registry) | Monorepo-first, defer publishing if needed |
| **Location** | See [docs/ARCHITECTURE.md](ARCHITECTURE.md) directory structure | Reference for all package placements |

**What This Means:**
- Every package has its own `package.json` with specific dependencies
- Root `package.json` lists workspaces: `"workspaces": ["apps/*", "packages/*", "db"]`
- Import shared packages: `import { Logger } from "@mono/logger"` (no relative paths)
- Run commands from root: `npm run test` runs tests in all workspaces

---

### DR-002: Frontend Framework (React 19 + Vite)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Framework** | React 19 (not Next.js, Svelte, Vue) | Latest stability, largest ecosystem, server components ready |
| **Build Tool** | Vite (not webpack, esbuild) | <100ms HMR, native ESM, instant dev startup |
| **Styling** | Tailwind CSS + SCSS/PostCSS | Utility-first + advanced theming, minimal bundle |
| **State Mgmt** | TBD (Zustand or Redux Toolkit) | To be decided in Phase 3 |
| **Testing** | React Testing Library + Cypress | User-centric tests + E2E coverage |
| **Location** | `apps/frontend/` | See ARCHITECTURE.md for full structure |

**What This Means:**
- `npm run dev --workspace=@mono/frontend` starts Vite dev server on port 3000
- Hot Module Replacement preserves state on file changes
- `vite.config.ts` configures build, env, aliases
- `apps/frontend/src/main.tsx` is the entry point
- Tests in `apps/frontend/e2e/` (Cypress) and `__tests__/` (Jest)

---

### DR-003: Backend Framework (NestJS + Fastify)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Framework** | NestJS (not Express, Hapi, Fastify-only) | Dependency injection, guards, interceptors, TypeScript-first |
| **HTTP Server** | Fastify (not Express) | 2-3x performance, modern async, streaming |
| **ORM** | Prisma (not TypeORM, Sequelize) | Type-safe, auto-migrations, excellent DX |
| **API Docs** | Swagger/OpenAPI (auto-generated) | Self-documenting, playground included |
| **Debugging** | Node.js Inspector on port 9229 | Breakpoints, watch expressions, time-travel |
| **Location** | `apps/backend/` | See ARCHITECTURE.md for full structure |

**What This Means:**
- `npm run start:dev --workspace=@mono/backend` starts NestJS with hot-reload
- Controllers use `@Controller()` decorators with guards/pipes/interceptors
- Services use `@Injectable()` dependency injection
- Prisma client auto-generated from schema (type-safe queries)
- Debug: `chrome://inspect` or VSCode launch config

---

### DR-004: Database (PostgreSQL 18 + Prisma Migrations)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Database** | PostgreSQL 18 (not MySQL, SQLite) | ACID, proven at scale, PostGIS ready |
| **Schema Location** | `db/schema.prisma` | Single source of truth for all models |
| **Migrations** | Prisma `prisma migrate` (auto-generated) | Version-controlled, reversible, no manual SQL |
| **Seeding** | `db/seeds/seed.ts` (TypeScript) | Reusable, testable, reproducible |
| **Connection** | Prisma Client (auto-generated) | Type-safe, optimized queries, relationship loading |
| **Env File** | `db/.env` (not in code) | Secrets not committed |

**What This Means:**
- Schema is the **single source of truth** (update it, migrations follow)
- Create migration: `cd db && npx prisma migrate dev --name <description>`
- Pull schema from DB: `npx prisma db pull` (if you need to migrate existing DB)
- Seeding runs automatically in docker-compose.dev.yml
- Prisma Studio: `npx prisma studio` (visual DB browser)

---

### DR-005: Authentication & Authorization (JWT + RBAC)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Auth Type** | JWT (not sessions, OAuth-only) | Stateless, scalable, multi-instance ready |
| **Tokens** | Access (15m) + Refresh (7d) | Short-lived access + revocable refresh |
| **Storage** | Refresh tokens in DB (RefreshToken table) | Logout support, token revocation |
| **Authorization** | RBAC (Role-Based Access Control) | Hierarchical, extensible to resource-based |
| **Hash** | bcrypt for passwords (not plaintext, MD5) | Industry standard, slow by design |
| **Claims** | JWT includes roles + permissions (not just user ID) | No DB lookups on every request |
| **Location** | `apps/backend/src/auth/`, `db/schema.prisma` | See PROJECT_CONTEXT.md for details |

**What This Means:**
- Login endpoint: `POST /auth/login` → returns `{ accessToken, refreshToken }`
- Request auth: `Authorization: Bearer <accessToken>`
- Refresh: `POST /auth/refresh` → new token pair
- Logout: `POST /auth/logout` → revokes refresh token
- Guards: `@UseGuards(AuthGuard)`, `@UseGuards(PermissionGuard('resource:action'))`

---

### DR-006: Observability (Structured Logging + Correlation IDs)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Logging** | Winston (not Pino, Bunyan, console) | JSON format, multiple transports, enterprise-ready |
| **Level** | debug, info, warn, error (not trace, fatal) | Standard severity levels |
| **Format** | JSON (not plaintext) | Machine-readable, log aggregation ready |
| **Correlation ID** | X-Trace-ID header (ULID or UUID) | Request tracing across logs |
| **Storage** | Console (dev), file rotation (prod) | Docker logs forwarded to ELK/DataDog later |
| **Location** | `packages/logger/`, `apps/backend/src/common/interceptors/` | Shared across workspaces |

**What This Means:**
- Every request gets unique X-Trace-ID (extracted/generated from header)
- Logged in every log entry (correlationId field)
- Errors include stack trace + context (user, endpoint, method)
- Dev: logs to console with colors
- Prod: logs to file with rotation (10MB, keep 7 days)

---

### DR-007: Testing (Jest + React Testing Library + Cypress + TDD)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Unit/Integration** | Jest (not Mocha, Jasmine) | Single runner, all envs, coverage built-in |
| **Component Tests** | React Testing Library (not Enzyme, RTL) | User-centric, discourages implementation testing |
| **E2E Tests** | Cypress (not Playwright, Puppeteer) | Easy debugging, time-travel debugging, standard |
| **TDD** | Tests BEFORE code (BDD scenarios → tests → impl) | Requirements first, quality gate |
| **Coverage Target** | 80%+ (not 100%, not <50%) | Practical balance, critical paths covered |
| **Location** | `__tests__/` (unit), `e2e/` (cypress) | Alongside code for discoverability |
| **CI** | GitHub Actions (lint, test, build) | See [.github/workflows/](../.github/workflows/) |

**What This Means:**
- Write BDD scenario → translate to test cases → implement to make tests pass
- Unit tests in `src/module/__tests__/*.spec.ts`
- E2E tests in `e2e/*.cy.ts` (Cypress format)
- Run: `npm run test` (watch mode), `npm run test:coverage` (report)
- Fail test, write code, pass test (TDD cycle)

---

### DR-008: Styling (Tailwind CSS + SCSS/PostCSS)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Utility CSS** | Tailwind (not Bootstrap, Foundation) | Rapid development, minimal bundle, customizable |
| **Advanced Styles** | SCSS + PostCSS (not CSS-in-JS) | Variables, mixins, nesting, plugins |
| **CSS Modules** | Component-scoped styles (`.module.scss`) | Prevent naming conflicts |
| **Theme Management** | CSS variables + Tailwind theme config | Light/dark mode support |
| **Location** | `apps/frontend/src/styles/`, `apps/frontend/tailwind.config.ts` | See ARCHITECTURE.md |

**What This Means:**
- Tailwind classes in JSX: `<button className="bg-blue-500 px-4 py-2">`
- Component styles: `Button.module.scss` imported as `styles.button`
- Global styles: `global.css` (Tailwind directives)
- Dark mode: Tailwind dark variant + CSS variables
- Theme: Customize in `tailwind.config.ts`

---

### DR-009: Debugging (Node.js Inspector + Chrome DevTools + Hot Reload)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Backend Debug** | Node.js Inspector on port 9229 | Built-in, breakpoints, step debugging |
| **Access** | `chrome://inspect` or VSCode debugger | No extra tooling needed |
| **Frontend Debug** | Vite source maps + React DevTools | Browser native debugging |
| **Dev Mode** | Hot reload preserves state (HMR) | Fast feedback loop |
| **Console** | Structured logs with context | Tracing requests end-to-end |
| **Location** | `docker-compose.dev.yml`, `.vscode/launch.json` | Dev-only, not in production |

**What This Means:**
- Backend: `docker-compose -f ops/compose/docker-compose.dev.yml up` exposes port 9229
- Open `chrome://inspect`, click "inspect" on Node process
- Set breakpoints, watch variables, step through code
- Frontend: Open DevTools (F12), see original TypeScript, use React DevTools
- Console.log shows with request context (traceId, userId, method)

---

### DR-010: Environment Management (Zod Runtime Validation)

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Validation** | Zod schema (not dotenv alone) | Type-safe, fail at startup if missing/invalid |
| **Location** | `packages/config/src/env.ts` | Shared across backend + frontend |
| **Structure** | Separate schemas per app (backend.env, frontend.env) | App-specific secrets not leaked |
| **Defaults** | No defaults for secrets (fail fast) | Security-first |
| **Files** | `.env.example` in repo, `.env` in gitignore | Secrets never committed |

**What This Means:**
- Environment variables validated at app startup
- Type-safe access: `config.database.url` (not `process.env.DATABASE_URL`)
- Missing var → app exits with clear error message
- See `.env.example` for required vars
- Copy to `.env` and fill in your values

---

## Code Patterns

### Pattern: Guards (Authentication & Authorization)

**Location**: `apps/backend/src/auth/guards/`

```typescript
// auth.guard.ts - Verify JWT token
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request);
    
    if (!token) throw new UnauthorizedException();
    
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload; // Attach to request
    } catch {
      throw new UnauthorizedException();
    }
    
    return true;
  }
}

// permission.guard.ts - Check if user has permission
@Injectable()
export class PermissionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = getMetadata('permission', context.getHandler());
    const request = context.switchToHttp().getRequest();
    
    if (!request.user.permissions.includes(requiredPermission)) {
      throw new ForbiddenException(`Missing: ${requiredPermission}`);
    }
    
    return true;
  }
}
```

**Usage in Controller**:
```typescript
@Controller('posts')
export class PostsController {
  @Post()
  @UseGuards(AuthGuard, PermissionGuard)
  @SetMetadata('permission', 'posts:create')
  async create(@Body() dto: CreatePostDto, @Req() req) {
    // req.user is now populated and authorized
  }
}
```

---

### Pattern: Interceptors (Logging & Correlation IDs)

**Location**: `apps/backend/src/common/interceptors/`

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const traceId = request.headers['x-trace-id'] || generateULID();
    
    // Store in async local storage (context across handlers)
    return this.logger.runWithContext({ traceId }, () => {
      const start = Date.now();
      
      this.logger.info(`${request.method} ${request.url}`, {
        traceId,
        userId: request.user?.id,
      });
      
      return next.handle().pipe(
        tap(() => {
          const duration = Date.now() - start;
          this.logger.info(`Response ${request.method} ${request.url}`, {
            statusCode: 200,
            duration,
            traceId,
          });
        }),
        catchError((error) => {
          this.logger.error(`Error ${request.method} ${request.url}`, {
            error: error.message,
            stack: error.stack,
            traceId,
          });
          throw error;
        }),
      );
    });
  }
}
```

---

### Pattern: Service with Prisma

**Location**: `apps/backend/src/posts/posts.service.ts`

```typescript
@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePostDto, userId: string) {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        userId,
      },
    });
  }

  async findAll(skip = 0, take = 10) {
    return this.prisma.post.findMany({
      skip,
      take,
      include: {
        user: { select: { id: true, name: true, email: true } },
        comments: { take: 3 }, // Include latest 3 comments
      },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { user: true, comments: true },
    });
    
    if (!post) throw new NotFoundException(`Post ${id} not found`);
    return post;
  }

  async update(id: string, dto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }
}
```

---

### Pattern: Jest Unit Test

**Location**: `apps/backend/src/posts/__tests__/posts.service.spec.ts`

```typescript
describe('PostsService', () => {
  let service: PostsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PostsService, PrismaService],
    }).compile();

    service = module.get(PostsService);
    prisma = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a post', async () => {
      const dto: CreatePostDto = {
        title: 'Test Post',
        content: 'Content',
      };
      const userId = 'user-123';

      jest.spyOn(prisma.post, 'create').mockResolvedValue({
        id: 'post-123',
        ...dto,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(dto, userId);

      expect(result.id).toBe('post-123');
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: { ...dto, userId },
      });
    });
  });
});
```

---

### Pattern: React Component with Tailwind + SCSS

**Location**: `apps/frontend/src/components/Button.tsx`

```typescript
import styles from './Button.module.scss';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
}) => {
  const baseClasses = 'font-semibold rounded transition-colors duration-200';
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  };
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
      style={styles.button} // Component-scoped styles
    >
      {children}
    </button>
  );
};
```

**Button.module.scss**:
```scss
.button {
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active {
    transform: scale(0.98);
  }
}
```

---

## AI Agent Workflow

### Before You Code

1. **Check This Document**: Is there a decision (DR-XXX) covering your task?
2. **Check ARCHITECTURE.md**: Where does this code belong?
3. **Check PROJECT_CONTEXT.md**: What's the data model / flow?
4. **Check TEST_STRATEGY.md**: What tests do I need to write first?
5. **Check BDD_FORMAT.md**: What BDD scenario maps to this feature?

### While You Code

1. **Follow the Pattern**: Use established patterns (guards, interceptors, services)
2. **Write Tests First**: BDD scenario → test cases → implementation
3. **Keep Location Explicit**: See ARCHITECTURE.md for file structure
4. **Document Decisions**: If you need to make a choice not covered here, add a DR-XXX

### After You Code

1. **Update Tests**: All BDD scenarios should pass
2. **Update Docs**: If you changed architecture, update ARCHITECTURE.md
3. **Update Schema**: If you touched DB, create Prisma migration
4. **Run Checks**: `npm run lint`, `npm run test`, `npm run test:coverage`

---

## Global Agent Protocols

### Confirmation Gate (Critical)

**If you are uncertain**, STOP and ask before implementing:

- ❓ **Missing context**: You don't understand a requirement
- ❓ **Conflicting specs**: Two requirements contradict
- ❓ **Out of scope**: Task feels like it belongs to another agent
- ❓ **Design question**: Multiple valid approaches exist
- ❓ **Type/schema mismatch**: Existing types don't align with implementation
- ❓ **Assumption risk**: You're inferring intent from incomplete info

**What to do**:
1. **Explain** the issue clearly (what is unclear)
2. **Ask** what the intended behavior is
3. **Wait** for confirmation before coding
4. **Never guess** or assume you understand

**Example**:
> "I notice `JwtPayload` in packages/types doesn't have a `correlationId` field, but the auth.service is trying to include it in the token. Should I add `correlationId?: string` to the type, or remove it from the service?"

### Agent Reporting Protocol (Mandatory)

**EVERY agent MUST report completion status to the Orchestrator.** Do not exit silently. Follow this format:

**When you complete a task**, provide a structured summary:

```
## [Phase X] - [Agent Name] Report

**Status**: ✅ Complete | ⚠️ Blocked | ❌ Failed  
**Timestamp**: YYYY-MM-DD HH:MM UTC  
**Task**: [Brief description of what was assigned]

### What Was Done
- Item 1 (✅ completed)
- Item 2 (✅ completed)
- Item 3 (⚠️ blocked due to [reason])

### Verification Results
- **Tests**: X passed, Y failed (if applicable)
- **Coverage**: Z% (if applicable)
- **Linting**: ✅ Pass / ❌ X errors
- **Compilation**: ✅ Pass / ❌ X errors
- **Build**: ✅ Success / ❌ Failed

### Deliverables
- File 1: `path/to/file.ts`
- File 2: `path/to/file.ts`
- [list all created/modified files]

### Blockers / Issues
- [List any issues encountered, or "None"]

### Next Steps
- Recommended action for Orchestrator: [e.g., "Proceed to Phase X", "Review and approve design decision"]
```

**Examples**:

**Coder Agent - Success**:
```
## Phase 4 - Coder Report

**Status**: ✅ Complete  
**Timestamp**: 2026-01-24 15:45 UTC  
**Task**: Implement NestJS backend core and auth module

### What Was Done
- ✅ Created apps/backend/src/main.ts (NestJS bootstrap with Fastify)
- ✅ Created apps/backend/src/app.module.ts (root module)
- ✅ Created apps/backend/src/auth/ (auth service, controller, guards, strategies)
- ✅ Created apps/backend/src/health/ (health check endpoint)
- ✅ Fixed 27 TypeScript compilation errors
- ✅ Updated packages/types (added correlationId to JwtPayload)

### Verification Results
- **Tests**: Not applicable for Phase 4 (implementation)
- **Linting**: ✅ Pass (npm run lint:backend)
- **Compilation**: ✅ Pass (npx tsc --noEmit)
- **Build**: ✅ Success (npm run build:backend)
- **Backend startup**: ✅ npm run dev:backend starts on port 3000
- **Health endpoint**: ✅ GET /health returns { status: "ok", timestamp: ... }

### Deliverables
- apps/backend/src/main.ts
- apps/backend/src/app.module.ts
- apps/backend/src/app.controller.ts
- apps/backend/src/app.service.ts
- apps/backend/src/auth/ (8 files)
- apps/backend/src/health/ (2 files)
- apps/backend/src/users/ (3 files)
- apps/backend/src/prisma/prisma.service.ts
- apps/backend/src/common/ (filters, interceptors, pipes)
- apps/backend/tsconfig.json (updated with package paths)

### Blockers / Issues
- None

### Next Steps
- Proceed to Phase 5 (Backend Tests via Test agent)
```

**Test Agent - Partial Success with Blockers**:
```
## Phase 5 - Test Agent Report

**Status**: ⚠️ Blocked  
**Timestamp**: 2026-01-24 16:20 UTC  
**Task**: Implement and run backend test suite

### What Was Done
- ✅ Created apps/backend/src/auth/__tests__/auth.service.spec.ts
- ✅ Created apps/backend/src/auth/__tests__/auth.controller.spec.ts
- ✅ Created apps/backend/src/users/__tests__/users.controller.spec.ts
- ✅ Created apps/backend/src/health/__tests__/health.controller.spec.ts
- ✅ Created test fixtures (mocks, test data)
- ⚠️ Tests compile but fail on execution (see blockers)

### Verification Results
- **Tests**: 43 passed, 5 failed (see below)
- **Coverage**: auth 82%, users 65%, health 100%
- **Linting**: ✅ Pass
- **Compilation**: ✅ Pass
- **Failed tests**:
  - `auth.service.spec.ts` - "should refresh token" (PrismaService mock issue)
  - `auth.controller.spec.ts` - "should logout" (token revocation not working)
  - 3 more details in issues section

### Deliverables
- apps/backend/src/auth/__tests__/ (5 files)
- apps/backend/src/users/__tests__/ (2 files)
- apps/backend/src/health/__tests__/ (1 file)
- apps/backend/src/auth/__tests__/fixtures/auth.fixtures.ts

### Blockers / Issues
1. **PrismaService mock not initialized correctly**: Mock expects different return shape
   - Solution: Need to align mock structure with actual Prisma client return
2. **JWT token hashing in tests**: RefreshToken.token is SHA256 hash, but test provides plain token
   - Solution: Need to hash test tokens before comparison

### Next Steps
- Review and approve the two issues listed above
- Confirm: Should I fix the mocks and re-run tests, or hand off to Coder for verification?
```

**Important Notes**:
- ✅ = Success, ⚠️ = Warning/Blocked, ❌ = Failed
- **Always** include verification results (tests, linting, compilation)
- **Always** list all deliverables (files created/modified)
- **Always** explain any blockers clearly
- **Never** exit without reporting status
- Orchestrator needs this info to proceed confidently to next phase

**Where to Put Your Report**:
- Reply directly to the Orchestrator's delegation message
- Include in your final message before completion
- **Do not assume silence = success**; always communicate status


### Agent Ownership Matrix

Each agent owns specific folders and has clear decision rights within them. **Cross-folder changes require coordination**.

| Agent | Owned Folders | Responsibilities | Decision Authority |
|-------|--------------|------------------|-------------------|
| **Coder** | `apps/backend/src/` (except db), `apps/frontend/src/` | Feature implementation, modules, components, services | Code patterns, file structure, module design |
| **Database** | `db/` (schema, migrations, seeds) | Schema design, migrations, seed data, indexing | Data model, relationships, constraints |
| **Test** | `**/__tests__/`, `**/e2e/`, `cypress.config.ts` | Test files, test fixtures, BDD scenario mapping | Test locations, coverage targets, test patterns |
| **DevOps** | `ops/`, `.github/workflows/`, `docker-compose*.yml`, `.env.example` | Docker, Compose, CI/CD, infrastructure | Container strategy, deployment pipeline |
| **Docs** | `docs/`, `specs/bdd/`, `README.md`, `START_HERE.md` | Documentation, decision registry (AGENT_FRAMEWORK.md), examples | Doc structure, decision tracking, communication |
| **Orchestrator** | `.github/agents/`, `IMPLEMENTATION_CHECKLIST.md` | Plans, routes, gates, overall coherence | Workflow, phase ownership, cross-agent coordination |

**Coordination Rules**:
- **Coder touches `packages/types/src/`?** → Notify Test + Docs (type changes affect tests and examples)
- **Database changes schema?** → Notify Coder (affects ORM usage) + Test (affects fixtures)
- **DevOps adds env variable?** → Notify Coder (must use in code) + Docs (must document)
- **Docs updates AGENT_FRAMEWORK.md?** → All agents review (decision changes affect everyone)

**Cross-ownership examples**:
- **tsconfig.json**: Owned by DevOps (root config), Coder references it, Test uses it
- **package.json** (root): DevOps manages dependencies, Coder lists what's needed, Test adds test frameworks
- **.env.example**: DevOps template, Coder documents what vars are used, Docs explains each one

---

## Agent Logging & Accountability (MANDATORY)

**Read this section carefully.** All agents are accountable for logging their work.

### The Problem We're Solving

Agents complete work but don't report back. The Orchestrator assumes silence = success, which masks failures. Example: Coder agent (Phase 6) partially created files but didn't report, blocking verification.

### The Solution: Mandatory Agent Logging

**EVERY agent MUST append a completion report** to `.github/AGENT_WORK_LOG.md` after each phase.

**Full protocol**: See `.github/AGENT_LOGGING_FRAMEWORK.md` (this is the authoritative source)

### Quick Checklist for Agents

After completing a phase:

- [ ] **All tasks completed or blocked documented?**
- [ ] **Verification done?** Build passes, tests pass, linting passes
- [ ] **Deliverables listed?** (exact file paths)
- [ ] **Blockers/issues captured?** (root cause + recommended fix)
- [ ] **Completion report appended** to `.github/AGENT_WORK_LOG.md`?
- [ ] **Status set correctly?** (✅ Complete, ⚠️ Blocked, or ❌ Failed)

### Gating Rule (ORCHESTRATOR ENFORCES)

**Orchestrator MUST NOT proceed to Phase X+1 until Phase X shows ✅ Complete in `.github/AGENT_WORK_LOG.md`**

If log entry is missing or status is ⚠️/❌:
1. Review the completion report
2. If blocked: Ask agent to fix and re-report
3. If failed: Assign to same or different agent for retry
4. If missing: Assume failure and ask agent to investigate + report

### Tool Limitations Must Be Logged

**Example**: "runSubagent tool doesn't relay output back to Orchestrator"

When you hit a tool limitation:
1. **Document it** in your completion report (Blockers section)
2. **Explain workaround** (e.g., "Orchestrator should manually verify files")
3. **Don't hide it** — transparency is more valuable than silence

---

## Questions?

- **"Where should I put this code?"** → Check ARCHITECTURE.md directory structure
- **"How do I write a test?"** → Check TEST_STRATEGY.md
- **"Where do I log my work?"** → Append to `.github/AGENT_WORK_LOG.md` per `.github/AGENT_LOGGING_FRAMEWORK.md`
- **"What if I hit a blocker?"** → Document in completion report, don't proceed silently
- **"What's the auth flow?"** → Check PROJECT_CONTEXT.md
- **"Why Prisma instead of TypeORM?"** → Check DR-004 above
- **"What if I need a new decision?"** → Add a DR-XXX, document it, discuss with team

---

## Decision Log (Future Decisions)

As new decisions are made, add them here:

- DR-011: (TBD)
- DR-012: (TBD)
- ...
