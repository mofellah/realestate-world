/**
 * Search Properties DTO
 * Query parameters for property search with spatial filtering
 */

import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchPropertiesDto {
  // Price filters
  @ApiPropertyOptional({ description: 'Minimum price', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({ description: 'Maximum price', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;

  // Property type filter
  @ApiPropertyOptional({ 
    description: 'Property type', 
    enum: ['house', 'apartment', 'condo', 'land', 'commercial', 'other'] 
  })
  @IsOptional()
  @IsString()
  @IsIn(['house', 'apartment', 'condo', 'land', 'commercial', 'other'])
  type?: string;

  // Bedrooms/Bathrooms filter
  @ApiPropertyOptional({ description: 'Minimum bedrooms', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'Minimum bathrooms', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bathrooms?: number;

  // Spatial filters (PostGIS ST_DWithin)
  @ApiPropertyOptional({ description: 'Center latitude for spatial search', minimum: -90, maximum: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Center longitude for spatial search', minimum: -180, maximum: 180 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Radius in meters for spatial search', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radius?: number;

  // Location filters
  @ApiPropertyOptional({ description: 'City name' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Country code (ISO 3166-1 alpha-2)', maxLength: 2 })
  @IsOptional()
  @IsString()
  country?: string;

  // Pagination
  @ApiPropertyOptional({ description: 'Skip N records', minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({ description: 'Take N records', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  take?: number;
}
