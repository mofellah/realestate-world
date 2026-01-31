/**
 * Health Module
 * Simple health check for docker-compose and kubernetes liveness probes
 */

import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
