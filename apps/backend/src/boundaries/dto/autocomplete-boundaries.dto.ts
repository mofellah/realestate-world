import { IsString, IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class AutocompleteBoundariesDto {
  @ApiPropertyOptional({ description: "Search query text", example: "brus", minLength: 2 })
  @IsString()
  query!: string;

  @ApiPropertyOptional({ description: "Country code filter", example: "BE" })
  @IsOptional()
  @IsString()
  country_code?: string;

  @ApiPropertyOptional({ description: "Boundary type code filter", example: "municipality" })
  @IsOptional()
  @IsString()
  typeCode?: string;

  @ApiPropertyOptional({ description: "Maximum results", example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
