/**
 * Roles Guard Unit Tests
 * Tests for role-based access control and authorization
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    // Create a fresh reflector instance for mocking
    reflector = new Reflector();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RolesGuard,
          useValue: new RolesGuard(reflector),
        },
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Helper to create a mock ExecutionContext
   */
  const createMockExecutionContext = (
    request: any,
    requiredRoles?: string[],
  ): ExecutionContext => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
      getHandler: jest.fn().mockReturnValue({}),
      getClass: jest.fn().mockReturnValue(class {}),
    } as unknown as ExecutionContext;

    // Mock reflector for this context
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key: unknown) => {
      if (key === 'roles') {
        return requiredRoles || [];
      }
      return undefined;
    });

    return mockContext;
  };

  describe('canActivate', () => {
    it('should return true if user has required role', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: ['admin'],
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const requiredRoles = ['admin'];
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true if user has multiple roles including required role', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: ['user', 'admin', 'moderator'],
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const requiredRoles = ['admin'];
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true if no roles required (public endpoint)', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: ['user'],
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const context = createMockExecutionContext(mockRequest, undefined);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user lacks required role', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: ['user'],
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const requiredRoles = ['admin'];
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user has no roles but admin required', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: [],
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const requiredRoles = ['admin'];
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user has one required role but not other', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: ['user'],
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const requiredRoles = ['admin', 'moderator'];
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should return true if user has one of multiple required roles', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: ['moderator'],
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const requiredRoles = ['admin', 'moderator'];
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if no user found', () => {
      // Arrange
      const mockRequest = {
        user: null,
        correlationId: 'trace-123',
      };
      const requiredRoles = ['admin'];
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should include message with required roles in ForbiddenException', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: ['user'],
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const requiredRoles = ['admin', 'moderator'];
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act & Assert
      try {
        guard.canActivate(context);
        fail('Should have thrown ForbiddenException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toContain('admin');
        expect(error.message).toContain('moderator');
      }
    });

    it('should handle undefined roles in user object', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: undefined,
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const requiredRoles = ['admin'];
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act & Assert
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle case sensitivity correctly', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: ['Admin'], // Different case
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const requiredRoles = ['admin']; // lowercase
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act & Assert
      // Should fail because 'Admin' !== 'admin'
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should return true when empty roles required array', () => {
      // Arrange
      const mockRequest = {
        user: {
          id: 'user-123',
          roles: ['user'],
          correlationId: 'trace-123',
        },
        correlationId: 'trace-123',
      };
      const requiredRoles: string[] = [];
      const context = createMockExecutionContext(mockRequest, requiredRoles);

      // Act
      const result = guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });
  });
});
