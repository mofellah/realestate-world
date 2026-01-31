/**
 * Contact Owner DTO
 */

import { IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ContactOwnerDto {
  @ApiProperty({ description: "Message subject line" })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  subjectLine!: string;

  @ApiProperty({ description: "Message body" })
  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  body!: string;
}
