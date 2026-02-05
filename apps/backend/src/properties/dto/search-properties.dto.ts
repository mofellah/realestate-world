/**
 * Search Properties DTO
 * Query parameters for property search with spatial filtering
 * Supports both user-friendly names (type, bedrooms) and schema names (propertyType, minBedrooms)
 */

import { IsOptional, IsString, IsNumber, Min, Max, IsIn, IsArray } from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class SearchPropertiesDto {
  // Price filters
  @ApiPropertyOptional({ description: "Minimum price", minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price", minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // Property type filter (supports both 'type' and 'propertyType')
  @ApiPropertyOptional({
    description: "Property type",
    enum: ["studio", "house", "apartment", "villa", "land", "room", "commercial", "other"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["studio", "house", "apartment", "villa", "land", "room", "commercial", "other"])
  propertyType?: string;

  // Listing type filter
  @ApiPropertyOptional({
    description: "Listing type (sale, rental, short_term, lease)",
    enum: ["sale", "rental", "short_term", "lease"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["sale", "rental", "short_term", "lease"])
  listingType?: string;

  // Also accept 'type' as alias for backward compatibility
  @IsOptional()
  @IsString()
  @Transform(({ obj, value }) => {
    // If 'type' is provided and propertyType isn't, copy it
    if (value && !obj.propertyType) {
      obj.propertyType = value;
    }
  })
  type?: string;

  // Bedrooms filters (supports both 'bedrooms' and 'minBedrooms')
  @ApiPropertyOptional({
    description: "Minimum bedrooms",
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBedrooms?: number;

  // Also accept 'bedrooms' as alias
  @IsOptional()
  @Type(() => Number)
  @Transform(({ obj, value }) => {
    // If 'bedrooms' is provided and minBedrooms isn't, copy it
    if (value !== undefined && obj.minBedrooms === undefined) {
      obj.minBedrooms = value;
    }
  })
  bedrooms?: number;

  // Max bedrooms filter
  @ApiPropertyOptional({
    description: "Maximum bedrooms",
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBedrooms?: number;

  // Bathrooms filters (supports both 'bathrooms' and 'minBathrooms')
  @ApiPropertyOptional({
    description: "Minimum bathrooms",
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBathrooms?: number;

  // Also accept 'bathrooms' as alias
  @IsOptional()
  @Type(() => Number)
  @Transform(({ obj, value }) => {
    // If 'bathrooms' is provided and minBathrooms isn't, copy it
    if (value !== undefined && obj.minBathrooms === undefined) {
      obj.minBathrooms = value;
    }
  })
  bathrooms?: number;

  // Max bathrooms filter
  @ApiPropertyOptional({
    description: "Maximum bathrooms",
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBathrooms?: number;

  // Spatial filters (PostGIS ST_DWithin)
  @ApiPropertyOptional({
    description: "Center latitude for spatial search",
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: "Center longitude for spatial search",
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: "Radius in meters for spatial search", minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radius?: number;

  // Distance metric for spatial queries
  @ApiPropertyOptional({
    description: "Distance metric for spatial search",
    enum: ["walking", "driving", "direct"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["walking", "driving", "direct"])
  distanceMetric?: string;

  // Amenities filter (comma-separated or array)
  @ApiPropertyOptional({
    description: "Amenities to filter by (comma-separated: schools,parks,restaurants)",
    example: "schools,parks",
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return value;
  })
  @IsArray()
  amenities?: string[];

  // Boundary IDs filter (array of boundary IDs to search within)
  @ApiPropertyOptional({
    description: "Boundary IDs to filter by (properties must be within these boundaries)",
    type: [String],
    example: ["boundary-id-1", "boundary-id-2"],
  })
  @IsOptional()
  @IsArray()
  boundaries?: string[];

  // Pagination
  @ApiPropertyOptional({ description: "Skip N records", minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({ description: "Take N records", minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  take?: number;
}
