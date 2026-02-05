import { IsString, IsOptional, IsInt, Min, Max, IsNumber } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class SearchBoundariesDto {
  @ApiPropertyOptional({ description: "Search text for boundary name", example: "antwerp" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Boundary type code (e.g., municipality, city_district)",
    example: "municipality",
  })
  @IsOptional()
  @IsString()
  typeCode?: string;

  @ApiPropertyOptional({ description: "Country code (ISO 3166-1 alpha-2)", example: "BE" })
  @IsOptional()
  @IsString()
  country_code?: string;

  @ApiPropertyOptional({ description: "Minimum latitude for bounding box search", example: 50.8 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minLat?: number;

  @ApiPropertyOptional({ description: "Maximum latitude for bounding box search", example: 51.3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxLat?: number;

  @ApiPropertyOptional({ description: "Minimum longitude for bounding box search", example: 4.3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minLon?: number;

  @ApiPropertyOptional({ description: "Maximum longitude for bounding box search", example: 4.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxLon?: number;

  @ApiPropertyOptional({ description: "Latitude for proximity search", example: 51.2194 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ description: "Longitude for proximity search", example: 4.4025 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lon?: number;

  @ApiPropertyOptional({
    description: "Radius in kilometers for proximity search",
    example: 10,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(500)
  radius?: number;

  @ApiPropertyOptional({ description: "Maximum results to return", example: 20, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
