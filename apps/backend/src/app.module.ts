/**
 * App Module
 * Root module that imports all feature modules
 */

import { Module, NestModule } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { PrismaService } from './prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure() {
    // Middleware can be added here if needed
  }
}
