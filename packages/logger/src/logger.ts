/**
 * Winston-based logger with structured JSON output
 */

import winston from "winston";

/**
 * Log levels (from lowest to highest priority)
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Log metadata interface
 */
export interface LogMeta {
  correlationId?: string;
  userId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

/**
 * Create a Winston logger instance
 * @param level - Minimum log level to output
 * @param options - Additional logger options
 * @returns Winston logger instance
 */
export function createLogger(
  level: LogLevel = "info",
  options: {
    service?: string;
    filePath?: string;
    enableConsole?: boolean;
  } = {},
) {
  const { service = "app", filePath, enableConsole = true } = options;

  // Define log format
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  );

  // Console format with colors for development
  const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "HH:mm:ss" }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
      const traceId =
        correlationId && typeof correlationId === "string"
          ? `[${correlationId.substring(0, 8)}]`
          : "";
      return `${timestamp} ${level} ${traceId} ${message} ${metaStr}`;
    }),
  );

  // Configure transports
  const transports: winston.transport[] = [];

  // Console transport (for development)
  if (enableConsole) {
    transports.push(
      new winston.transports.Console({
        format: process.env.NODE_ENV === "production" ? logFormat : consoleFormat,
      }),
    );
  }

  // File transport (for production)
  if (filePath) {
    transports.push(
      new winston.transports.File({
        filename: filePath,
        format: logFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 7, // Keep 7 days
      }),
    );
  }

  // Create logger
  const logger = winston.createLogger({
    level,
    defaultMeta: { service },
    transports,
  });

  return logger;
}

/**
 * Logger class with correlation ID support
 */
export class Logger {
  private logger: winston.Logger;
  private defaultMeta: LogMeta;

  constructor(
    level: LogLevel = "info",
    options: {
      service?: string;
      filePath?: string;
      enableConsole?: boolean;
    } = {},
  ) {
    this.logger = createLogger(level, options);
    this.defaultMeta = {};
  }

  /**
   * Set default metadata for all log entries
   */
  setDefaultMeta(meta: LogMeta): void {
    this.defaultMeta = { ...this.defaultMeta, ...meta };
  }

  /**
   * Set correlation ID for request tracing
   */
  setCorrelationId(correlationId: string): void {
    this.defaultMeta.correlationId = correlationId;
  }

  /**
   * Clear correlation ID
   */
  clearCorrelationId(): void {
    delete this.defaultMeta.correlationId;
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: LogMeta): void {
    this.logger.debug(message, { ...this.defaultMeta, ...meta });
  }

  /**
   * Log info message
   */
  info(message: string, meta?: LogMeta): void {
    this.logger.info(message, { ...this.defaultMeta, ...meta });
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: LogMeta): void {
    this.logger.warn(message, { ...this.defaultMeta, ...meta });
  }

  /**
   * Log error message
   */
  error(message: string, meta?: LogMeta): void {
    this.logger.error(message, { ...this.defaultMeta, ...meta });
  }

  /**
   * Get underlying Winston logger
   */
  getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger((process.env.LOG_LEVEL as LogLevel) || "info", {
  service: process.env.SERVICE_NAME || "app",
  filePath: process.env.LOG_FILE_PATH,
  enableConsole: true,
});
