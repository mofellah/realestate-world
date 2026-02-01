/**
 * Users Service
 * Handles user-related API calls (get current user, etc.)
 */

import type { UserWithRoles } from "@boilerplate/types";
import { apiClient } from "@/services/api-client";

interface GetUserResponse {
  user: UserWithRoles;
}

interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  bio?: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

class UsersService {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserWithRoles> {
    const response = await apiClient.get<GetUserResponse>("/users/me");
    return response.user;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfilePayload): Promise<UserWithRoles> {
    const response = await apiClient.patch<GetUserResponse>("/users/me", data);
    return response.user;
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordPayload): Promise<void> {
    await apiClient.post("/users/me/change-password", data);
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ url: string }>("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.url;
  }
}

export const usersService = new UsersService();
