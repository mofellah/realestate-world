/**
 * Baseline seed: roles, permissions, admin user, test user
 * Always runs; contains minimum required data for all deployments
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@boilerplate/utils';

const prisma = new PrismaClient();

export async function seedBaseline() {
  console.log('🌱 Seeding baseline data (roles, permissions, users)...');

  // ============================================================================
  // 1. Create Roles
  // ============================================================================
  console.log('Creating roles...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Full access to all resources',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Basic user access',
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: 'Content management and moderation',
    },
  });

  console.log('✓ Created 3 roles: admin, user, moderator');

  // ============================================================================
  // 2. Create Permissions
  // ============================================================================
  console.log('Creating permissions...');

  const permissionsData = [
    // User permissions
    { resource: 'users', action: 'create', description: 'Create new users' },
    { resource: 'users', action: 'read', description: 'View user information' },
    { resource: 'users', action: 'update', description: 'Update user information' },
    { resource: 'users', action: 'delete', description: 'Delete users' },

    // Post permissions
    { resource: 'posts', action: 'create', description: 'Create new posts' },
    { resource: 'posts', action: 'read', description: 'View posts' },
    { resource: 'posts', action: 'update', description: 'Update posts' },
    { resource: 'posts', action: 'delete', description: 'Delete posts' },

    // Comment permissions
    { resource: 'comments', action: 'create', description: 'Create comments' },
    { resource: 'comments', action: 'read', description: 'View comments' },
    { resource: 'comments', action: 'update', description: 'Update comments' },
    { resource: 'comments', action: 'delete', description: 'Delete comments' },

    // Role permissions (admin only)
    { resource: 'roles', action: 'create', description: 'Create new roles' },
    { resource: 'roles', action: 'read', description: 'View roles' },
    { resource: 'roles', action: 'update', description: 'Update roles' },
    { resource: 'roles', action: 'delete', description: 'Delete roles' },

    // Permission management (admin only)
    { resource: 'permissions', action: 'create', description: 'Create permissions' },
    { resource: 'permissions', action: 'read', description: 'View permissions' },
    { resource: 'permissions', action: 'update', description: 'Update permissions' },
    { resource: 'permissions', action: 'delete', description: 'Delete permissions' },
  ];

  const permissions = await Promise.all(
    permissionsData.map((perm) =>
      prisma.permission.upsert({
        where: { resource_action: { resource: perm.resource, action: perm.action } },
        update: {},
        create: perm,
      })
    )
  );

  console.log(`✓ Created ${permissions.length} permissions`);

  // ============================================================================
  // 3. Assign Permissions to Roles
  // ============================================================================
  console.log('Assigning permissions to roles...');

  // Admin role: ALL permissions
  const adminPermissions = permissions.map((perm) => ({
    roleId: adminRole.id,
    permissionId: perm.id,
  }));

  // User role: basic read/write for posts and comments
  const userPermissions = permissions
    .filter((perm) =>
      ['posts:read', 'posts:create', 'comments:read', 'comments:create'].includes(
        `${perm.resource}:${perm.action}`
      )
    )
    .map((perm) => ({
      roleId: userRole.id,
      permissionId: perm.id,
    }));

  // Moderator role: read all, write/delete posts and comments, read users
  const moderatorPermissions = permissions
    .filter((perm) => {
      return (
        // Read everything
        perm.action === 'read' ||
        // Write/delete posts and comments
        (perm.resource === 'posts' && ['create', 'update', 'delete'].includes(perm.action)) ||
        (perm.resource === 'comments' && ['create', 'update', 'delete'].includes(perm.action))
      );
    })
    .map((perm) => ({
      roleId: moderatorRole.id,
      permissionId: perm.id,
    }));

  // Use upsert to avoid duplicates on re-runs
  await Promise.all([
    ...adminPermissions.map((rp) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: rp },
        update: {},
        create: rp,
      })
    ),
    ...userPermissions.map((rp) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: rp },
        update: {},
        create: rp,
      })
    ),
    ...moderatorPermissions.map((rp) =>
      prisma.rolePermission.upsert({
        where: { roleId_permissionId: rp },
        update: {},
        create: rp,
      })
    ),
  ]);

  console.log('✓ Assigned permissions to roles');
  console.log(`  - admin: ${adminPermissions.length} permissions`);
  console.log(`  - user: ${userPermissions.length} permissions`);
  console.log(`  - moderator: ${moderatorPermissions.length} permissions`);

  // ============================================================================
  // 4. Create Test Users
  // ============================================================================
  console.log('Creating test users...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: await hashPassword('Admin123!'),
      name: 'Admin User',
      isActive: true,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: await hashPassword('User123!'),
      name: 'Regular User',
      isActive: true,
    },
  });

  console.log('✓ Created 2 test users');

  // ============================================================================
  // 5. Assign Roles to Users
  // ============================================================================
  console.log('Assigning roles to users...');

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: regularUser.id, roleId: userRole.id } },
    update: {},
    create: { userId: regularUser.id, roleId: userRole.id },
  });

  console.log('✓ Assigned roles to users');

  return { adminUser, regularUser, adminRole, userRole, moderatorRole };
}
