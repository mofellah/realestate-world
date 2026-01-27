/**
 * JWT Guard
 * Validates JWT tokens from Authorization header
 */

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, _info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.correlationId;

    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          message: 'Invalid or missing JWT token',
          error: 'UNAUTHORIZED',
          correlationId,
        })
      );
    }

    // Attach correlation ID to user object
    user.correlationId = correlationId;
    return user;
  }
}
