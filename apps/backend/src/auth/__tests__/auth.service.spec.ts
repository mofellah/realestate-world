/**
 * Auth Service Unit Tests
 * Tests for login, refresh, logout, and JWT validation
 */

// Mock @boilerplate/config BEFORE other imports
jest.mock('@boilerplate/config', () => ({
  backendConfig: {
    JWT_SECRET: 'test-secret',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    BACKEND_URL: 'http://localhost:3000',
    FRONTEND_URL: 'http://localhost:5173',
    NODE_ENV: 'test',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as fixtures from './fixtures/auth.fixtures';
import { comparePassword } from '@boilerplate/utils';
import { backendConfig } from '@boilerplate/config';

// Mock the utility functions
jest.mock('@boilerplate/utils', () => ({
  comparePassword: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            refreshToken: {
              findUnique: jest.fn(),
              updateMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return LoginResponse with tokens on valid credentials', async () => {
      // Arrange
      const loginRequest = fixtures.mockLoginRequest;
      const correlationId = 'trace-123';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(fixtures.mockUserWithAdminRole as any);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      jest.spyOn(prismaService.refreshToken, 'create').mockResolvedValue({} as any);

      // Act
      const result = await service.login(loginRequest, correlationId);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('admin@example.com');
      expect(result.user.id).toBe('user-123');
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginRequest.email },
        include: expect.objectContaining({
          userRoles: expect.any(Object),
        }),
      });
      expect(comparePassword).toHaveBeenCalledWith(loginRequest.password, fixtures.mockUserWithAdminRole.password);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const loginRequest = fixtures.mockLoginRequest;
      const correlationId = 'trace-123';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginRequest, correlationId)).rejects.toThrow(UnauthorizedException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginRequest.email },
        include: expect.any(Object),
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      const loginRequest = fixtures.mockLoginRequest;
      const correlationId = 'trace-123';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(fixtures.mockUserWithAdminRole as any);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginRequest, correlationId)).rejects.toThrow(UnauthorizedException);
      expect(comparePassword).toHaveBeenCalledWith(loginRequest.password, fixtures.mockUserWithAdminRole.password);
    });

    it('should include roles and permissions in JWT token', async () => {
      // Arrange
      const loginRequest = fixtures.mockLoginRequest;
      const correlationId = 'trace-123';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(fixtures.mockUserWithAdminRole as any);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      jest.spyOn(prismaService.refreshToken, 'create').mockResolvedValue({} as any);

      // Act
      await service.login(loginRequest, correlationId);

      // Assert
      const signCalls = (jwtService.sign as jest.Mock).mock.calls;
      expect(signCalls[0][0]).toMatchObject({
        sub: 'user-123',
        email: 'admin@example.com',
        roles: ['admin'],
        permissions: ['users:read', 'users:write'],
        correlationId,
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new TokenPair with valid refresh token', async () => {
      // Arrange
      const refreshTokenString = 'refresh-token-string';
      const correlationId = 'trace-123';
      const refreshTokenWithUser = {
        ...fixtures.mockRefreshToken,
        user: fixtures.mockUserWithAdminRole,
      };

      jest.spyOn(prismaService.refreshToken, 'findUnique').mockResolvedValue(refreshTokenWithUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token');
      jest.spyOn(prismaService.refreshToken, 'create').mockResolvedValue({} as any);

      // Act
      const result = await service.refreshToken(refreshTokenString, correlationId);

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.accessToken).toBe('new-access-token');
    });

    it('should throw UnauthorizedException when refresh token not found', async () => {
      // Arrange
      const refreshTokenString = 'invalid-token';
      const correlationId = 'trace-123';

      jest.spyOn(prismaService.refreshToken, 'findUnique').mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshToken(refreshTokenString, correlationId)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token is revoked', async () => {
      // Arrange
      const refreshTokenString = 'revoked-token';
      const correlationId = 'trace-123';
      const revokedToken = {
        ...fixtures.mockRevokedRefreshToken,
        user: fixtures.mockUserWithAdminRole,
      };

      jest.spyOn(prismaService.refreshToken, 'findUnique').mockResolvedValue(revokedToken as any);

      // Act & Assert
      await expect(service.refreshToken(refreshTokenString, correlationId)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token is expired', async () => {
      // Arrange
      const refreshTokenString = 'expired-token';
      const correlationId = 'trace-123';
      const expiredToken = {
        ...fixtures.mockExpiredRefreshToken,
        user: fixtures.mockUserWithAdminRole,
      };

      jest.spyOn(prismaService.refreshToken, 'findUnique').mockResolvedValue(expiredToken as any);

      // Act & Assert
      await expect(service.refreshToken(refreshTokenString, correlationId)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke all refresh tokens for user and return success', async () => {
      // Arrange
      const userId = 'user-123';
      const correlationId = 'trace-123';

      jest.spyOn(prismaService.refreshToken, 'updateMany').mockResolvedValue({ count: 2 });

      // Act
      const result = await service.logout(userId, correlationId);

      // Assert
      expect(result.success).toBe(true);
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it('should handle case with no refresh tokens to revoke', async () => {
      // Arrange
      const userId = 'user-456';
      const correlationId = 'trace-456';

      jest.spyOn(prismaService.refreshToken, 'updateMany').mockResolvedValue({ count: 0 });

      // Act
      const result = await service.logout(userId, correlationId);

      // Assert
      expect(result.success).toBe(true);
      expect(prismaService.refreshToken.updateMany).toHaveBeenCalled();
    });
  });

  describe('validateJwt', () => {
    it('should decode and return JwtPayload on valid token', async () => {
      // Arrange
      const token = 'valid-jwt-token';
      const payload = fixtures.mockJwtPayloadAdmin;

      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      // Act
      const result = await service.validateJwt(token);

      // Assert
      expect(result).toEqual(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, {
        secret: backendConfig.JWT_SECRET,
      });
    });

    it('should throw UnauthorizedException on invalid token', async () => {
      // Arrange
      const token = 'invalid-jwt-token';

      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(service.validateJwt(token)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on expired token', async () => {
      // Arrange
      const token = 'expired-jwt-token';

      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Token expired'));

      // Act & Assert
      await expect(service.validateJwt(token)).rejects.toThrow(UnauthorizedException);
    });
  });
});
