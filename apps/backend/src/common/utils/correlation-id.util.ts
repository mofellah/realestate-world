/**
 * Correlation ID Utilities
 * Provides request tracing across service layers
 */

import { Request } from 'express';
import crypto from 'crypto';

const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Get or generate correlation ID for a request
 * @param req Express request object
 * @returns Correlation ID (from header or newly generated)
 */
export function getOrGenerateCorrelationId(req?: Request): string {
  if (!req) {
    // If no request context, generate new ID
    return crypto.randomUUID();
  }

  const existingId = req.headers[CORRELATION_ID_HEADER] as string;
  if (existingId) {
    return existingId;
  }

  // Generate new correlation ID and attach to request for propagation
  const newId = crypto.randomUUID();
  (req as any)[CORRELATION_ID_HEADER] = newId;
  return newId;
}

/**
 * Get correlation ID from request (or None if not present)
 * @param req Express request object
 * @returns Correlation ID or undefined
 */
export function getCorrelationId(req?: Request): string | undefined {
  if (!req) return undefined;
  return (req.headers[CORRELATION_ID_HEADER] as string) || (req as any)[CORRELATION_ID_HEADER];
}
