import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { ListingsService } from "./listings.service";
import { ListingsController } from "./listings.controller";
import { ListingUseCasesService } from "../use-cases/listing.use-cases.service";

@Module({
  imports: [PrismaModule],
  controllers: [ListingsController],
  providers: [ListingsService, ListingUseCasesService],
  exports: [ListingsService, ListingUseCasesService],
})
export class ListingsModule {}
