/**
 * Property DTOs with Swagger decorations
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsBoolean, IsEnum, Min } from 'class-validator';

enum PropertyType {
  House = 'house',
  Apartment = 'apartment',
  Condo = 'condo',
  Land = 'land',
  Commercial = 'commercial',
}

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Property title',
    example: 'Modern Family Home with Garden',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    description: 'Property description',
    example: 'Beautiful 4-bedroom house with large backyard',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Address ID (reference to Address table)',
    example: 'cm123abc456',
  })
  @IsString()
  @IsNotEmpty()
  addressId!: string;

  @ApiPropertyOptional({
    description: 'Property type',
    enum: PropertyType,
    example: 'house',
  })
  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: string;

  @ApiPropertyOptional({
    description: 'Number of bedrooms',
    example: 4,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({
    description: 'Number of bathrooms',
    example: 2.5,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({
    description: 'Surface area in square meters',
    example: 250.5,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  surfaceArea?: number;

  @ApiPropertyOptional({
    description: 'Garden size in square meters',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  gardenSize?: number;

  @ApiPropertyOptional({
    description: 'Year the property was built',
    example: 2015,
  })
  @IsNumber()
  @IsOptional()
  @Min(1800)
  yearBuilt?: number;

  @ApiPropertyOptional({
    description: 'List of amenities',
    example: ['Pool', 'Garage', 'Garden', 'Fireplace'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  amenitiesList?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata (JSON)',
    example: { heating: 'gas', parking: 'garage' },
  })
  @IsOptional()
  metadata?: any;
}

export class UpdatePropertyDto {
  @ApiPropertyOptional({
    description: 'Property title',
    example: 'Updated Modern Family Home',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Property description',
    example: 'Updated description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Property type',
    enum: PropertyType,
  })
  @IsEnum(PropertyType)
  @IsOptional()
  propertyType?: string;

  @ApiPropertyOptional({
    description: 'Number of bedrooms',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  bedrooms?: number;

  @ApiPropertyOptional({
    description: 'Number of bathrooms',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  bathrooms?: number;

  @ApiPropertyOptional({
    description: 'Surface area in square meters',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  surfaceArea?: number;

  @ApiPropertyOptional({
    description: 'Garden size in square meters',
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  gardenSize?: number;

  @ApiPropertyOptional({
    description: 'Year the property was built',
  })
  @IsNumber()
  @IsOptional()
  @Min(1800)
  yearBuilt?: number;

  @ApiPropertyOptional({
    description: 'List of amenities',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  amenitiesList?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata (JSON)',
  })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Availability status',
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
