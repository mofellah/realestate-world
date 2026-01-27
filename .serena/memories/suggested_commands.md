## Core Commands (to be wired; some scripts currently placeholders)
- Install deps: `npm install`
- Dev stack: `docker compose -f ops/compose/docker-compose.dev.yml up`
- Prisma studio: `cd db && npx prisma studio` (port 5555)
- Migrations: `cd db && npx prisma migrate dev --name <desc>`
- Lint: `npm run lint` (root script currently placeholder)
- Tests: `npm run test` (Jest), `npm run test:coverage`, `npm run e2e` (Cypress) — scripts to be implemented
- Format check: `npm run format:check`; format: `npm run format`
- Type check: `npm run type-check`

## Entrypoints (expected)
- Frontend dev: `npm run dev --workspace apps/frontend` (once configured via Vite script)
- Backend dev: `npm run start:dev --workspace apps/backend` (once configured via Nest script)

## Debug
- Backend inspector: open chrome://inspect (port 9229 from docker-compose.dev)
- Frontend: Vite HMR + browser DevTools, React DevTools extension

## Environment
- Copy `.env.example` to `.env`; fill secrets. Compose env template at ops/compose/.env.example.

## Notes
- package.json scripts are currently placeholders; implement per CI_CD.md/ARCHITECTURE.md when wiring tasks.
