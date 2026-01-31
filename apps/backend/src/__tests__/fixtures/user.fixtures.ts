/**
 * User Test Fixtures
 * 
 * Provides factory functions to create mock user data for tests.
 * All fixtures return properly typed objects matching the Prisma schema.
 */

import { Prisma } from '@prisma/client';

type User = Prisma.UserGetPayload<{}>;

/**
 * Create a basic mock user with defaults
 * @param overrides - Optional field overrides
 * @returns User entity with default test values
 */
export function createMockUser(overrides?: Partial<User>): User {
  const now = new Date();
  return {
    id: 'user-' + Math.random().toString(36).substring(7),
    email: 'user@test.com',
    passwordHash: 'hashed-password-123',
    avatarUrl: null,
    name: null,
    role: 'user',
    isActive: true,
    country_code: null,
    personId: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create a mock admin user
 * @param overrides - Optional field overrides
 * @returns User entity with admin role
 */
export function createMockAdmin(overrides?: Partial<User>): User {
  return createMockUser({
    email: 'admin@test.com',
    role: 'admin',
    ...overrides,
  });
}

/**
 * Create a mock user with a specific email
 * @param email - User email
 * @param overrides - Optional field overrides
 * @returns User entity with specified email
 */
export function createMockUserWithEmail(email: string, overrides?: Partial<User>): User {
  return createMockUser({
    email,
    ...overrides,
  });
}

/**
 * Create a mock active user (convenience)
 * @param overrides - Optional field overrides
 * @returns Active user entity
 */
export function createMockActiveUser(overrides?: Partial<User>): User {
  return createMockUser({
    isActive: true,
    ...overrides,
  });
}

/**
 * Create a mock inactive user
 * @param overrides - Optional field overrides
 * @returns Inactive user entity
 */
export function createMockInactiveUser(overrides?: Partial<User>): User {
  return createMockUser({
    isActive: false,
    ...overrides,
  });
}

/**
 * Create multiple mock users for batch operations
 * @param count - Number of users to create
 * @param overrides - Optional field overrides applied to all
 * @returns Array of user entities
 */
export function createMockUsers(count: number, overrides?: Partial<User>): User[] {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: `user-${i + 1}`,
      email: `user${i + 1}@test.com`,
      ...overrides,
    }),
  );
}