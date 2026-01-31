/**
 * User Response DTO
 * Used for API responses - EXCLUDES sensitive fields like passwordHash
 * Matches Omit<User, 'passwordHash'> type
 */

import { ApiProperty } from "@nestjs/swagger";

// UserRole enum - define inline to avoid Prisma client dependency issues
export enum UserRole {
  user = "user",
  admin = "admin",
}

// Use the shared type from packages/types
export type UserRoleEnum = "user" | "admin";

// User type matching Prisma User model (accepts any role string from Prisma)
type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRoleEnum; // Use the enum type
  name: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  country_code: string | null;
  personId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class UserResponseDto implements Omit<User, "passwordHash"> {
  @ApiProperty({
    description: "User unique identifier",
    example: "clx1a2b3c4d5e6f7g8h9i0j1k",
  })
  id: string;

  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "User role (user or admin)",
    example: "user",
    enum: UserRole,
  })
  role: UserRoleEnum; // Use the enum type to match shared types

  @ApiProperty({
    description: "Whether user account is active",
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: "User display name (optional)",
    example: "John Doe",
    nullable: true,
  })
  name: string | null;

  @ApiProperty({
    description: "User avatar URL (optional)",
    example: "https://example.com/avatar.jpg",
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({
    description: "Country code (optional)",
    example: "US",
    nullable: true,
  })
  country_code: string | null;

  @ApiProperty({
    description: "Associated Person ID (optional)",
    example: "person123",
    nullable: true,
  })
  personId: string | null;

  @ApiProperty({
    description: "Account creation timestamp",
    example: "2026-01-29T10:30:00Z",
  })
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2026-01-29T10:30:00Z",
  })
  updatedAt: Date;

  /**
   * Create UserResponseDto from User model
   * Explicitly excludes passwordHash
   */
  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.role = user.role;
    this.isActive = user.isActive;
    this.name = user.name;
    this.avatarUrl = user.avatarUrl;
    this.country_code = user.country_code;
    this.personId = user.personId;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    // NEVER include passwordHash
  }
}
