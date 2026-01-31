/**
 * Shared TypeScript types for the monorepo
 * Mirrors Prisma schema and defines API contracts
 */

// ============================================================================
// Database Models (aligned with Prisma schema from db/schema.prisma)
// ============================================================================

export type UserRoleEnum = "user" | "admin";

export interface User {
  id: string;
  email: string;
  passwordHash: string; // bcrypt hash
  avatarUrl: string | null;
  name: string | null;
  role: UserRoleEnum; // Single role enum
  isActive: boolean;
  country_code: string | null;
  personId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy types (kept for compatibility, but not used in current schema)
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

export interface UserWithRoles extends Omit<User, "passwordHash"> {
  name: string | null; // Name from Person table (for convenience)
  roles: UserRoleEnum[]; // Array for compatibility (single role for now)
  permissions: string[]; // Permissions (empty for now, future RBAC)
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
  user: Omit<User, "passwordHash">;
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
  user: Omit<User, "password">;
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
  user: Omit<User, "password">;
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

// Property types
export interface Property {
  id: string;
  title: string;
  description: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  price: number | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  yearBuilt: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePropertyDto {
  title: string;
  description?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  price?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  imageUrl?: string;
}

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  price?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  imageUrl?: string;
  isAvailable?: boolean;
}
