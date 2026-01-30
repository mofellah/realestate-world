/**
 * Test fixtures seed: additional test data for complex testing
 * Optional; only runs if SEED_TEST_DATA=true or in test/CI environments
 */

import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../../packages/utils/src/crypto';

const prisma = new PrismaClient();

export async function seedTestFixtures() {
  console.log('🧪 Seeding test fixtures (additional users for testing)...');

  // Create additional test users
  const testUsers = [
    { email: 'moderator@example.com', password: 'Moderator123!', name: 'Moderator User', role: UserRole.admin },
    { email: 'testuser1@example.com', password: 'TestUser123!', name: 'Test User 1', role: UserRole.user },
    { email: 'testuser2@example.com', password: 'TestUser123!', name: 'Test User 2', role: UserRole.user },
  ];

  const createdUsers = [];
  for (const testUser of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: testUser.email },
      update: {},
      create: {
        email: testUser.email,
        passwordHash: await hashPassword(testUser.password),
        name: testUser.name,
        role: testUser.role,
        isActive: true,
      },
    });

    createdUsers.push(user);
    console.log(`✓ Created test user: ${testUser.email} with role ${testUser.role}`);
  }

  console.log(`\n✓ Created ${createdUsers.length} additional test users`);
  console.log('\nTest fixtures summary:');
  testUsers.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.role})`));
}
