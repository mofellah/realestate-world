/**
 * API Client
 * Centralized HTTP client with interceptors for auth and error handling
 */

import { tokenStorage } from '@/utils/token-storage';
import { parseApiError } from '@/utils/api-error';

// Support both Vite (import.meta.env) and Jest (process.env)
let API_URL = 'http://localhost:3000';
try {
  API_URL = import.meta.env.VITE_API_URL || API_URL;
} catch (e) {
  API_URL = process.env.VITE_API_URL || API_URL;
}

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization header with access token
   */
  private getAuthHeader(): Record<string, string> {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Perform HTTP request with automatic auth header and error handling
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized (token expired)
      if (response.status === 401) {
        tokenStorage.clearTokens();
        window.location.href = '/login';
        throw new Error('Unauthorized: Please login again');
      }

      if (!response.ok) {
        const error = await parseApiError(response);
        throw new Error(error.message);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_URL);
