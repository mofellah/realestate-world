/**
 * Correlation ID utilities for request tracing
 */

import { randomBytes } from "crypto";

/**
 * Generate a unique correlation ID (ULID-like format)
 * @returns Correlation ID string
 */
export function generateCorrelationId(): string {
  // Generate 16 random bytes and convert to hex (32 chars)
  const timestamp = Date.now().toString(36); // Base36 timestamp (8-10 chars)
  const random = randomBytes(8).toString("hex"); // 16 random hex chars
  return `${timestamp}-${random}`;
}

/**
 * Extract correlation ID from request header
 * @param headers - Request headers object
 * @param headerName - Name of the correlation ID header (default: 'x-correlation-id')
 * @returns Correlation ID if found, null otherwise
 */
export function extractCorrelationId(
  headers: Record<string, string | string[] | undefined>,
  headerName = "x-correlation-id",
): string | null {
  const value = headers[headerName] || headers[headerName.toLowerCase()];

  if (!value) return null;

  // Handle array values (multiple headers with same name)
  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value;
}

/**
 * Get or generate correlation ID from request headers
 * @param headers - Request headers object
 * @param headerName - Name of the correlation ID header (default: 'x-correlation-id')
 * @returns Correlation ID (existing or newly generated)
 */
export function getOrGenerateCorrelationId(
  headers: Record<string, string | string[] | undefined>,
  headerName = "x-correlation-id",
): string {
  return extractCorrelationId(headers, headerName) || generateCorrelationId();
}

/**
 * Middleware helper to attach correlation ID to request
 * Returns a function that can be used in Express/Fastify middleware
 * @param headerName - Name of the correlation ID header (default: 'x-correlation-id')
 */
export function correlationIdMiddleware(headerName = "x-correlation-id") {
  return (req: any, res: any, next: any) => {
    // Get or generate correlation ID
    const correlationId = getOrGenerateCorrelationId(req.headers, headerName);

    // Attach to request
    req.correlationId = correlationId;

    // Set response header
    res.setHeader(headerName, correlationId);

    next();
  };
}
