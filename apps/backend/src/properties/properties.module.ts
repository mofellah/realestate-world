import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MessagesModule } from "../messages/messages.module";
import { PropertiesService } from "./properties.service";
import { PropertiesController } from "./properties.controller";
import { PropertyUseCasesService } from "../use-cases/property.use-cases.service";
import { OwnerContactUseCasesService } from "../use-cases/owner-contact.use-cases.service";

@Module({
  imports: [PrismaModule, MessagesModule],
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertyUseCasesService, OwnerContactUseCasesService],
  exports: [PropertiesService, PropertyUseCasesService, OwnerContactUseCasesService],
})
export class PropertiesModule {}
