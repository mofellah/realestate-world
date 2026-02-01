/**
 * Admin Controller
 * Admin-only endpoints for system metrics and activity.
 */

import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/auth.decorators";

@ApiTags("Admin")
@Controller("admin")
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth("JWT-auth")
@Roles("admin")
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("metrics")
  @ApiOperation({ summary: "Get system metrics (admin only)" })
  @ApiResponse({ status: 200, description: "Metrics retrieved successfully" })
  async getMetrics() {
    return this.adminService.getMetrics();
  }

  @Get("activity")
  @ApiOperation({ summary: "Get recent activity (admin only)" })
  @ApiResponse({ status: 200, description: "Activity retrieved successfully" })
  async getActivity(@Query("limit") limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.adminService.getActivity(Number.isNaN(parsedLimit) ? 10 : parsedLimit);
  }
}
