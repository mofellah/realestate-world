/**
 * Test fixtures seed: additional test data for complex testing
 * Optional; only runs if SEED_TEST_DATA=true or in test/CI environments
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@boilerplate/utils';

const prisma = new PrismaClient();

export async function seedTestFixtures() {
  console.log('🧪 Seeding test fixtures (additional users for testing)...');

  // Get role IDs for assignment
  const userRole = await prisma.role.findUnique({ where: { name: 'user' } });
  const moderatorRole = await prisma.role.findUnique({ where: { name: 'moderator' } });

  if (!userRole || !moderatorRole) {
    throw new Error('Cannot seed test fixtures: baseline roles not found. Run baseline seed first.');
  }

  // Create additional test users
  const testUsers = [
    { email: 'moderator@example.com', password: 'Moderator123!', name: 'Moderator User', role: moderatorRole },
    { email: 'testuser1@example.com', password: 'TestUser123!', name: 'Test User 1', role: userRole },
    { email: 'testuser2@example.com', password: 'TestUser123!', name: 'Test User 2', role: userRole },
  ];

  const createdUsers = [];
  for (const testUser of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: testUser.email },
      update: {},
      create: {
        email: testUser.email,
        password: await hashPassword(testUser.password),
        name: testUser.name,
        isActive: true,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: testUser.role.id } },
      update: {},
      create: { userId: user.id, roleId: testUser.role.id },
    });

    createdUsers.push(user);
    console.log(`✓ Created test user: ${testUser.email} with role ${testUser.role.name}`);
  }

  console.log(`\n✓ Created ${createdUsers.length} additional test users`);
  console.log('\nTest fixtures summary:');
  testUsers.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.role.name})`));
}
