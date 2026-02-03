/**
 * App Module
 * Root module that imports all feature modules
 */

import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { PropertiesModule } from "./properties/properties.module";
import { ListingsModule } from "./listings/listings.module";
import { MessagesModule } from "./messages/messages.module";
import { AgenciesModule } from "./agencies/agencies.module";
// import { NeighborhoodsModule } from "./neighborhoods/neighborhoods.module"; // Disabled - replaced by BoundariesModule
import { BoundariesModule } from "./boundaries/boundaries.module";
import { AmenitiesModule } from "./amenities/amenities.module";
import { PrismaService } from "./prisma/prisma.service";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";

@Module({
  imports: [
    // ✅ Security: Rate limiting to prevent abuse and DoS attacks
    // Default: 100 requests per 15 minutes per IP
    // Overridden per-endpoint with @Throttle decorator
    ThrottlerModule.forRoot([
      {
        ttl: 15 * 60 * 1000, // 15 minutes
        limit: 100,
      },
    ]),

    HealthModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    ListingsModule,
    MessagesModule,
    AgenciesModule,
    // NeighborhoodsModule, // Disabled - replaced by BoundariesModule
    BoundariesModule,
    AmenitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // ✅ Apply correlation ID middleware to all routes for distributed tracing
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
