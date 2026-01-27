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
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      this.logger.warn('User not found', { userId });
      throw new NotFoundException({
        message: 'User not found',
        error: 'USER_NOT_FOUND',
      });
    }

    // Transform roles and permissions
    const roles = user.userRoles.map((ur: typeof user.userRoles[number]) => ur.role);
    const permissions = user.userRoles.flatMap((ur: typeof user.userRoles[number]) =>
      ur.role.rolePermissions.map((rp: typeof ur.role.rolePermissions[number]) => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description,
      })),
    );

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      roles,
      permissions,
    };
  }
}
