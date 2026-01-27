/**
 * JWT Decode Utility
 * Decode JWT token without verification (client-side only)
 */

import type { JwtPayload } from '@boilerplate/types';

/**
 * Decode JWT token and extract payload
 * Note: This is client-side only, does NOT verify signature
 * @param token - JWT token
 * @returns Decoded JWT payload or null if invalid
 */
export function decodeJWT(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );

    return decoded as JwtPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param token - JWT token
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // Check if token expires within next 60 seconds
  return payload.exp * 1000 < Date.now() + 60000;
}

/**
 * Get time until token expiration in milliseconds
 * @param token - JWT token
 * @returns milliseconds until expiration, or 0 if already expired/invalid
 */
export function getTokenExpiresIn(token: string): number {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const expiresIn = payload.exp * 1000 - Date.now();
  return Math.max(0, expiresIn);
}
