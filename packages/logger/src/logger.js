"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
exports.createLogger = createLogger;
const winston_1 = __importDefault(require("winston"));
function createLogger(level = 'info', options = {}) {
    const { service = 'app', filePath, enableConsole = true } = options;
    const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
    const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        const traceId = correlationId && typeof correlationId === 'string'
            ? `[${correlationId.substring(0, 8)}]`
            : '';
        return `${timestamp} ${level} ${traceId} ${message} ${metaStr}`;
    }));
    const transports = [];
    if (enableConsole) {
        transports.push(new winston_1.default.transports.Console({
            format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
        }));
    }
    if (filePath) {
        transports.push(new winston_1.default.transports.File({
            filename: filePath,
            format: logFormat,
            maxsize: 10 * 1024 * 1024,
            maxFiles: 7,
        }));
    }
    const logger = winston_1.default.createLogger({
        level,
        defaultMeta: { service },
        transports,
    });
    return logger;
}
class Logger {
    constructor(level = 'info', options = {}) {
        this.logger = createLogger(level, options);
        this.defaultMeta = {};
    }
    setDefaultMeta(meta) {
        this.defaultMeta = { ...this.defaultMeta, ...meta };
    }
    setCorrelationId(correlationId) {
        this.defaultMeta.correlationId = correlationId;
    }
    clearCorrelationId() {
        delete this.defaultMeta.correlationId;
    }
    debug(message, meta) {
        this.logger.debug(message, { ...this.defaultMeta, ...meta });
    }
    info(message, meta) {
        this.logger.info(message, { ...this.defaultMeta, ...meta });
    }
    warn(message, meta) {
        this.logger.warn(message, { ...this.defaultMeta, ...meta });
    }
    error(message, meta) {
        this.logger.error(message, { ...this.defaultMeta, ...meta });
    }
    getWinstonLogger() {
        return this.logger;
    }
}
exports.Logger = Logger;
exports.logger = new Logger(process.env.LOG_LEVEL || 'info', {
    service: process.env.SERVICE_NAME || 'app',
    filePath: process.env.LOG_FILE_PATH,
    enableConsole: true,
});
//# sourceMappingURL=logger.js.map