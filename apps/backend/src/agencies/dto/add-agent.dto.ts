import { IsString, IsNotEmpty, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddAgentDto {
  @ApiProperty({ description: "User ID of agent to add" })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    description: "Agent role",
    enum: ["owner", "manager", "agent", "sales_manager", "support_agent"],
  })
  @IsEnum(["owner", "manager", "agent", "sales_manager", "support_agent"])
  role!: "owner" | "manager" | "agent" | "sales_manager" | "support_agent";
}
