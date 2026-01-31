/**
 * Listing DTOs with Swagger decorations
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsArray } from "class-validator";

enum ListingType {
  Sale = "sale",
  Rental = "rental",
  ShortTerm = "short_term",
  Lease = "lease",
}

enum ListingStatus {
  Draft = "draft",
  Published = "published",
  Archived = "archived",
}

export class CreateListingDto {
  @ApiProperty({
    description: "Property ID",
    example: "cm123xyz789",
  })
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @ApiProperty({
    description: "Listing type",
    enum: ListingType,
    example: "sale",
  })
  @IsEnum(ListingType)
  @IsNotEmpty()
  type!: string;

  @ApiProperty({
    description: "Payment terms ID",
    example: "cm123payment456",
  })
  @IsString()
  @IsNotEmpty()
  paymentTermsId!: string;

  @ApiPropertyOptional({
    description: "Listing status",
    enum: ListingStatus,
    example: "draft",
    default: "draft",
  })
  @IsEnum(ListingStatus)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: "Start date for listing visibility (ISO 8601)",
    example: "2026-02-01T00:00:00Z",
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date for listing visibility (ISO 8601)",
    example: "2026-03-01T00:00:00Z",
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Days of the week for visibility (0=Sunday, 6=Saturday)",
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  @IsArray()
  @IsOptional()
  visibilityDays?: number[];

  @ApiPropertyOptional({
    description: "Additional metadata (JSON)",
    example: { featured: true, priority: "high" },
  })
  @IsOptional()
  metadata?: any;
}

export class UpdateListingDto {
  @ApiPropertyOptional({
    description: "Listing status",
    enum: ListingStatus,
  })
  @IsEnum(ListingStatus)
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: "Start date for listing visibility (ISO 8601)",
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date for listing visibility (ISO 8601)",
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Days of the week for visibility",
    type: [Number],
  })
  @IsArray()
  @IsOptional()
  visibilityDays?: number[];

  @ApiPropertyOptional({
    description: "Additional metadata (JSON)",
  })
  @IsOptional()
  metadata?: any;
}

export class PublishListingDto {
  @ApiProperty({
    description: "Set status to published",
    example: "published",
    enum: ["published"],
  })
  @IsEnum(["published"])
  @IsNotEmpty()
  status!: string;

  @ApiPropertyOptional({
    description: "Start date for visibility",
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date for visibility",
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
