/**
 * Global Error Filter
 * Catches all exceptions and formats them as standard API responses
 */

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { FastifyReply } from "fastify";
import { Logger } from "@boilerplate/logger";

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  private logger = new Logger("info", { service: "GlobalErrorFilter" });

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const correlationId = (request as any).correlationId || "unknown";
    this.logger.setCorrelationId(correlationId);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorCode = "INTERNAL_SERVER_ERROR";
    let message = "An unexpected error occurred";
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseObj = exception.getResponse();

      if (typeof responseObj === "object") {
        const response = responseObj as any;
        message = response.message || exception.message;
        errorCode = response.error || exception.name;
        details = response;
      } else {
        message = responseObj as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled exception: ${exception.message}`, {
        stack: exception.stack,
        correlationId,
      });
    }

    this.logger.warn(`[${request.method}] ${request.url}`, {
      statusCode: status,
      error: errorCode,
      message,
      correlationId,
    });

    reply.status(status).send({
      success: false,
      statusCode: status,
      error: {
        code: errorCode,
        message,
        ...(details && typeof details === "object" ? { details } : {}),
      },
    });
  }
}
