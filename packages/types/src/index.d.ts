export type UserRoleEnum = "user" | "admin";
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
  role: UserRoleEnum;
  isActive: boolean;
  country_code: string | null;
  personId: string | null;
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
  token: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}
export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  correlationId?: string;
  iat?: number;
  exp?: number;
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
export interface UserWithRoles extends Omit<User, "passwordHash"> {
  name: string | null;
  roles: UserRoleEnum[];
  permissions: string[];
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse extends TokenPair {
  user: Omit<User, "password">;
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
//# sourceMappingURL=index.d.ts.map
