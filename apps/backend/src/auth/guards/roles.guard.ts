/**
 * Roles Guard
 * Validates user roles against required roles
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Logger } from '@boilerplate/logger';

@Injectable()
export class RolesGuard implements CanActivate {
  private logger = new Logger('info', { service: 'RolesGuard' });

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const correlationId = request.correlationId;

    if (!user) {
      throw new ForbiddenException({
        message: 'No user found',
        error: 'FORBIDDEN',
        correlationId,
      });
    }

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      this.logger.warn(`Access denied: missing required roles`, {
        userId: user.id,
        requiredRoles,
        userRoles: user.roles,
        correlationId,
      });

      throw new ForbiddenException({
        message: `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`,
        error: 'FORBIDDEN',
        correlationId,
      });
    }

    return true;
  }
}
