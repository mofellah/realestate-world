import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMessageDto {
  @ApiProperty({ description: "Recipient user ID" })
  @IsUUID()
  @IsNotEmpty()
  recipientId!: string;

  @ApiPropertyOptional({ description: "Subject ID (property/listing reference)" })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ description: "Thread ID for conversation grouping" })
  @IsOptional()
  @IsUUID()
  threadId?: string;

  @ApiPropertyOptional({ description: "Message subject line", maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject_line?: string;

  @ApiProperty({ description: "Message body", maxLength: 5000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  body!: string;

  @ApiPropertyOptional({
    description: "Message type (defaults to inquiry)",
    enum: ["inquiry", "followup", "notification", "system"],
  })
  @IsOptional()
  @IsString()
  messageType?: "inquiry" | "followup" | "notification" | "system";
}
