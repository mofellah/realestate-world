import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsNumber, IsEnum, IsArray, Min, Max } from "class-validator";
import { AmenityTypeEnum } from "@prisma/client";

export class SearchAmenitiesDto {
  @ApiPropertyOptional({ description: "Search by name" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "Filter by amenity type", enum: AmenityTypeEnum })
  @IsOptional()
  @IsEnum(AmenityTypeEnum)
  type?: AmenityTypeEnum;

  @ApiPropertyOptional({
    description: "Filter by multiple amenity types",
    enum: AmenityTypeEnum,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(AmenityTypeEnum, { each: true })
  types?: AmenityTypeEnum[];

  @ApiPropertyOptional({ description: "Filter by city" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: "Latitude for proximity search" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lat?: number;

  @ApiPropertyOptional({ description: "Longitude for proximity search" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lon?: number;

  @ApiPropertyOptional({
    description: "Radius in kilometers (default 5km, max 100km)",
    minimum: 0.1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(100)
  @Type(() => Number)
  radius?: number;

  @ApiPropertyOptional({ description: "Minimum latitude for bounding box" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minLat?: number;

  @ApiPropertyOptional({ description: "Maximum latitude for bounding box" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLat?: number;

  @ApiPropertyOptional({ description: "Minimum longitude for bounding box" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minLon?: number;

  @ApiPropertyOptional({ description: "Maximum longitude for bounding box" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxLon?: number;

  @ApiPropertyOptional({
    description: "Maximum number of results",
    minimum: 1,
    maximum: 200,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  limit?: number;
}
