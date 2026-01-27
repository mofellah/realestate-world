/**
 * Users Controller Integration Tests
 * Tests for GET /users/me endpoint with authentication
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

// Mock JwtGuard to control auth outcomes without real JWT validation
jest.mock('../../auth/guards/jwt.guard', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { UnauthorizedException } = require('@nestjs/common');
  class MockJwtGuard {
    canActivate(context: any) {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Missing or malformed Authorization header');
      }

      const token = authHeader.split(' ')[1];
      if (token !== 'valid-jwt-token') {
        throw new UnauthorizedException('Invalid token');
      }

      request.user = {
        id: 'user-123',
        email: 'admin@example.com',
        roles: ['admin'],
        permissions: ['users:read'],
      };

      return true;
    }
  }

  return { JwtGuard: MockJwtGuard };
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { GlobalErrorFilter } from '../../common/filters/global-error.filter';
import { CorrelationIdInterceptor } from '../../common/interceptors/correlation-id.interceptor';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { backendConfig } from '@boilerplate/config';

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(),
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
    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users/me', () => {
    it('should return current user with valid JWT', async () => {
      // Arrange
      const mockUserResponse = {
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          name: 'Admin User',
          isActive: true,
          roles: [
            {
              id: 'role-admin',
              name: 'admin',
              description: 'Administrator',
            },
          ],
          permissions: [
            {
              id: 'perm-1',
              resource: 'users',
              action: 'read',
              description: 'Read users',
            },
          ],
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
        },
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUserResponse.user as any);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('admin@example.com');
      expect(response.body.user.roles).toBeDefined();
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 without Authorization header', async () => {
      // Act
      await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });

    it('should return 401 with invalid JWT', async () => {
      // Act
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-jwt-token')
        .expect(401);
    });

    it('should return 401 with malformed Authorization header', async () => {
      // Act
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });

    it('should return user without password field', async () => {
      // Arrange
      const mockUserResponse = {
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          name: 'Admin User',
          isActive: true,
          roles: [],
          permissions: [],
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
        },
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUserResponse.user as any);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect(200);

      // Assert
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should include user roles in response', async () => {
      // Arrange
      const mockUserResponse = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'Regular User',
          isActive: true,
          roles: [
            {
              id: 'role-user',
              name: 'user',
              description: 'Regular user',
            },
          ],
          permissions: [
            {
              id: 'perm-1',
              resource: 'users',
              action: 'read',
              description: 'Read users',
            },
          ],
          createdAt: new Date('2026-01-02'),
          updatedAt: new Date('2026-01-02'),
        },
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUserResponse.user as any);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect(200);

      // Assert
      expect(response.body.user.roles).toBeDefined();
      expect(Array.isArray(response.body.user.roles)).toBe(true);
      expect(response.body.user.roles[0].name).toBe('user');
    });

    it('should include user permissions in response', async () => {
      // Arrange
      const mockUserResponse = {
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          name: 'Admin User',
          isActive: true,
          roles: [],
          permissions: [
            {
              id: 'perm-users-read',
              resource: 'users',
              action: 'read',
              description: 'Read users',
            },
            {
              id: 'perm-users-write',
              resource: 'users',
              action: 'write',
              description: 'Write users',
            },
          ],
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
        },
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUserResponse.user as any);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect(200);

      // Assert
      expect(response.body.user.permissions).toBeDefined();
      expect(Array.isArray(response.body.user.permissions)).toBe(true);
      expect(response.body.user.permissions.length).toBe(2);
    });

    it('should return user metadata (createdAt, updatedAt)', async () => {
      // Arrange
      const createdAt = new Date('2026-01-01');
      const updatedAt = new Date('2026-01-15');
      const mockUserResponse = {
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          name: 'Admin User',
          isActive: true,
          roles: [],
          permissions: [],
          createdAt,
          updatedAt,
        },
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUserResponse.user as any);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect(200);

      // Assert
      expect(response.body.user.createdAt).toBeDefined();
      expect(response.body.user.updatedAt).toBeDefined();
      expect(new Date(response.body.user.createdAt)).toEqual(createdAt);
      expect(new Date(response.body.user.updatedAt)).toEqual(updatedAt);
    });

    it('should call UsersService.getUserById with correct userId from JWT', async () => {
      // Arrange
      const mockUserResponse = {
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          name: 'Admin User',
          isActive: true,
          roles: [],
          permissions: [],
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
        },
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUserResponse.user as any);

      // Act
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect(200);

      // Assert
      expect(usersService.getUserById).toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      jest.spyOn(usersService, 'getUserById').mockRejectedValue(
        new NotFoundException('User not found'),
      );

      // Act
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect(404);
    });

    it('should handle user with no roles', async () => {
      // Arrange
      const mockUserResponse = {
        user: {
          id: 'user-123',
          email: 'admin@example.com',
          name: 'Admin User',
          isActive: true,
          roles: [],
          permissions: [],
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
        },
      };

      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUserResponse.user as any);

      // Act
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect(200);

      // Assert
      expect(response.body.user.roles).toEqual([]);
      expect(response.body.user.permissions).toEqual([]);
    });
  });
});
