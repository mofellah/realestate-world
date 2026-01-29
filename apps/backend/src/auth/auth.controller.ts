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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';
import { CurrentUser, Public } from './decorators/auth.decorators';
import { LoginDto, RegisterDto, RefreshDto, LoginResponseDto, LogoutResponseDto } from './dto/auth.dto';
import type { UserWithRoles } from '@boilerplate/types';
import type { RequestWithCorrelation } from '../common/types';

@ApiTags('Authentication')
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
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginRequest: LoginDto, @Req() req: RequestWithCorrelation) {
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
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ 
    status: 201, 
    description: 'Registration successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or email already exists' })
  async register(@Body() registerRequest: RegisterDto, @Req() req: RequestWithCorrelation) {
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
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() refreshRequest: RefreshDto, @Req() req: RequestWithCorrelation) {
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and revoke tokens' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@CurrentUser() user: UserWithRoles, @Req() req: RequestWithCorrelation) {
    const correlationId = req.correlationId;
    return this.authService.logout(user.id, correlationId);
  }
}
// @ts-check
