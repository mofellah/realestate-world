# Seed Data

This folder can be used to store JSON or other data files used during database seeding.

## Current Approach

The seed script ([db/seeds/seed.ts](../seed.ts)) currently has all seed data inline for simplicity and maintainability.

## Future Use Cases

This folder can be used for:

- **Large datasets**: When seed data becomes too large to maintain inline
- **Environment-specific data**: Different data files for dev/staging/production
- **External data imports**: JSON files exported from other systems
- **Test fixtures**: Shared test data used by multiple test suites

## Example Structure

```
data/
├── roles.json
├── permissions.json
├── users.dev.json
├── users.prod.json
└── sample-posts.json
```

## Usage Example

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const rolesData = JSON.parse(
  readFileSync(join(__dirname, 'data', 'roles.json'), 'utf-8')
);
```
