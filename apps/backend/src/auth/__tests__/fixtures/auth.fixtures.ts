/**
 * Auth Test Fixtures
 * Shared test data for auth module tests
 */

import { JwtPayload, LoginRequest, LoginResponse, TokenPair, RefreshToken } from '@boilerplate/types';

// Mock user with admin role
export const mockUserWithAdminRole = {
  id: 'user-123',
  email: 'admin@example.com',
  passwordHash: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DvDlFm', // hashed "Admin123!"
  avatarUrl: null,
  role: 'admin' as const,
  isActive: true,
  country_code: null,
  personId: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  name: 'Admin User',
};

// Mock user with regular user role
export const mockUserWithUserRole = {
  id: 'user-456',
  email: 'user@example.com',
  passwordHash: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DvDlFm', // hashed password
  avatarUrl: null,
  role: 'user' as const,
  isActive: true,
  country_code: null,
  personId: null,
  createdAt: new Date('2026-01-02'),
  updatedAt: new Date('2026-01-02'),
  name: 'Regular User',
};

// Extended mock user with admin role (includes relationship data for service tests)
// Note: This fixture includes relationship data not in the actual Prisma schema for testing purposes
export const mockUserWithAdminRoleExtended = {
  ...mockUserWithAdminRole,
  userRoles: [
    {
      userId: 'user-123',
      roleId: 'role-admin',
      role: {
        id: 'role-admin',
        name: 'admin',
        description: 'Administrator',
        rolePermissions: [
          {
            roleId: 'role-admin',
            permissionId: 'perm-1',
            permission: {
              id: 'perm-1',
              resource: 'users',
              action: 'read',
              description: 'Read users',
            },
          } as unknown,
          {
            roleId: 'role-admin',
            permissionId: 'perm-2',
            permission: {
              id: 'perm-2',
              resource: 'users',
              action: 'write',
              description: 'Write users',
            },
          } as unknown,
        ] as unknown,
      },
    },
  ],
} as unknown;

// Extended mock user with user role (includes relationship data for service tests)
// Note: This fixture includes relationship data not in the actual Prisma schema for testing purposes
export const mockUserWithUserRoleExtended = {
  ...mockUserWithUserRole,
  userRoles: [
    {
      userId: 'user-456',
      roleId: 'role-user',
      role: {
        id: 'role-user',
        name: 'user',
        description: 'Regular User',
        rolePermissions: [
          {
            roleId: 'role-user',
            permissionId: 'perm-1',
            permission: {
              id: 'perm-1',
              resource: 'posts',
              action: 'read',
              description: 'Read posts',
            },
          } as unknown,
        ] as unknown,
      },
    },
  ],
} as unknown;

// Mock JWT payload for admin
export const mockJwtPayloadAdmin: JwtPayload = {
  sub: 'user-123',
  email: 'admin@example.com',
  roles: ['admin'],
  permissions: ['users:read', 'users:write'],
  correlationId: 'trace-123',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 900,
};

// Mock JWT payload for regular user
export const mockJwtPayloadUser: JwtPayload = {
  sub: 'user-456',
  email: 'user@example.com',
  roles: ['user'],
  permissions: ['users:read'],
  correlationId: 'trace-456',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 900,
};

// Mock refresh token record
export const mockRefreshToken: RefreshToken & { user?: typeof mockUserWithAdminRole } = {
  id: 'token-123',
  userId: 'user-123',
  token: 'hashed-refresh-token-abc123',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  revokedAt: null,
  createdAt: new Date(),
};

// Mock revoked refresh token
export const mockRevokedRefreshToken: RefreshToken = {
  id: 'token-revoked',
  userId: 'user-123',
  token: 'hashed-refresh-token-revoked',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  revokedAt: new Date(),
  createdAt: new Date(),
};

// Mock expired refresh token
export const mockExpiredRefreshToken: RefreshToken = {
  id: 'token-expired',
  userId: 'user-123',
  token: 'hashed-refresh-token-expired',
  expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
  revokedAt: null,
  createdAt: new Date(),
};

// Mock login request
export const mockLoginRequest: LoginRequest = {
  email: 'admin@example.com',
  password: 'Admin123!',
};

// Mock login response
export const mockLoginResponse: LoginResponse = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJwZXJtaXNzaW9ucyI6WyJ1c2VyczpyZWFkIiwidXNlcnM6d3JpdGUiXSwiY29ycmVsYXRpb25JZCI6InRyYWNlLTEyMyIsImlhdCI6MTczMzY4MDAwMCwiZXhwIjoxNzMzNjgwOTAwfQ.test-signature',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJwZXJtaXNzaW9ucyI6WyJ1c2VyczpyZWFkIiwidXNlcnM6d3JpdGUiXSwiY29ycmVsYXRpb25JZCI6InRyYWNlLTEyMyIsImlhdCI6MTczMzY4MDAwMCwiZXhwIjoxNzM0Mjg0ODAwfQ.test-signature',
  expiresIn: 900,
  user: {
    id: 'user-123',
    email: 'admin@example.com',
    passwordHash: '$2a$10$mockHashedPasswordForTestingOnly',
    avatarUrl: null,
    role: 'admin' as const,
    isActive: true,
    country_code: null,
    personId: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
};

// Mock token pair
export const mockTokenPair: TokenPair = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJwZXJtaXNzaW9ucyI6WyJ1c2VyczpyZWFkIiwidXNlcnM6d3JpdGUiXSwiY29ycmVsYXRpb25JZCI6InRyYWNlLTEyMyIsImlhdCI6MTczMzY4MDAwMCwiZXhwIjoxNzMzNjgwOTAwfQ.test-signature',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJwZXJtaXNzaW9ucyI6WyJ1c2VyczpyZWFkIiwidXNlcnM6d3JpdGUiXSwiY29ycmVsYXRpb25JZCI6InRyYWNlLTEyMyIsImlhdCI6MTczMzY4MDAwMCwiZXhwIjoxNzM0Mjg0ODAwfQ.test-signature',
  expiresIn: 900,
};

/**
 * Helper function to create a custom mock user
 */
export const createMockUser = (overrides = {}): typeof mockUserWithAdminRole => ({
  ...mockUserWithAdminRole,
  ...overrides,
});

/**
 * Helper function to create a custom JWT payload
 */
export const createMockJwtPayload = (overrides = {}): JwtPayload => ({
  ...mockJwtPayloadAdmin,
  ...overrides,
});

/**
 * Helper function to create a custom refresh token
 */
export const createMockRefreshToken = (overrides = {}): RefreshToken => ({
  ...mockRefreshToken,
  ...overrides,
});

/**
 * Helper function to create a custom login response
 */
export const createMockLoginResponse = (overrides = {}): LoginResponse => ({
  ...mockLoginResponse,
  ...overrides,
});
