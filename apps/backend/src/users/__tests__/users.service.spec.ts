/**
 * Users Service Unit Tests
 * Tests for user operations (getCurrentUser, getUserById)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as fixtures from '../../auth/__tests__/fixtures/auth.fixtures';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user with roles and permissions on valid userId', async () => {
      // Arrange
      const userId = 'user-123';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(fixtures.mockUserWithAdminRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('user-123');
      expect(result.email).toBe('admin@example.com');
      expect(result).toHaveProperty('roles');
      expect(result).toHaveProperty('permissions');
      expect(result).not.toHaveProperty('password');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: expect.objectContaining({
          userRoles: expect.any(Object),
        }),
      });
    });

    it('should include user roles in response', async () => {
      // Arrange
      const userId = 'user-123';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(fixtures.mockUserWithAdminRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.roles).toBeDefined();
      expect(Array.isArray(result.roles)).toBe(true);
      expect(result.roles.length).toBeGreaterThan(0);
    });

    it('should include user permissions in response', async () => {
      // Arrange
      const userId = 'user-123';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(fixtures.mockUserWithAdminRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.permissions).toBeDefined();
      expect(Array.isArray(result.permissions)).toBe(true);
      expect(result.permissions.length).toBeGreaterThan(0);
    });

    it('should not include password in response', async () => {
      // Arrange
      const userId = 'user-123';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(fixtures.mockUserWithAdminRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: expect.any(Object),
      });
    });

    it('should transform userRoles to roles array', async () => {
      // Arrange
      const userId = 'user-456';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(fixtures.mockUserWithUserRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.roles).toEqual([fixtures.mockUserWithUserRole.userRoles[0].role]);
    });

    it('should aggregate permissions from all user roles', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUserWithMultipleRoles = {
        ...fixtures.mockUserWithAdminRole,
        userRoles: [
          {
            userId: 'user-123',
            roleId: 'role-admin',
            role: {
              id: 'role-admin',
              name: 'admin',
              description: 'Admin',
              rolePermissions: [
                {
                  roleId: 'role-admin',
                  permissionId: 'perm-1',
                  permission: {
                    id: 'perm-1',
                    resource: 'users',
                    action: 'read',
                    description: 'Read users',
                  },
                },
              ],
            },
          },
          {
            userId: 'user-123',
            roleId: 'role-user',
            role: {
              id: 'role-user',
              name: 'user',
              description: 'User',
              rolePermissions: [
                {
                  roleId: 'role-user',
                  permissionId: 'perm-2',
                  permission: {
                    id: 'perm-2',
                    resource: 'posts',
                    action: 'read',
                    description: 'Read posts',
                  },
                },
              ],
            },
          },
        ],
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUserWithMultipleRoles as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.roles.length).toBe(2);
      expect(result.permissions.length).toBe(2);
      expect(result.permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ resource: 'users', action: 'read' }),
          expect.objectContaining({ resource: 'posts', action: 'read' }),
        ]),
      );
    });

    it('should include all user fields except password', async () => {
      // Arrange
      const userId = 'user-123';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(fixtures.mockUserWithAdminRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result).toMatchObject({
        id: 'user-123',
        email: 'admin@example.com',
        name: 'Admin User',
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should handle user with no roles', async () => {
      // Arrange
      const userId = 'user-456';
      const mockUserNoRoles = {
        ...fixtures.mockUserWithAdminRole,
        id: 'user-456',
        userRoles: [],
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUserNoRoles as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.roles).toEqual([]);
      expect(result.permissions).toEqual([]);
    });

    it('should handle user with null name', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUserNullName = {
        ...fixtures.mockUserWithAdminRole,
        name: null,
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUserNullName as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.name).toBeNull();
    });
  });
});
