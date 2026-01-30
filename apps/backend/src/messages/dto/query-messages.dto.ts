import { IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class QueryMessagesDto {
  @ApiPropertyOptional({ description: 'Filter by thread ID' })
  @IsOptional()
  @IsUUID()
  threadId?: string;

  @ApiPropertyOptional({ description: 'Filter by read/unread status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ description: 'Filter by subject ID (property/listing)' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'Number of results to skip', default: 0 })
  @IsOptional()
  @Type(() => Number)
  skip?: number;

  @ApiPropertyOptional({ description: 'Number of results to return', default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  take?: number;
}
