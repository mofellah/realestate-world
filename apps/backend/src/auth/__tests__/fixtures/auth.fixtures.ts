/**
 * Auth Test Fixtures
 * Shared test data for auth module tests
 */

import { JwtPayload, LoginRequest, LoginResponse, TokenPair, RefreshToken } from '@boilerplate/types';

// Mock user with admin role
export const mockUserWithAdminRole = {
  id: 'user-123',
  email: 'admin@example.com',
  password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DvDlFm', // hashed "Admin123!"
  name: 'Admin User',
  isActive: true,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  userRoles: [
    {
      userId: 'user-123',
      roleId: 'role-admin',
      role: {
        id: 'role-admin',
        name: 'admin',
        description: 'Administrator role',
        rolePermissions: [
          {
            roleId: 'role-admin',
            permissionId: 'perm-users-read',
            permission: {
              id: 'perm-users-read',
              resource: 'users',
              action: 'read',
              description: 'Read users',
            },
          },
          {
            roleId: 'role-admin',
            permissionId: 'perm-users-write',
            permission: {
              id: 'perm-users-write',
              resource: 'users',
              action: 'write',
              description: 'Write users',
            },
          },
        ],
      },
    },
  ],
};

// Mock user with regular user role
export const mockUserWithUserRole = {
  id: 'user-456',
  email: 'user@example.com',
  password: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DvDlFm', // hashed password
  name: 'Regular User',
  isActive: true,
  createdAt: new Date('2026-01-02'),
  updatedAt: new Date('2026-01-02'),
  userRoles: [
    {
      userId: 'user-456',
      roleId: 'role-user',
      role: {
        id: 'role-user',
        name: 'user',
        description: 'Regular user role',
        rolePermissions: [
          {
            roleId: 'role-user',
            permissionId: 'perm-users-read',
            permission: {
              id: 'perm-users-read',
              resource: 'users',
              action: 'read',
              description: 'Read users',
            },
          },
        ],
      },
    },
  ],
};

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
    name: 'Admin User',
    isActive: true,
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
