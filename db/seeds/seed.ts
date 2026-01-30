/**
 * Database seed orchestrator
 * Runs baseline seed always, real estate data, and optionally test fixtures
 */

import { PrismaClient } from '@prisma/client';
import { seedBaseline } from './baseline';
import { seedRealEstate } from './real-estate';
import { seedTestFixtures } from './fixtures';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...\n');

  try {
    // Always run baseline (roles, permissions, users)
    await seedBaseline();

    // Always run real estate data (properties, listings)
    await seedRealEstate();

    // Conditionally run test fixtures
    const seedTestData = process.env.SEED_TEST_DATA === 'true';
    if (seedTestData) {
      await seedTestFixtures();
    } else {
      console.log('\n💡 To seed test fixtures, run: SEED_TEST_DATA=true npm run seed');
    }

    // ============================================================================
    // Summary
    // ============================================================================
    console.log('\n🎉 Database seeding complete!');
    console.log('\nTest credentials:');
    console.log('  Admin: admin@example.com / Admin123!');
    console.log('  User: user@example.com / User123!');
    console.log('\nSeeded data:');
    console.log('  • 2 Users, roles & permissions');
    console.log('  • 3 Properties with addresses');
    console.log('  • 3 Listings (ready to browse)');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

