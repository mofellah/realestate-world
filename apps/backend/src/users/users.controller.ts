/**
 * Users Controller
 * Endpoints for user operations
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/auth.decorators';
import type { UserWithRoles } from '@boilerplate/types';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * GET /users/me
   * Get current authenticated user with roles and permissions
   * Requires: Valid JWT token
   */
  @Get('me')
  async getCurrentUser(@CurrentUser() user: UserWithRoles) {
    return {
      user: await this.usersService.getUserById(user.id),
    };
  }
}
