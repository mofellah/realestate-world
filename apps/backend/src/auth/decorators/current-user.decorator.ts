import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@boilerplate/types';

/**
 * @CurrentUser decorator extracts JwtPayload from request
 * Provides authenticated user information to controllers
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
