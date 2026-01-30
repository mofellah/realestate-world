/**
 * Auth Register Tests
 * Unit and integration tests for registration endpoint
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('AuthService - Register', () => {
  let authService: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('register - successful registration', () => {
    it('should register a new user with valid credentials', async () => {
      const registerRequest = {
        email: 'newuser@example.com',
        password: 'ValidPass123!',
        passwordConfirmation: 'ValidPass123!',
        name: 'New User',
      };

      const mockUserRole = {
        id: 'role-user-id',
        name: 'user',
        rolePermissions: [],
      };

      const mockNewUser = {
        id: 'new-user-id',
        email: registerRequest.email,
        password: 'hashed-password',
        name: registerRequest.name,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [
          {
            role: mockUserRole,
          },
        ],
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.role.findUnique.mockResolvedValueOnce(mockUserRole);
      mockPrismaService.user.create.mockResolvedValueOnce(mockNewUser);
      mockPrismaService.refreshToken.create.mockResolvedValueOnce({});

      const result = await authService.register(registerRequest, 'correlation-id');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.user.email).toBe(registerRequest.email);
      expect(result.user.name).toBe(registerRequest.name);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerRequest.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should assign default user role to new user', async () => {
      const registerRequest = {
        email: 'testuser@example.com',
        password: 'TestPass123!',
        passwordConfirmation: 'TestPass123!',
        name: 'Test User',
      };

      const mockUserRole = {
        id: 'role-id',
        name: 'user',
        rolePermissions: [
          {
            permission: {
              resource: 'posts',
              action: 'read',
            },
          },
        ],
      };

      const mockNewUser = {
        id: 'user-id',
        email: registerRequest.email,
        password: 'hashed-password',
        name: registerRequest.name,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: mockUserRole }],
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.role.findUnique.mockResolvedValueOnce(mockUserRole);
      mockPrismaService.user.create.mockResolvedValueOnce(mockNewUser);
      mockPrismaService.refreshToken.create.mockResolvedValueOnce({});

      await authService.register(registerRequest, 'correlation-id');

      expect(mockPrismaService.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: 'user',
          }),
        })
      );
    });
  });

  describe('register - validation errors', () => {
    it('should reject password mismatch', async () => {
      const registerRequest = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        passwordConfirmation: 'DifferentPass123!',
        name: 'Test',
      };

      await expect(
        authService.register(registerRequest, 'correlation-id')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject weak password (less than 8 chars)', async () => {
      const registerRequest = {
        email: 'test@example.com',
        password: 'Short1',
        passwordConfirmation: 'Short1',
        name: 'Test',
      };

      await expect(
        authService.register(registerRequest, 'correlation-id')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject password without uppercase letter', async () => {
      const registerRequest = {
        email: 'test@example.com',
        password: 'lowercase123',
        passwordConfirmation: 'lowercase123',
        name: 'Test',
      };

      await expect(
        authService.register(registerRequest, 'correlation-id')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject password without number', async () => {
      const registerRequest = {
        email: 'test@example.com',
        password: 'NoNumbers!',
        passwordConfirmation: 'NoNumbers!',
        name: 'Test',
      };

      await expect(
        authService.register(registerRequest, 'correlation-id')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate email', async () => {
      const registerRequest = {
        email: 'existing@example.com',
        password: 'ValidPass123!',
        passwordConfirmation: 'ValidPass123!',
        name: 'Test',
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'existing-user-id',
        email: 'existing@example.com',
      });

      await expect(
        authService.register(registerRequest, 'correlation-id')
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('register - edge cases', () => {
    it('should handle missing name (optional field)', async () => {
      const registerRequest = {
        email: 'noname@example.com',
        password: 'ValidPass123!',
        passwordConfirmation: 'ValidPass123!',
      };

      const mockUserRole = {
        id: 'role-id',
        name: 'user',
        rolePermissions: [],
      };

      const mockNewUser = {
        id: 'user-id',
        email: registerRequest.email,
        password: 'hashed-password',
        name: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: mockUserRole }],
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.role.findUnique.mockResolvedValueOnce(mockUserRole);
      mockPrismaService.user.create.mockResolvedValueOnce(mockNewUser);
      mockPrismaService.refreshToken.create.mockResolvedValueOnce({});

      const result = await authService.register(registerRequest, 'correlation-id');

      expect(result.user.name).toBeNull();
    });

    it('should return user without password hash', async () => {
      const registerRequest = {
        email: 'secure@example.com',
        password: 'SecurePass123!',
        passwordConfirmation: 'SecurePass123!',
        name: 'Secure User',
      };

      const mockUserRole = {
        id: 'role-id',
        name: 'user',
        rolePermissions: [],
      };

      const mockNewUser = {
        id: 'user-id',
        email: registerRequest.email,
        password: 'hashed-password-should-not-be-returned',
        name: registerRequest.name,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: mockUserRole }],
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.role.findUnique.mockResolvedValueOnce(mockUserRole);
      mockPrismaService.user.create.mockResolvedValueOnce(mockNewUser);
      mockPrismaService.refreshToken.create.mockResolvedValueOnce({});

      const result = await authService.register(registerRequest, 'correlation-id');

      expect(result.user).not.toHaveProperty('password');
    });
  });
});
