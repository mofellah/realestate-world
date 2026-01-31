/**
 * Listing Use-Cases
 * Centralizes listing business workflows
 */

import { Injectable } from "@nestjs/common";
import { ListingsService } from "../listings/listings.service";
import type { CreateListingDto } from "../listings/dto/listing.dto";

@Injectable()
export class ListingUseCasesService {
  constructor(private readonly listingsService: ListingsService) {}

  async create(userId: string, data: CreateListingDto) {
    return this.listingsService.create(userId, data);
  }
}
