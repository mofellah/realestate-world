/**
 * Auth Decorators
 * Custom decorators for auth guards and metadata
 */

import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { UserWithRoles } from '@boilerplate/types';

/**
 * CurrentUser Decorator
 * Extracts the current authenticated user from the request
 * Used in conjunction with JwtGuard
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserWithRoles => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * Roles Decorator
 * Sets required roles metadata for RoleGuard
 * @param roles - Array of role names required to access the endpoint
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * Public Decorator
 * Marks a route as public (no JWT required)
 */
export const Public = () => SetMetadata('isPublic', true);
