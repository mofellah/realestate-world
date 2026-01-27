# Debug Setup & Usage

**Last Updated**: 2026-01-24  
**Audience**: Developers, AI agents

---

## Overview

The boilerplate supports **local debugging** in development mode with:
- **Backend**: Node.js Inspector (Chrome DevTools, VSCode)
- **Frontend**: Vite dev server with source maps + React DevTools
- **Database**: Prisma Studio visual inspection
- **Logs**: Structured JSON logs with correlation IDs

Inspector/HMR are exposed via ops/compose/docker-compose.dev.yml (backend port 9229, frontend HMR via Vite).

---

## Backend Debugging (Node.js Inspector)

### Start Dev Stack

```bash
docker compose -f ops/compose/docker-compose.dev.yml up
```

This exposes Node.js Inspector on **port 9229**.

### Debug in Chrome

1. Open **chrome://inspect**
2. Under "Remote Target", you should see the Node.js process
3. Click **"inspect"**
4. Chrome DevTools opens with access to:
   - Breakpoints
   - Watch expressions
   - Call stack
   - Scope/local variables
   - Console

### Debug in VSCode

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach Backend Debugger",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

Then:
1. Press **Ctrl+Shift+D** (Debug view)
2. Select **"Attach Backend Debugger"**
3. Click **Play** (▶️)
4. VSCode attaches to Node.js process
5. Set breakpoints in editor (click line number)
6. Step through code, inspect variables

### Example: Debug Login Flow

1. **Set breakpoint** in `apps/backend/src/auth/auth.service.ts`:
   ```typescript
   async login(dto: LoginDto) {
     // ← Set breakpoint here
     const user = await this.prisma.user.findUnique({
       where: { email: dto.email },
     });
     ...
   }
   ```

2. **Make request** from frontend or curl:
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

3. **Debugger breaks** at the line
4. **Inspect variables**:
   - Hover over `dto` to see request body
   - Hover over `user` to see query result
   - Step into Prisma query to see SQL

5. **Continue** (F5) or step through

---

## Frontend Debugging (Vite + React DevTools)

### Start Dev Stack

```bash
docker compose -f ops/compose/docker-compose.dev.yml up
```

Frontend runs on **port 3000** with HMR (Hot Module Replacement).

### Debug in Browser

1. Open **http://localhost:3000** in Chrome/Firefox
2. Press **F12** to open DevTools
3. Features:
   - **Sources**: Original TypeScript code (source maps preserved)
   - **Console**: Logs, errors, typed interactions
   - **Elements**: DOM inspection
   - **Network**: API calls, timing

### React DevTools Extension

