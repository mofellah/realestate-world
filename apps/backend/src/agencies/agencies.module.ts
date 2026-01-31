import { Module } from "@nestjs/common";
import { AgenciesService } from "./agencies.service";
import { AgenciesController } from "./agencies.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { logger } from "@boilerplate/logger";

@Module({
  imports: [PrismaModule],
  controllers: [AgenciesController],
  providers: [AgenciesService, { provide: "LOGGER", useValue: logger }],
  exports: [AgenciesService],
})
export class AgenciesModule {}
