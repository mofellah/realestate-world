/**
 * Auth Response Entity (DTO)
 * API response shapes for auth endpoints
 */

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string | null;
    isActive: boolean;
  };
}

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
