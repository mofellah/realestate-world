/**
 * Users Service
 * Business logic for user operations
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@boilerplate/logger';
import type { UserWithRoles } from '@boilerplate/types';

@Injectable()
export class UsersService {
  private logger = new Logger('info', { service: 'UsersService' });

  constructor(private prisma: PrismaService) {}

  /**
   * Get user by ID with roles and permissions
   */
  async getUserById(userId: string): Promise<UserWithRoles> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn('User not found', { userId });
      throw new NotFoundException({
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    // Remove passwordHash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      name: null, // User table doesn't have name - it's in the Person table via personId
      roles: [user.role], // Single role enum
      permissions: [], // Permissions would need to be implemented via separate system
    };
  }
}
