/**
 * Auth Module
 * Handles authentication and authorization logic
 */

import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtGuard } from "./guards/jwt.guard";
import { RolesGuard } from "./guards/roles.guard";
import { PrismaService } from "../prisma/prisma.service";
import { backendConfig } from "@boilerplate/config";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: backendConfig.JWT_SECRET,
      signOptions: { expiresIn: backendConfig.JWT_ACCESS_EXPIRY || "15m" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtGuard, RolesGuard, PrismaService],
  exports: [AuthService, JwtGuard, RolesGuard],
})
export class AuthModule {}
