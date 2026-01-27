/**
 * Common validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Email validation schema
 * - Must be valid email format
 * - Converted to lowercase
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

/**
 * Password validation schema
 * - Minimum 8 characters
 * - Maximum 100 characters
 * - Must contain at least one uppercase letter, one lowercase letter, and one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  );

/**
 * UUID validation schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * CUID validation schema (Prisma default ID format)
 */
export const cuidSchema = z.string().cuid('Invalid CUID format');

/**
 * Non-empty string validation
 */
export const nonEmptyStringSchema = z.string().min(1, 'Field cannot be empty').trim();

/**
 * Positive integer validation
 */
export const positiveIntSchema = z.number().int().positive('Must be a positive integer');

/**
 * Pagination parameters validation
 */
export const paginationSchema = z.object({
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(10),
});

/**
 * URL validation schema
 */
export const urlSchema = z.string().url('Invalid URL format');

/**
 * ISO date string validation
 */
export const isoDateSchema = z.string().datetime('Invalid ISO date format');
