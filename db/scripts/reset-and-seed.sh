#!/bin/bash
# Reset Database and Seed with Real OSM Data
# This script resets the database and seeds with:
# - Baseline users
# - Real OSM boundaries (Brussels region)
# - Real OSM amenities
# - Sample properties with proper coordinates

set -e

echo "🗑️  Resetting database..."
cd /app/db

# Reset the database
npx prisma migrate reset --force --skip-seed

echo ""
echo "🌱 Running baseline seed..."
npx tsx seeds/baseline.ts

echo ""
echo "📍 Importing OSM boundaries..."
npx tsx scripts/import-osm-boundaries.ts

echo ""
echo "🏫 Importing OSM amenities..."
npx tsx scripts/import-osm-amenities.ts

echo ""
echo "🏠 Seeding properties with coordinates..."
npx tsx seeds/real-estate.ts

echo ""
echo "✅ Database reset and seeded successfully!"
