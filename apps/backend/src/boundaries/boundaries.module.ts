import { Module } from "@nestjs/common";
import { BoundariesController } from "./boundaries.controller";
import { BoundariesService } from "./boundaries.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [BoundariesController],
  providers: [BoundariesService],
  exports: [BoundariesService],
})
export class BoundariesModule {}
