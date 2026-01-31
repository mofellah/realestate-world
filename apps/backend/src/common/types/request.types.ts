/**
 * Request Type Definitions
 * Extended request types for type-safe access to custom properties
 */

import { FastifyRequest } from "fastify";

/**
 * Request with correlation ID
 * Added by CorrelationIdInterceptor
 */
export interface RequestWithCorrelation extends FastifyRequest {
  correlationId: string;
}
