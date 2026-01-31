/**
 * Correlation ID Middleware
 * Automatically generates and attaches correlation IDs to all requests
 * Enables distributed tracing across services
 */

import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { getOrGenerateCorrelationId } from "../utils/correlation-id.util";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = getOrGenerateCorrelationId(req);

    // Attach to request for use in services
    (req as any).correlationId = correlationId;

    // Add to response headers so client can use for debugging/support
    res.setHeader("X-Correlation-Id", correlationId);

    next();
  }
}
