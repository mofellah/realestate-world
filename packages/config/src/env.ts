/**
 * Environment variable validation using Zod
 * Validates and provides type-safe access to configuration
 */

import { z } from "zod";

/**
 * Schema for backend environment variables
 */
const backendEnvSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Server configuration
  PORT: z.string().default("3001").transform(Number),
  HOST: z.string().default("0.0.0.0"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),

  // JWT configuration
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters for security"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  // CORS
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),
  ALLOWED_ORIGINS: z
    .string()
    .default("")
    .transform((val) => (val ? val.split(",").map((url) => url.trim()) : [])),

  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  LOG_FILE_PATH: z.string().optional(),

  // Redis (optional - for future use)
  REDIS_URL: z.string().url().optional(),

  // Email (optional - for future use)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

/**
 * Schema for frontend environment variables
 */
const frontendEnvSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // API configuration
  VITE_API_URL: z.string().url("VITE_API_URL must be a valid URL"),
  VITE_API_TIMEOUT: z.string().default("30000").transform(Number),

  // Feature flags (optional)
  VITE_ENABLE_ANALYTICS: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  VITE_ENABLE_DEBUG: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
});

/**
 * Validate environment variables for backend
 * @param env - Environment variables object (defaults to process.env)
 * @returns Validated and typed configuration object
 * @throws ZodError if validation fails
 */
export function validateBackendEnv(env: NodeJS.ProcessEnv = process.env) {
  try {
    return backendEnvSchema.parse(env);
  } catch (error) {
    console.error("❌ Invalid backend environment variables:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Environment validation failed. Check .env file.");
  }
}

/**
 * Validate environment variables for frontend
 * @param env - Environment variables object (defaults to process.env)
 * @returns Validated and typed configuration object
 * @throws ZodError if validation fails
 */
export function validateFrontendEnv(env: NodeJS.ProcessEnv = process.env) {
  try {
    return frontendEnvSchema.parse(env);
  } catch (error) {
    console.error("❌ Invalid frontend environment variables:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    throw new Error("Environment validation failed. Check .env file.");
  }
}

/**
 * Type-safe backend configuration
 */
export type BackendConfig = z.infer<typeof backendEnvSchema>;

/**
 * Type-safe frontend configuration
 */
export type FrontendConfig = z.infer<typeof frontendEnvSchema>;

/**
 * Pre-validated backend configuration (singleton)
 * Use this in backend applications
 */
export const backendConfig = validateBackendEnv();

/**
 * Helper to check if running in production
 */
export const isProduction = backendConfig.NODE_ENV === "production";

/**
 * Helper to check if running in development
 */
export const isDevelopment = backendConfig.NODE_ENV === "development";

/**
 * Helper to check if running in test
 */
export const isTest = backendConfig.NODE_ENV === "test";
