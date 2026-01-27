/**
 * Auth Controller
 * Endpoints for login, refresh, logout
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { CurrentUser, Public } from './decorators/auth.decorators';
import type { LoginRequest, RefreshRequest, RegisterRequest } from '@boilerplate/types';
import type { UserWithRoles } from '@boilerplate/types';
import type { RequestWithCorrelation } from '../common/types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/login
   * Login with email and password
   * Returns: { accessToken, refreshToken, expiresIn, user }
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: LoginRequest, @Req() req: RequestWithCorrelation) {
    const correlationId = req.correlationId;
    return this.authService.login(loginRequest, correlationId);
  }

  /**
   * POST /auth/register
   * Register a new user with email, password, and optional name
   * Returns: { accessToken, refreshToken, expiresIn, user }
   */
  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerRequest: RegisterRequest, @Req() req: RequestWithCorrelation) {
    const correlationId = req.correlationId;
    return this.authService.register(registerRequest, correlationId);
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   * Returns: { accessToken, refreshToken, expiresIn }
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshRequest: RefreshRequest, @Req() req: RequestWithCorrelation) {
    const correlationId = req.correlationId;
    return this.authService.refreshToken(refreshRequest.refreshToken, correlationId);
  }

  /**
   * POST /auth/logout
   * Logout user and revoke refresh tokens
   * Requires: Valid JWT token
   * Returns: { success: true }
   */
  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: UserWithRoles, @Req() req: RequestWithCorrelation) {
    const correlationId = req.correlationId;
    return this.authService.logout(user.id, correlationId);
  }
}