1. Install **[React Developer Tools](https://react.dev/learn/react-developer-tools)** browser extension
2. Open DevTools (F12) → **Components** tab
3. Inspect component tree, props, state, hooks
4. Edit props/state in real-time to test behavior

### Hot Module Replacement (HMR)

When you save a file in the editor:
1. Vite detects the change
2. Module is hot-reloaded (no full page refresh)
3. **Component state is preserved** (React state intact)
4. Changes appear instantly in browser

Example:
```tsx
// apps/frontend/src/components/Button.tsx
export const Button = () => {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times  {/* ← Edit this text */}
    </button>
  );
};
```

Save → browser updates text immediately, **state (count) preserved**.

### Example: Debug React Component

1. **Open DevTools** (F12) → **React** tab
2. **Inspect component** in tree
3. **Edit props** in DevTools:
   - Find component
   - Click on props
   - Change value
   - See effect in real-time
4. **Set breakpoint** in **Sources** tab (original TypeScript)
5. **Trigger action** (click button, form submit)
6. Debugger breaks at breakpoint

---

## Database Debugging (Prisma Studio)

### Open Prisma Studio

```bash
cd db
npx prisma studio
```

Opens visual DB browser at **http://localhost:5555**

### Use Prisma Studio

- **View tables**: Click on any table (users, roles, etc.)
- **Add records**: Click "+" to insert test data
- **Edit records**: Click on any cell to edit
- **Filter**: Use search/filter UI
- **Relationships**: Follow foreign keys visually

Useful for:
- Checking if seed data loaded correctly
- Verifying auth tables (roles, permissions)
- Debugging migration issues

---

## Structured Logging with Correlation IDs

### What Gets Logged

Every request is logged with structured format (JSON):

```json
{
  "timestamp": "2026-01-24T10:30:45.123Z",
  "level": "info",
  "traceId": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "userId": "user-123",
  "method": "POST",
  "path": "/auth/login",
  "statusCode": 200,
  "duration": 145,
  "message": "Request completed"
}
```

### Trace ID (X-Trace-ID)

Every request gets a unique trace ID that flows through logs:

```bash
# 1. Frontend sends request with trace ID (auto-generated or from header)
curl -X POST http://localhost:3001/auth/login \
  -H "X-Trace-ID: 01ARZ3NDEKTSV4RRFFQ69G5FAV" \
  ...

# 2. Backend logs with trace ID
# [2026-01-24T10:30:45Z] traceId=01ARZ3NDEKTSV4RRFFQ69G5FAV level=info msg="Login request"
# [2026-01-24T10:30:45Z] traceId=01ARZ3NDEKTSV4RRFFQ69G5FAV level=debug msg="User lookup"
# [2026-01-24T10:30:45Z] traceId=01ARZ3NDEKTSV4RRFFQ69G5FAV level=debug msg="Password validation"
# [2026-01-24T10:30:45Z] traceId=01ARZ3NDEKTSV4RRFFQ69G5FAV level=info msg="Login successful"

# 3. Use trace ID to correlate logs
docker logs <backend-container> | grep "01ARZ3NDEKTSV4RRFFQ69G5FAV"
```

### Log Levels

| Level | Purpose | Example |
|-------|---------|---------|
| **debug** | Detailed info for developers | Variable values, loop iterations |
| **info** | Important business events | Login, data created, request completed |
| **warn** | Warnings that don't stop execution | Deprecated API, slow query |
| **error** | Error conditions | Failed login, database error, 5xx |

### Example: Debug Logs in Code

```typescript
// apps/backend/src/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  async login(dto: LoginDto) {
    this.logger.info('Login attempt', { email: dto.email });
    
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    
    if (!user) {
      this.logger.warn('User not found', { email: dto.email });
      throw new UnauthorizedException('Invalid credentials');
    }
    
    this.logger.debug('User found, validating password', { userId: user.id });
    const valid = await this.validatePassword(dto.password, user.password);
    
    if (!valid) {
      this.logger.warn('Invalid password', { userId: user.id, email: dto.email });
      throw new UnauthorizedException('Invalid credentials');
    }
    
    this.logger.info('Login successful', { userId: user.id });
    const tokens = await this.generateTokens(user);
    return tokens;
  }
}
```

### View Logs

```bash
# View logs from running container
docker logs -f <backend-container-name>

# Example output:
# [2026-01-24T10:30:45.123Z] {"level":"info","message":"Login attempt","email":"user@example.com","traceId":"01ARZ3..."}
# [2026-01-24T10:30:45.145Z] {"level":"debug","message":"User found, validating password","userId":"user-123","traceId":"01ARZ3..."}
# [2026-01-24T10:30:45.162Z] {"level":"info","message":"Login successful","userId":"user-123","traceId":"01ARZ3..."}
```

---

## Debugging Common Issues

### 1. Database Connection Failed

**Symptom**: `Error: connect ECONNREFUSED`

**Debug Steps**:
1. Check postgres is running:
   ```bash
   docker ps | grep postgres
   ```
2. Check `DATABASE_URL` is correct:
   ```bash
   echo $DATABASE_URL
   # Should be: postgresql://postgres:password@postgres:5432/boilerplate
   ```
3. Test connection:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```
4. View logs:
   ```bash
   docker logs <db-container>
   ```

### 2. Hot Reload Not Working

**Symptom**: Frontend doesn't update on file change

**Debug Steps**:
1. Check Vite is running:
   ```bash
   docker logs <frontend-container> | grep "VITE"
   ```
2. Check file watcher:
   - Increase max files (some systems have limits):
     ```bash
     echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
     sudo sysctl -p
     ```
3. Restart container:
   ```bash
   docker restart <frontend-container>
   ```

### 3. Auth Token Issues

**Symptom**: `UnauthorizedException` on every request

**Debug Steps**:
1. Check token format:
   ```bash
   # Should be "Bearer <token>"
   curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3001/auth/me
   ```
2. Decode token (check claims):
   ```bash
   # Use jwt.io or:
   node -e "console.log(require('jsonwebtoken').decode('eyJhbGc...'))"
   ```
3. Check token expiry:
   ```bash
   # token.exp should be > current time (seconds)
   node -e "console.log(new Date(require('jsonwebtoken').decode('eyJhbGc...').exp * 1000))"
   ```
4. Check JWT_SECRET matches:
   ```bash
   # Backend .env JWT_SECRET must match the secret used to sign
   echo $JWT_SECRET
   ```

### 4. Migration Failed

**Symptom**: `Error: Migration failed`

**Debug Steps**:
1. Check migration status:
   ```bash
   cd db && npx prisma migrate status
   ```
2. Reset (dev only!):
   ```bash
   cd db && npx prisma migrate reset --force
   ```
3. View migration:
   ```bash
   cat db/migrations/<name>/migration.sql
   ```
4. Check logs:
   ```bash
   docker logs <db-container>
   ```

### 5. Tests Failing Mysteriously

**Debug Steps**:
1. Run with verbose logging:
   ```bash
   npm run test -- --verbose
   ```
2. Run single test:
   ```bash
   npm run test -- --testNamePattern="specific test"
   ```
3. Run with watch:
   ```bash
   npm run test -- --watch
   ```
4. Check mocks:
   - Add `console.log` to see mock calls
   ```typescript
   jest.spyOn(service, 'method').mockResolvedValue(...);
   // Later check:
   expect(service.method).toHaveBeenCalledWith(...)
   ```

---

## Best Practices

| Practice | Why |
|----------|-----|
| **Use traceId in logs** | Correlate logs across services |
| **Log at right level** | Find issues faster (debug noise vs missing info) |
| **Include context in logs** | userId, resource, action → understand what happened |
| **Use breakpoints wisely** | Don't debug everything (log first, breakpoint if needed) |
| **Clean up after debugging** | Remove `console.log`, commented code |
| **Test the debug flow** | Ensure logs/breakpoints work before committing |

---

## References

- [Node.js Inspector](https://nodejs.org/en/docs/guides/nodejs-debugging-getting-started/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [VSCode Node Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [Vite HMR](https://vitejs.dev/guide/features.html#hot-module-replacement)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Prisma Studio](https://www.prisma.io/studio)
