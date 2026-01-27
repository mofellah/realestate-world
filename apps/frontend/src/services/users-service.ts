/**
 * Users Service
 * Handles user-related API calls (get current user, etc.)
 */

import type { UserWithRoles } from '@boilerplate/types';
import { apiClient } from '@/services/api-client';

interface GetUserResponse {
  user: UserWithRoles;
}

class UsersService {
  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<UserWithRoles> {
    const response = await apiClient.get<GetUserResponse>('/users/me');
    return response.user;
  }
}

export const usersService = new UsersService();
