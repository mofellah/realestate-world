/**
 * Invite Agent DTO
 * Invite an existing user to an agency by email.
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class InviteAgentDto {
  @ApiProperty({ description: "User email to invite", example: "agent@example.com" })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: "Role for the agent", example: "agent" })
  @IsOptional()
  @IsString()
  role?: "owner" | "manager" | "agent" | "sales_manager" | "support_agent";
}
