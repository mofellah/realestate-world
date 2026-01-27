/**
 * Health Service
 * Handles health check API calls
 */

interface HealthResponse {
  status: string;
  timestamp: string;
}

// Support both Vite (import.meta.env) and Jest (process.env)
let API_URL = 'http://localhost:3000';
try {
  API_URL = import.meta.env.VITE_API_URL || API_URL;
} catch (e) {
  API_URL = process.env.VITE_API_URL || API_URL;
}

class HealthService {
  /**
   * Get health status of backend
   */
  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }
}

export const healthService = new HealthService();
