/**
 * API Client
 * Centralized HTTP client with interceptors for auth and error handling
 */

import { tokenStorage } from '@/utils/token-storage';
import { parseApiError } from '@/utils/api-error';

// Always use /api proxy in browser (Vite dev server or nginx in production)
// Only use full URL if we're in Jest/Node tests
const isNode = typeof window === 'undefined';
const API_URL = isNode ? (process.env.VITE_API_URL || 'http://localhost:3000') : '/api';

// Log API configuration for debugging
console.log('[API Client] Config:', {
  isNode,
  API_URL,
  env: process.env.NODE_ENV || 'N/A',
});

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

    console.log(`[API Request] ${options.method || 'GET'} ${url}`);

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
