import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max, IsUrl } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAgencyDto {
  @ApiProperty({ description: "Person ID (organization person)" })
  @IsString()
  @IsNotEmpty()
  personId!: string;

  @ApiPropertyOptional({
    description: "Agency tier",
    enum: ["basic", "professional", "enterprise"],
  })
  @IsOptional()
  @IsEnum(["basic", "professional", "enterprise"])
  tier?: "basic" | "professional" | "enterprise";

  @ApiPropertyOptional({ description: "Profile image URL" })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiPropertyOptional({ description: "Agency description", maxLength: 1000 })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "Maximum number of agents", minimum: 1, maximum: 500 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  maxAgents?: number;

  @ApiPropertyOptional({
    description: "Maximum number of active listings",
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  maxListings?: number;
}
