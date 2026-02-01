/**
 * Change Password DTO
 * Ensures strong password rules for user password updates.
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MinLength } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({ description: "Current password", example: "OldPass123!" })
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @ApiProperty({ description: "New password", example: "NewPass123!" })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, {
    message: "Password must contain uppercase, lowercase, and numbers",
  })
  newPassword!: string;

  @ApiProperty({ description: "Confirm new password", example: "NewPass123!" })
  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}
