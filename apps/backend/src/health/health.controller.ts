/**
 * Health Controller
 * Health check endpoint for liveness probes
 */

import { Controller, Get } from "@nestjs/common";
import { Public } from "../auth/decorators/auth.decorators";

@Controller("health")
export class HealthController {
  /**
   * GET /health
   * Health check endpoint
   * Returns: { status: "ok", timestamp: ISO8601 }
   */
  @Get()
  @Public()
  health() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
