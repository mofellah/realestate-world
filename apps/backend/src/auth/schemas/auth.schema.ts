/**
 * Auth Validation Schemas (Zod)
 * Runtime validation for authentication data
 */

import { z } from 'zod';

/**
 * Login Schema
 */
export const LoginSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email must not exceed 255 characters'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(255, 'Password must not exceed 255 characters'),
  })
  .strict();

/**
 * Register Schema
 */
export const RegisterSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email must not exceed 255 characters'),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(255, 'Password must not exceed 255 characters')
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and numbers'
      ),

    passwordConfirmation: z
      .string()
      .min(8, 'Password confirmation must match'),

    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(255, 'Name must not exceed 255 characters')
      .optional()
      .nullable(),
  })
  .strict()
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });

/**
 * Refresh Token Schema
 */
export const RefreshTokenSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, 'Refresh token is required'),
  })
  .strict();

/**
 * Change Password Schema
 */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'Current password is required'),

    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and numbers'
      ),

    confirmPassword: z
      .string()
      .min(8, 'Password confirmation is required'),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

// Export types for use in services/controllers
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

