import winston from "winston";
export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LogMeta {
  correlationId?: string;
  userId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}
export declare function createLogger(
  level?: LogLevel,
  options?: {
    service?: string;
    filePath?: string;
    enableConsole?: boolean;
  },
): winston.Logger;
export declare class Logger {
  private logger;
  private defaultMeta;
  constructor(
    level?: LogLevel,
    options?: {
      service?: string;
      filePath?: string;
      enableConsole?: boolean;
    },
  );
  setDefaultMeta(meta: LogMeta): void;
  setCorrelationId(correlationId: string): void;
  clearCorrelationId(): void;
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
  getWinstonLogger(): winston.Logger;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map
