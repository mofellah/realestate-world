/**
 * Rate Limiting Configuration (Throttler)
 * Protects API endpoints from abuse and DoS attacks
 */

import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Rate limiting configuration by endpoint
 * Format: ttl (time-to-live in milliseconds), limit (max requests per ttl)
 */
export const throttlerConfig: ThrottlerModuleOptions = [
  {
    // Global default: 100 requests per 15 minutes for most endpoints
    name: 'default',
    ttl: 15 * 60 * 1000, // 15 minutes
    limit: 100,
  },
  {
    // Strict rate limit for auth endpoints: 5 attempts per 15 minutes (prevents brute force)
    name: 'strict',
    ttl: 15 * 60 * 1000, // 15 minutes
    limit: 5,
  },
  {
    // Search endpoints: 30 requests per minute (prevents scraping)
    name: 'search',
    ttl: 60 * 1000, // 1 minute
    limit: 30,
  },
];

/**
 * Throttler skip conditions
 * Return true to skip rate limiting for specific requests
 */
export const shouldSkipThrottler = (req: any): boolean => {
  // Skip rate limiting for health checks and metrics
  if (req.path === '/health' || req.path === '/metrics') {
    return true;
  }
  // Skip for admin users in development
  if (process.env.NODE_ENV === 'development' && req.user?.role === 'admin') {
    return true;
  }
  return false;
};
