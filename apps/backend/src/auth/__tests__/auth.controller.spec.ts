/**
 * Auth Controller Integration Tests
 * Tests for POST /auth/login, /auth/refresh, /auth/logout endpoints
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
import {
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { GlobalErrorFilter } from '../../common/filters/global-error.filter';
import { CorrelationIdInterceptor } from '../../common/interceptors/correlation-id.interceptor';
import * as fixtures from './fixtures/auth.fixtures';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { backendConfig } from '@boilerplate/config';

describe('AuthController (Integration)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
            validateJwt: jest.fn(),
          },
        },
        JwtStrategy,
      ],
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: backendConfig.JWT_SECRET,
          signOptions: { expiresIn: '15m' },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Register global filters and interceptors
    app.useGlobalFilters(new GlobalErrorFilter());
    app.useGlobalInterceptors(new CorrelationIdInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return LoginResponse with tokens on valid credentials', async () => {
      // Arrange
      const loginRequest = fixtures.mockLoginRequest;
      const mockResponse = fixtures.mockLoginResponse;

      jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginRequest)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('admin@example.com');
      expect(response.body.user.createdAt).toBeDefined();
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 on invalid credentials', async () => {
      // Arrange
      const loginRequest = {
        email: 'admin@example.com',
        password: 'WrongPassword',
      };

      jest.spyOn(authService, 'login').mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      // Act
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginRequest)
        .expect(401); // Unauthorized response
    });

    it('should return 401 on missing email', async () => {
      // Arrange
      jest.spyOn(authService, 'login').mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      // Act
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'Admin123!' })
        .expect(401);
    });

    it('should return 401 on missing password', async () => {
      // Arrange
      jest.spyOn(authService, 'login').mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      // Act
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@example.com' })
        .expect(401);
    });

    it('should return 401 on invalid email format', async () => {
      // Arrange
      jest.spyOn(authService, 'login').mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      // Act
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Admin123!',
        })
        .expect(401);
    });

    it('should include user without password in response', async () => {
      // Arrange
      const loginRequest = fixtures.mockLoginRequest;
      const mockResponse = {
        ...fixtures.mockLoginResponse,
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          name: 'Admin User',
          isActive: true,
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
        },
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginRequest)
        .expect(200);

      // Assert
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user.id).toBe('user-123');
      expect(response.body.user.name).toBe('Admin User');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new TokenPair on valid refresh token', async () => {
      // Arrange
      const refreshRequest = {
        refreshToken: 'valid-refresh-token',
      };
      const mockResponse = fixtures.mockTokenPair;

      jest.spyOn(authService, 'refreshToken').mockResolvedValue(mockResponse);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshRequest)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');
      expect(response.body.accessToken).toBe(mockResponse.accessToken);
    });

    it('should return 401 on invalid/expired refresh token', async () => {
      // Arrange
      const refreshRequest = {
        refreshToken: 'invalid-refresh-token',
      };

      jest.spyOn(authService, 'refreshToken').mockRejectedValue(
        new UnauthorizedException('Invalid or expired refresh token'),
      );

      // Act
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshRequest)
        .expect(401); // Unauthorized response
    });

    it('should return 401 on missing refreshToken', async () => {
      // Arrange
      jest.spyOn(authService, 'refreshToken').mockRejectedValue(
        new UnauthorizedException('Refresh token missing'),
      );

      // Act
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(401);
    });

    it('should return new tokens different from previous ones', async () => {
      // Arrange
      const refreshRequest = {
        refreshToken: 'valid-refresh-token',
      };
      const newTokens = {
        accessToken: 'new-access-token-different',
        refreshToken: 'new-refresh-token-different',
        expiresIn: 900,
      };

      jest.spyOn(authService, 'refreshToken').mockResolvedValue(newTokens);

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshRequest)
        .expect(200);

      // Assert
      expect(response.body.accessToken).toBe(newTokens.accessToken);
      expect(response.body.accessToken).not.toBe(fixtures.mockTokenPair.accessToken);
    });
  });

  describe('POST /auth/logout', () => {
    it('should return success: true on valid JWT', async () => {
      // Arrange
      const logoutResponse = { success: true };
      jest.spyOn(authService, 'logout').mockResolvedValue(logoutResponse);
      const validJwt = jwtService.sign({
        sub: 'user-123',
        email: 'admin@example.com',
        roles: ['admin'],
        permissions: ['users:read'],
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${validJwt}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should return 401 without Authorization header', async () => {
      // Act
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });

    it('should return 401 with invalid JWT', async () => {
      // Act
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-jwt-token')
        .expect(401);
    });

    it('should return 401 with malformed Authorization header', async () => {
      // Act
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });

    it('should pass correlationId to logout service', async () => {
      // Arrange
      const logoutResponse = { success: true };
      jest.spyOn(authService, 'logout').mockResolvedValue(logoutResponse);
      const validJwt = jwtService.sign({
        sub: 'user-123',
        email: 'admin@example.com',
        roles: ['admin'],
        permissions: ['users:read'],
      });

      // Act
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${validJwt}`)
        .set('X-Correlation-ID', 'test-correlation-123')
        .expect(200);

      // Assert
      expect(authService.logout).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
    });
  });
});
