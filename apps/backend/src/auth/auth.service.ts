/**
 * Auth Service
 * Business logic for authentication (login, refresh, logout)
 */

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { comparePassword, hashPassword } from '@boilerplate/utils';
import { backendConfig } from '@boilerplate/config';
import { Logger } from '@boilerplate/logger';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  TokenPair,
  JwtPayload,
} from '@boilerplate/types';
import ms from 'ms';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  private logger = new Logger('info', { service: 'AuthService' });

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Login with email and password
   * Returns access and refresh tokens
   */
  async login(loginRequest: LoginRequest, correlationId: string): Promise<LoginResponse> {
    this.logger.setCorrelationId(correlationId);

    const { email, password } = loginRequest;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn('Login attempt failed: user not found', {
        email,
        correlationId,
      });
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS',
        correlationId,
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn('Login attempt failed: invalid password', {
        email,
        correlationId,
      });
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS',
        correlationId,
      });
    }

    // Generate tokens
    const tokenPair = await this.generateTokens(user, correlationId);

    this.logger.info('User login successful', {
      userId: user.id,
      email: user.email,
      correlationId,
    });

    return {
      ...tokenPair,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        passwordHash: user.passwordHash, // Included but will be filtered by API response DTOs
        avatarUrl: user.avatarUrl,
        country_code: user.country_code,
        personId: user.personId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  /**
   * Refresh access token
   * Takes refresh token and returns new token pair
   */
  async refreshToken(refreshTokenString: string, correlationId: string): Promise<TokenPair> {
    this.logger.setCorrelationId(correlationId);

    // Hash the refresh token for lookup
    const tokenHash = crypto.createHash('sha256').update(refreshTokenString).digest('hex');

    // Find refresh token in database
    const refreshTokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: true,
      },
    });

    if (
      !refreshTokenRecord ||
      refreshTokenRecord.revokedAt ||
      refreshTokenRecord.expiresAt < new Date()
    ) {
      this.logger.warn('Refresh token invalid or expired', {
        correlationId,
      });
      throw new UnauthorizedException({
        message: 'Invalid or expired refresh token',
        error: 'INVALID_REFRESH_TOKEN',
        correlationId,
      });
    }

    // Generate new token pair
    const tokenPair = await this.generateTokens(refreshTokenRecord.user, correlationId);

    this.logger.info('Token refreshed successfully', {
      userId: refreshTokenRecord.user.id,
      correlationId,
    });

    return tokenPair;
  }

  /**
   * Register a new user
   * Validates email uniqueness, password strength, creates user with default role
   */
  async register(
    registerRequest: RegisterRequest,
    correlationId: string,
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; user: any }> {
    this.logger.setCorrelationId(correlationId);

    const { email, password, passwordConfirmation } = registerRequest;

    // Validate password confirmation
    if (password !== passwordConfirmation) {
      this.logger.warn('Registration failed: passwords do not match', {
        email,
        correlationId,
      });
      throw new BadRequestException({
        message: 'Passwords do not match',
        error: 'PASSWORD_MISMATCH',
      });
    }

    // Validate password strength (minimum 8 chars, at least one uppercase, one number)
    const passwordStrengthRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordStrengthRegex.test(password)) {
      this.logger.warn('Registration failed: weak password', {
        email,
        correlationId,
      });
      throw new BadRequestException({
        message:
          'Password must be at least 8 characters with at least one uppercase letter and one number',
        error: 'WEAK_PASSWORD',
      });
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn('Registration failed: email already in use', {
        email,
        correlationId,
      });
      throw new ConflictException({
        message: 'Email already in use',
        error: 'EMAIL_CONFLICT',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with default 'user' role
    const newUser = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: UserRole.user,
        isActive: true,
      },
    });

    // Generate tokens
    const tokenPair = await this.generateTokens(newUser, correlationId);

    this.logger.info('User registration successful', {
      userId: newUser.id,
      email: newUser.email,
      correlationId,
    });

    return {
      ...tokenPair,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        passwordHash: newUser.passwordHash, // Included but will be filtered by API response DTOs
        avatarUrl: newUser.avatarUrl,
        country_code: newUser.country_code,
        personId: newUser.personId,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    };
  }

  /**
   * Logout user by revoking refresh token
   */
  async logout(userId: string, correlationId: string): Promise<{ success: boolean }> {
    this.logger.setCorrelationId(correlationId);

    // Revoke all refresh tokens for this user
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logger.info('User logged out', {
      userId,
      correlationId,
    });

    return { success: true };
  }

  /**
   * Validate JWT token
   * Decodes and verifies token signature
   */
  async validateJwt(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: backendConfig.JWT_SECRET,
      });
      return payload as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid JWT token',
        error: 'INVALID_JWT',
      });
    }
  }

  /**
   * Generate access and refresh token pair
   */
  private async generateTokens(
    user: any,
    correlationId: string,
  ): Promise<TokenPair> {
    // Extract roles and permissions
    const roles = user.userRoles?.map((ur: any) => ur.role.name) || [];
    const permissions = user.userRoles?.flatMap((ur: any) =>
      ur.role.rolePermissions?.map(
        (rp: any) => `${rp.permission.resource}:${rp.permission.action}`,
      ),
    ) || [];

    // Parse expiry times
    const accessTokenExpiry = backendConfig.JWT_ACCESS_EXPIRY || '15m';
    const refreshTokenExpiry = backendConfig.JWT_REFRESH_EXPIRY || '7d';

    const accessTokenExpiryMs = (ms(accessTokenExpiry as any) || 900000) as number;
    const refreshTokenExpiryMs = (ms(refreshTokenExpiry as any) || 604800000) as number;

    // Create JWT payload
    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      permissions,
      correlationId,
    };

    // Sign access token
    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: backendConfig.JWT_SECRET,
      expiresIn: accessTokenExpiry,
    });

    // Sign refresh token
    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: backendConfig.JWT_SECRET,
      expiresIn: refreshTokenExpiry,
    });

    // Hash refresh token for storage
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshTokenHash,
        expiresAt: new Date(Date.now() + refreshTokenExpiryMs),
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor(accessTokenExpiryMs / 1000),
    };
  }
}
