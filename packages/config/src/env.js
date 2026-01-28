"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isDevelopment = exports.isProduction = exports.backendConfig = void 0;
exports.validateBackendEnv = validateBackendEnv;
exports.validateFrontendEnv = validateFrontendEnv;
const zod_1 = require("zod");
const backendEnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('3001').transform(Number),
    HOST: zod_1.z.string().default('0.0.0.0'),
    DATABASE_URL: zod_1.z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
    JWT_ACCESS_EXPIRY: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRY: zod_1.z.string().default('7d'),
    FRONTEND_URL: zod_1.z.string().url('FRONTEND_URL must be a valid URL'),
    ALLOWED_ORIGINS: zod_1.z
        .string()
        .default('')
        .transform((val) => (val ? val.split(',').map((url) => url.trim()) : [])),
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    LOG_FILE_PATH: zod_1.z.string().optional(),
    REDIS_URL: zod_1.z.string().url().optional(),
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.string().transform(Number).optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
});
const frontendEnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    VITE_API_URL: zod_1.z.string().url('VITE_API_URL must be a valid URL'),
    VITE_API_TIMEOUT: zod_1.z.string().default('30000').transform(Number),
    VITE_ENABLE_ANALYTICS: zod_1.z
        .string()
        .default('false')
        .transform((val) => val === 'true'),
    VITE_ENABLE_DEBUG: zod_1.z
        .string()
        .default('false')
        .transform((val) => val === 'true'),
});
function validateBackendEnv(env = process.env) {
    try {
        return backendEnvSchema.parse(env);
    }
    catch (error) {
        console.error('❌ Invalid backend environment variables:');
        if (error instanceof zod_1.z.ZodError) {
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
        }
        throw new Error('Environment validation failed. Check .env file.');
    }
}
function validateFrontendEnv(env = process.env) {
    try {
        return frontendEnvSchema.parse(env);
    }
    catch (error) {
        console.error('❌ Invalid frontend environment variables:');
        if (error instanceof zod_1.z.ZodError) {
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
        }
        throw new Error('Environment validation failed. Check .env file.');
    }
}
exports.backendConfig = validateBackendEnv();
exports.isProduction = exports.backendConfig.NODE_ENV === 'production';
exports.isDevelopment = exports.backendConfig.NODE_ENV === 'development';
exports.isTest = exports.backendConfig.NODE_ENV === 'test';
//# sourceMappingURL=env.js.map