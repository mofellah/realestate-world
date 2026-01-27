/**
 * Mock Users Service
 * Provides mock implementations of user methods for testing
 */

import type { UserWithRoles } from '@boilerplate/types';

// Primary mock instance used by Jest when mocking '@/services/users-service'
export const usersService = {
  getCurrentUser: jest.fn(),
};

// Backwards-compatible alias for tests that import mockUsersService
export const mockUsersService = usersService;

export const mockUser: UserWithRoles = {
  id: 'user-123',
  email: 'admin@example.com',
  name: 'Test User',
  isActive: true,
  createdAt: new Date('2026-01-24'),
  updatedAt: new Date('2026-01-24'),
  roles: [
    {
      id: 'role-1',
      name: 'admin',
    },
  ],
  permissions: [],
};

export const mockUserWithMultipleRoles: UserWithRoles = {
  ...mockUser,
  roles: [
    {
      id: 'role-1',
      name: 'admin',
    },
    {
      id: 'role-2',
      name: 'moderator',
    },
  ],
};
