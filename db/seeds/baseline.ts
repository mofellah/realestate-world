/**
 * Baseline seed: core users
 * Always runs; contains minimum required data for all deployments
 */

import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../../packages/utils/src/crypto';

const prisma = new PrismaClient();

export async function seedBaseline() {
  console.log('🌱 Seeding baseline users...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: await hashPassword('Admin123!'),
      name: 'Admin User',
      role: UserRole.admin,
      isActive: true,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      passwordHash: await hashPassword('User123!'),
      name: 'Test User',
      role: UserRole.user,
      isActive: true,
    },
  });

  console.log('✓ Created 2 users (admin, user)');

  return { adminUser, regularUser };
}
