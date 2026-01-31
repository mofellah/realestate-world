/**
 * API Error Utility
 * Normalize API errors for consistent handling
 */

export interface ApiErrorDetail {
  code: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Parse error from API response
 * @param response - Fetch response or error object
 * @returns Normalized error detail
 */
export async function parseApiError(response: Response | unknown): Promise<ApiErrorDetail> {
  if (response instanceof Response) {
    try {
      const data = await response.json();

      // Handle standardized error format
      if (data.error) {
        return {
          code: data.error.code || "UNKNOWN_ERROR",
          message: data.error.message || response.statusText || "An error occurred",
          statusCode: response.status,
          details: data.error.details,
        };
      }

      // Fallback for non-standard response
      return {
        code: "HTTP_ERROR",
        message: data.message || response.statusText || "An error occurred",
        statusCode: response.status,
        details: data,
      };
    } catch {
      // Failed to parse JSON
      return {
        code: "HTTP_ERROR",
        message: response.statusText || "An error occurred",
        statusCode: response.status,
      };
    }
  }

  // Handle unknown error type
  if (response instanceof Error) {
    return {
      code: "NETWORK_ERROR",
      message: response.message || "Network request failed",
      statusCode: 0,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
    statusCode: 0,
  };
}

/**
 * Get user-friendly error message
 * @param error - Error detail
 * @returns Human-readable message
 */
export function getErrorMessage(error: ApiErrorDetail | unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const errorObj = error as { message: unknown };
    return typeof errorObj.message === "string" ? errorObj.message : "An unexpected error occurred";
  }

  return "An unexpected error occurred";
}
