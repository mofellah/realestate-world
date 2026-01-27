# Project Context & Database Schema

**Last Updated**: 2026-01-24  
**Audience**: Developers, AI agents

---

## Database Schema (Auth & Authorization)

### Overview

The boilerplate starts with a **role-based access control (RBAC)** schema supporting:
- User authentication (JWT-based)
- Multiple roles per user
- Fine-grained permissions (resource:action)
- Refresh token storage (for logout support)

### Prisma Schema (`db/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// User entity
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // bcrypt hash
  name          String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  userRoles     UserRole[]
  refreshTokens RefreshToken[]

  @@map("users")
}

// Role entity
model Role {
  id          String @id @default(cuid())
  name        String @unique // "admin", "user", "moderator"
  description String?

  userRoles      UserRole[]
  rolePermissions RolePermission[]

  @@map("roles")
}

// User-Role many-to-many
model UserRole {
  userId String
  roleId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_roles")
}

// Permission entity
model Permission {
  id        String @id @default(cuid())
  resource  String // "posts", "users", "comments"
  action    String // "create", "read", "update", "delete"
  description String?

  rolePermissions RolePermission[]

  @@unique([resource, action])
  @@map("permissions")
}

// Role-Permission many-to-many
model RolePermission {
  roleId        String
  permissionId  String
  role          Role        @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission    Permission  @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@map("role_permissions")
}

// Refresh token storage (for logout support)
model RefreshToken {
  id        String    @id @default(cuid())
  userId    String
  token     String    @unique // JWT token hash
  expiresAt DateTime
  revokedAt DateTime? // NULL if active, set if revoked (logout)
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}
```

### Seed Data (`db/seeds/`)

**Seeding Strategy**: Two-tier approach (baseline + optional fixtures)

#### Baseline Seeds (`db/seeds/baseline.ts`)
**Always runs** — Production-safe foundational data:

```typescript
// Roles (3)
- admin (full access)
- user (basic access)
- moderator (content management)

// Permissions (20 total)
- users: create/read/update/delete
- posts: create/read/update/delete
- comments: create/read/update/delete
- roles: create/read/update/delete
- permissions: create/read/update/delete

// Role-Permission mappings
- admin: all 20 permissions
- user: posts:create/read, comments:create/read (4 permissions)
- moderator: read everything; create/update/delete posts and comments; read users (11 permissions)

// Baseline Users (2)
- admin@example.com / Admin123! → role: admin
- user@example.com / User123! → role: user
```

#### Test Fixtures (`db/seeds/fixtures.ts`)
**Conditional** — Only runs if `SEED_TEST_DATA=true`:

```typescript
// Additional Test Users (3)
- moderator@example.com / Moderator123! → role: moderator
- testuser1@example.com / TestUser1! → role: user
- testuser2@example.com / TestUser2! → role: user
```

#### Running Seeds
```bash
# Baseline only (production-safe)
npm run seed --workspace=db

# Baseline + test fixtures (dev/test environments)
SEED_TEST_DATA=true npm run seed --workspace=db
```

---

## Authentication Flow

### Login (Acquire Tokens)

```
1. POST /auth/login
   Body: { email: "user@example.com", password: "user123" }

2. Backend validates email + password (bcrypt compare)

3. If valid:
   - Generate access token (JWT, 15 min expiry)
     Claims: { sub: userId, email, roles: [...], permissions: [...] }
   - Generate refresh token (JWT, 7 day expiry)
   - Store refresh token hash in DB (RefreshToken table)
   - Return both tokens to frontend

4. Response:
   {
     "accessToken": "eyJhbGc...",
     "refreshToken": "eyJhbGc...",
     "expiresIn": 900  // seconds
   }

5. Frontend stores in memory (not localStorage for security) or httpOnly cookie
```

### Registration (Create Account)

```
1. POST /auth/register
   Body: { 
     email: "newuser@example.com", 
     password: "SecurePass123!",
     passwordConfirmation: "SecurePass123!",
     name: "New User" (optional)
   }

2. Backend validation:
   - Email uniqueness (409 Conflict if exists)
   - Password strength (8+ chars, uppercase, digit)
   - Password confirmation match (400 Bad Request if mismatch)

3. If valid:
   - Hash password (bcrypt)
   - Create user in DB
   - Assign default "user" role
   - Generate access + refresh tokens
   - Return tokens + user object

4. Response (201 Created):
   {
     "accessToken": "eyJhbGc...",
     "refreshToken": "eyJhbGc...",
     "expiresIn": 900,
     "user": {
       "id": "cmkwmm...",
       "email": "newuser@example.com",
       "name": "New User",
       "isActive": true,
       "createdAt": "2026-01-27T13:22:36.001Z",
       "updatedAt": "2026-01-27T13:22:36.001Z"
     }
   }

5. Validation Error Responses:
   - 409 Conflict: { "message": "Email already registered" }
   - 400 Bad Request: { "message": "Password does not meet complexity requirements" }
   - 400 Bad Request: { "message": "Passwords do not match" }

6. Frontend stores tokens, redirects to dashboard
```

### Authenticated Request

```
1. Frontend sends request with Authorization header:
   GET /posts
   Authorization: Bearer eyJhbGc...

2. Backend middleware extracts token, verifies signature

3. If valid:
   - Attach user + roles + permissions to request object
   - Continue to controller

4. Controller can check permissions:
   if (!request.user.permissions.includes("posts:read")) {
     throw ForbiddenException()
   }
