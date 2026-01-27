/**
 * Shared TypeScript types for the monorepo
 * Mirrors Prisma schema and defines API contracts
 */

// ============================================================================
// Database Models (mirror Prisma schema from db/schema.prisma)
// ============================================================================

export interface User {
  id: string;
  email: string;
  password: string; // bcrypt hash
  name: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface UserRole {
  userId: string;
  roleId: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string; // JWT token hash
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

// ============================================================================
// Auth Types
// ============================================================================

export interface JwtPayload {
  sub: string; // userId
  email: string;
  roles: string[]; // role names
  permissions: string[]; // "resource:action" format
  correlationId?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until access token expires
}

export interface UserWithRoles extends Omit<User, 'password'> {
  roles: Role[];
  permissions: Permission[];
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// Auth endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends TokenPair {
  user: Omit<User, 'password'>;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse extends TokenPair {}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirmation: string;
  name?: string;
}

export interface RegisterResponse extends TokenPair {
  user: Omit<User, 'password'>;
}

// User endpoints
export interface GetUserResponse {
  user: UserWithRoles;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UpdateUserResponse {
  user: Omit<User, 'password'>;
}

// Generic API response wrappers
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  statusCode: number;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Pagination types
export interface PaginationParams {
  skip?: number;
  take?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
}
