# Seed Data

This folder is reserved for external data files (JSON, CSV, etc.) used during database seeding.

## Current Approach

All seed data is defined in TypeScript seed files for type safety and maintainability:
- `baseline.ts` - Core users, roles, permissions
- `real-estate.ts` - Properties, listings, addresses
- `fixtures.ts` - Optional test data (enabled via SEED_TEST_DATA=true)

## Usage

Main seed orchestrator: `db/seeds/seed.ts`

```bash
# Standard seed (baseline + real estate)
npm run seed

# Include test fixtures
SEED_TEST_DATA=true npm run seed
```

## Future Use Cases

This folder can be used for:
- **Large datasets**: External JSON/CSV files for bulk imports
- **Environment-specific data**: Different data files for dev/staging/production
- **External imports**: Data exported from other systems
- **Static reference data**: Countries, currencies, categories

## Example Structure

```
data/
 countries.json
 property-categories.json
 sample-images.csv
 bulk-properties.json
```

## Example Usage

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const countries = JSON.parse(
  readFileSync(join(__dirname, 'data', 'countries.json'), 'utf-8')
);
```
