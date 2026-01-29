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
    it('should return user with a single role and no permissions', async () => {
      // Arrange
      const userId = 'user-123';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(fixtures.mockUserWithAdminRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.id).toBe('user-123');
      expect(result.email).toBe('admin@example.com');
      expect(result.roles).toEqual([fixtures.mockUserWithAdminRole.role]);
      expect(result.permissions).toEqual([]);
      expect(result).not.toHaveProperty('passwordHash');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(NotFoundException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should return empty roles array when user.role is missing', async () => {
      // Arrange
      const userId = 'user-789';
      const mockUserWithoutRole = {
        ...fixtures.mockUserWithAdminRole,
        id: 'user-789',
        role: null,
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUserWithoutRole as any);

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result.roles).toEqual([]);
      expect(result.permissions).toEqual([]);
    });

    it('should allow null user name in response', async () => {
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