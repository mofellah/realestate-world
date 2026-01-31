/**
 * Test Utilities
 *
 * Helper functions commonly used across tests.
 * Includes error handling, context creation, and async utilities.
 */

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";

/**
 * Test context object for correlating test requests
 */
export interface TestContext {
  correlationId: string;
  userId?: string;
  timestamp: Date;
}

/**
 * Expect a promise to throw an error of a specific type
 * @param promise - The promise to test
 * @param errorType - The expected error class (e.g., NotFoundException)
 */
export async function expectThrowError(
  promise: Promise<any>,
  errorType: new (...args: any[]) => Error,
): Promise<Error> {
  try {
    await promise;
    throw new Error(`Expected ${errorType.name} to be thrown, but no error was thrown`);
  } catch (error) {
    if (error instanceof errorType) {
      return error;
    }
    if (error instanceof Error && error.message.includes("Expected")) {
      throw error;
    }
    throw new Error(
      `Expected ${errorType.name} but got ${error instanceof Error ? error.constructor.name : typeof error}: ${error}`,
    );
  }
}

/**
 * Expect a promise to throw a NotFoundException
 * @param promise - The promise to test
 */
export async function expectNotFoundException(promise: Promise<any>): Promise<NotFoundException> {
  return expectThrowError(promise, NotFoundException) as Promise<NotFoundException>;
}

/**
 * Expect a promise to throw a ForbiddenException
 * @param promise - The promise to test
 */
export async function expectForbiddenException(promise: Promise<any>): Promise<ForbiddenException> {
  return expectThrowError(promise, ForbiddenException) as Promise<ForbiddenException>;
}

/**
 * Expect a promise to throw a BadRequestException
 * @param promise - The promise to test
 */
export async function expectBadRequestException(
  promise: Promise<any>,
): Promise<BadRequestException> {
  return expectThrowError(promise, BadRequestException) as Promise<BadRequestException>;
}

/**
 * Expect a promise to throw a ConflictException (duplicate key, etc.)
 * @param promise - The promise to test
 */
export async function expectConflictException(promise: Promise<any>): Promise<ConflictException> {
  return expectThrowError(promise, ConflictException) as Promise<ConflictException>;
}

/**
 * Expect a promise to throw an UnauthorizedException
 * @param promise - The promise to test
 */
export async function expectUnauthorizedException(
  promise: Promise<any>,
): Promise<UnauthorizedException> {
  return expectThrowError(promise, UnauthorizedException) as Promise<UnauthorizedException>;
}

/**
 * Expect a promise to throw a validation error (any BadRequestException with validation)
 * @param promise - The promise to test
 */
export async function expectValidationException(
  promise: Promise<any>,
): Promise<BadRequestException> {
  const error = await expectBadRequestException(promise);
  return error;
}

/**
 * Create a test context with correlation ID and optional user ID
 * @param userId - Optional user ID to include in context
 * @returns TestContext object for request correlation
 */
export function createTestContext(userId?: string): TestContext {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(7);
  return {
    correlationId: `test-${timestamp}-${random}`,
    userId,
    timestamp: new Date(),
  };
}

/**
 * Async delay utility for timing tests
 * @param ms - Milliseconds to sleep
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a unique ID for testing
 * @param prefix - Optional prefix for the ID
 * @returns Unique ID string
 */
export function generateTestId(prefix: string = "test"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Create a mock user ID for testing
 * @returns User ID string
 */
export function createTestUserId(): string {
  return generateTestId("user");
}

/**
 * Create a mock property ID for testing
 * @returns Property ID string
 */
export function createTestPropertyId(): string {
  return generateTestId("prop");
}

/**
 * Create a mock listing ID for testing
 * @returns Listing ID string
 */
export function createTestListingId(): string {
  return generateTestId("list");
}

/**
 * Create mock pagination params
 * @param page - Page number (default 1)
 * @param limit - Items per page (default 10)
 * @returns Pagination object
 */
export function createTestPagination(page: number = 1, limit: number = 10) {
  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}
