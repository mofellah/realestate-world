/**
 * Correlation ID Interceptor
 * Extracts or generates X-Trace-ID header and propagates it through request lifecycle
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "@boilerplate/logger";

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  private logger = new Logger("info", { service: "CorrelationIdInterceptor" });

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Extract or generate correlation ID
    const traceId = (request.headers["x-trace-id"] || uuidv4()) as string;
    request.correlationId = traceId;

    // Set response header for client
    response.header("X-Trace-ID", traceId);

    // Log request
    this.logger.setCorrelationId(traceId);
    this.logger.debug(`[${request.method}] ${request.url}`, {
      correlationId: traceId,
      method: request.method,
      url: request.url,
    });

    return next.handle();
  }
}
