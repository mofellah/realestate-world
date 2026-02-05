import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsOptional, IsNumber, IsEnum, Min, Max, MinLength } from "class-validator";
import { AmenityTypeEnum } from "@prisma/client";

export class AutocompleteAmenitiesDto {
  @ApiProperty({ description: "Search query (minimum 2 characters)", minLength: 2 })
  @IsString()
  @MinLength(2)
  query!: string;

  @ApiPropertyOptional({ description: "Filter by amenity type", enum: AmenityTypeEnum })
  @IsOptional()
  @IsEnum(AmenityTypeEnum)
  type?: AmenityTypeEnum;

  @ApiPropertyOptional({ description: "Filter by city" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: "Maximum number of results",
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;
}
