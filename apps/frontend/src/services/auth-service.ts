/**
 * Auth Service
 * Handles authentication API calls (login, register, refresh, logout)
 */

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshRequest,
  RefreshResponse,
} from "@boilerplate/types";
import { apiClient } from "@/services/api-client";
import { tokenStorage } from "@/utils/token-storage";

class AuthService {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const loginRequest: LoginRequest = { email, password };
    const response = await apiClient.post<LoginResponse>("/auth/login", loginRequest);

    // Store tokens
    tokenStorage.setAccessToken(response.accessToken);
    tokenStorage.setRefreshToken(response.refreshToken);

    return response;
  }

  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/register", request);
    tokenStorage.setAccessToken(response.accessToken);
    tokenStorage.setRefreshToken(response.refreshToken);

    return response;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const refreshRequest: RefreshRequest = { refreshToken };
    const response = await apiClient.post<RefreshResponse>("/auth/refresh", refreshRequest);

    // Update tokens
    tokenStorage.setAccessToken(response.accessToken);
    tokenStorage.setRefreshToken(response.refreshToken);

    return response.accessToken;
  }

  /**
   * Logout user and revoke tokens
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout", {});
    } catch (error) {
      // Silently handle logout API failures - clear tokens anyway
    } finally {
      tokenStorage.clearTokens();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenStorage.hasAccessToken();
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return tokenStorage.getRefreshToken();
  }
}

export const authService = new AuthService();
