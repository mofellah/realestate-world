import { z } from "zod";
declare const backendEnvSchema: z.ZodObject<
  {
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodEffects<z.ZodDefault<z.ZodString>, number, string | undefined>;
    HOST: z.ZodDefault<z.ZodString>;
    DATABASE_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    JWT_ACCESS_EXPIRY: z.ZodDefault<z.ZodString>;
    JWT_REFRESH_EXPIRY: z.ZodDefault<z.ZodString>;
    FRONTEND_URL: z.ZodString;
    ALLOWED_ORIGINS: z.ZodEffects<z.ZodDefault<z.ZodString>, string[], string | undefined>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    LOG_FILE_PATH: z.ZodOptional<z.ZodString>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
    SMTP_HOST: z.ZodOptional<z.ZodString>;
    SMTP_PORT: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
    SMTP_USER: z.ZodOptional<z.ZodString>;
    SMTP_PASS: z.ZodOptional<z.ZodString>;
  },
  "strip",
  z.ZodTypeAny,
  {
    NODE_ENV: "production" | "development" | "test";
    LOG_LEVEL: "debug" | "info" | "warn" | "error";
    PORT: number;
    HOST: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_ACCESS_EXPIRY: string;
    JWT_REFRESH_EXPIRY: string;
    FRONTEND_URL: string;
    ALLOWED_ORIGINS: string[];
    LOG_FILE_PATH?: string | undefined;
    REDIS_URL?: string | undefined;
    SMTP_HOST?: string | undefined;
    SMTP_PORT?: number | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASS?: string | undefined;
  },
  {
    DATABASE_URL: string;
    JWT_SECRET: string;
    FRONTEND_URL: string;
    NODE_ENV?: "production" | "development" | "test" | undefined;
    LOG_LEVEL?: "debug" | "info" | "warn" | "error" | undefined;
    LOG_FILE_PATH?: string | undefined;
    PORT?: string | undefined;
    HOST?: string | undefined;
    JWT_ACCESS_EXPIRY?: string | undefined;
    JWT_REFRESH_EXPIRY?: string | undefined;
    ALLOWED_ORIGINS?: string | undefined;
    REDIS_URL?: string | undefined;
    SMTP_HOST?: string | undefined;
    SMTP_PORT?: string | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASS?: string | undefined;
  }
>;
declare const frontendEnvSchema: z.ZodObject<
  {
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    VITE_API_URL: z.ZodString;
    VITE_API_TIMEOUT: z.ZodEffects<z.ZodDefault<z.ZodString>, number, string | undefined>;
    VITE_ENABLE_ANALYTICS: z.ZodEffects<z.ZodDefault<z.ZodString>, boolean, string | undefined>;
    VITE_ENABLE_DEBUG: z.ZodEffects<z.ZodDefault<z.ZodString>, boolean, string | undefined>;
  },
  "strip",
  z.ZodTypeAny,
  {
    NODE_ENV: "production" | "development" | "test";
    VITE_API_URL: string;
    VITE_API_TIMEOUT: number;
    VITE_ENABLE_ANALYTICS: boolean;
    VITE_ENABLE_DEBUG: boolean;
  },
  {
    VITE_API_URL: string;
    NODE_ENV?: "production" | "development" | "test" | undefined;
    VITE_API_TIMEOUT?: string | undefined;
    VITE_ENABLE_ANALYTICS?: string | undefined;
    VITE_ENABLE_DEBUG?: string | undefined;
  }
>;
export declare function validateBackendEnv(env?: NodeJS.ProcessEnv): {
  NODE_ENV: "production" | "development" | "test";
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];
  LOG_FILE_PATH?: string | undefined;
  REDIS_URL?: string | undefined;
  SMTP_HOST?: string | undefined;
  SMTP_PORT?: number | undefined;
  SMTP_USER?: string | undefined;
  SMTP_PASS?: string | undefined;
};
export declare function validateFrontendEnv(env?: NodeJS.ProcessEnv): {
  NODE_ENV: "production" | "development" | "test";
  VITE_API_URL: string;
  VITE_API_TIMEOUT: number;
  VITE_ENABLE_ANALYTICS: boolean;
  VITE_ENABLE_DEBUG: boolean;
};
export type BackendConfig = z.infer<typeof backendEnvSchema>;
export type FrontendConfig = z.infer<typeof frontendEnvSchema>;
export declare const backendConfig: {
  NODE_ENV: "production" | "development" | "test";
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  FRONTEND_URL: string;
  ALLOWED_ORIGINS: string[];
  LOG_FILE_PATH?: string | undefined;
  REDIS_URL?: string | undefined;
  SMTP_HOST?: string | undefined;
  SMTP_PORT?: number | undefined;
  SMTP_USER?: string | undefined;
  SMTP_PASS?: string | undefined;
};
export declare const isProduction: boolean;
export declare const isDevelopment: boolean;
export declare const isTest: boolean;
export {};
//# sourceMappingURL=env.d.ts.map
