/**
 * Database seed orchestrator
 * Runs baseline seed always; optionally runs test fixtures if SEED_TEST_DATA=true
 */

import { PrismaClient } from '@prisma/client';
import { seedBaseline } from './baseline';
import { seedTestFixtures } from './fixtures';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...\n');

  try {
    // Always run baseline
    await seedBaseline();

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
    console.log('\nBaseline credentials:');
    console.log('  Admin: admin@example.com / Admin123!');
    console.log('  User: user@example.com / User123!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