```

### Refresh Token (Renew Access)

```
1. Access token expired (15 min)

2. Frontend sends refresh request:
   POST /auth/refresh
   Body: { refreshToken: "eyJhbGc..." }

3. Backend validates refresh token:
   - Check signature
   - Check not revoked (revokedAt IS NULL)
   - Check not expired (expiresAt > now())

4. If valid:
   - Revoke old refresh token (update revokedAt)
   - Generate new access + refresh tokens
   - Return new pair to frontend

5. Frontend updates tokens in memory
```

### Logout (Revoke Refresh Token)

```
1. Frontend sends logout request:
   POST /auth/logout
   Authorization: Bearer eyJhbGc...

2. Backend revokes refresh token:
   UPDATE refresh_tokens
   SET revoked_at = NOW()
   WHERE user_id = ? AND revoked_at IS NULL

3. Access token still valid until expiry
   (user can't use refresh token to get new access tokens)

4. Frontend clears tokens from memory
```

---

## Authorization Pattern (RBAC)

### Guards (NestJS Decorators)

```typescript
// backend/src/auth/guards/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractTokenFromHeader(request);
    
    if (!token) throw new UnauthorizedException();
    
    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
    } catch {
      throw new UnauthorizedException();
    }
    
    return true;
  }
}

// backend/src/auth/guards/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivator {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { permission } = context.switchToRpc().getArgByIndex(0).args[1];
    const request = context.switchToHttp().getRequest();
    
    if (!request.user.permissions.includes(permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
    
    return true;
  }
}
```

### Controller Usage

```typescript
@Controller('posts')
@UseGuards(AuthGuard) // Require authentication
export class PostsController {
  
  @Post()
  @UseGuards(new PermissionGuard('posts:create')) // Require permission
  async createPost(@Body() dto: CreatePostDto, @Req() req) {
    return this.postsService.create(dto, req.user.id);
  }

  @Get()
  @UseGuards(new PermissionGuard('posts:read'))
  async getPosts() {
    return this.postsService.findAll();
  }
}
```

---

## API Contracts

### Auth Endpoints

| Method | Path | Body | Response | Guard |
|--------|------|------|----------|-------|
| POST | `/auth/login` | `{ email, password }` | `{ accessToken, refreshToken, expiresIn }` | None |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken, expiresIn }` | None |
| POST | `/auth/logout` | None | `{ message: "Logged out" }` | AuthGuard |
| GET | `/auth/me` | None | `{ id, email, name, roles, permissions }` | AuthGuard |

### Users Endpoints (Example)

| Method | Path | Body | Guard |
|--------|------|------|-------|
| POST | `/users` | `{ email, name, password }` | AuthGuard + PermissionGuard("users:create") |
| GET | `/users` | None | AuthGuard + PermissionGuard("users:read") |
| GET | `/users/:id` | None | AuthGuard + PermissionGuard("users:read") |
| PATCH | `/users/:id` | `{ name, ... }` | AuthGuard + PermissionGuard("users:update") |
| DELETE | `/users/:id` | None | AuthGuard + PermissionGuard("users:delete") |

### Health Endpoint

| Method | Path | Response |
|--------|------|----------|
| GET | `/health` | `{ status: "ok", timestamp, dbConnected: true }` |

---

## Environment Variables

### Backend (`apps/backend/.env`)

```bash
# Database
DATABASE_URL="postgresql://postgres:password@postgres:5432/boilerplate"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"

# App
NODE_ENV="development"
APP_PORT=3001
LOG_LEVEL="debug"
```

### Frontend (`apps/frontend/.env`)

```bash
# API
VITE_API_URL="http://localhost:3001"
VITE_APP_NAME="Boilerplate"
```

### Database (`db/.env`)

```bash
DATABASE_URL="postgresql://postgres:password@postgres:5432/boilerplate"
```

---

## Development Notes

### Adding a New Entity

1. **Update schema** (`db/schema.prisma`)
   ```prisma
   model Post {
     id String @id @default(cuid())
     title String
     content String
     userId String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   
     user User @relation(fields: [userId], references: [id])
   }
   ```

2. **Create migration**
   ```bash
   cd db && npx prisma migrate dev --name add_posts
   ```

3. **Update seed** (`db/seeds/seed.ts`)
   ```typescript
   await prisma.post.create({
     data: { title: "...", content: "...", userId: "..." }
   })
   ```

4. **Generate types** (`packages/types/database.ts`)
   ```typescript
   export type Post = Prisma.PostGetPayload<{...}>
   ```

5. **Create service + controller**
   ```typescript
   // apps/backend/src/posts/posts.service.ts
   // apps/backend/src/posts/posts.controller.ts
   ```

6. **Add tests**
   ```typescript
   // apps/backend/src/posts/__tests__/posts.service.spec.ts
   // apps/backend/src/posts/__tests__/posts.controller.spec.ts
   ```

---

## Troubleshooting

### Database Connection Failed

```bash
# Check postgres is running
docker ps | grep postgres

# Check DATABASE_URL is correct
echo $DATABASE_URL

# Manually test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Migrations Out of Sync

```bash
# Reset to clean state (dev only!)
cd db && npx prisma migrate reset --force

# Or view migration status
npx prisma migrate status
```

### Auth Token Issues

```bash
# Check token format (should be "Bearer <token>")
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3001/auth/me

# Decode token (check claims)
jwt decode <token>
```

---

## References

- [Prisma Docs](https://www.prisma.io/docs/)
- [NestJS Auth](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
