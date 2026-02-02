/**
 * Listing Use-Cases
 * Centralizes listing business workflows
 */

import { Injectable } from "@nestjs/common";
import { ListingsService } from "../listings/listings.service";
import type {
  CreateListingDto,
  PublishListingDto,
  RenewListingDto,
} from "../listings/dto/listing.dto";

@Injectable()
export class ListingUseCasesService {
  constructor(private readonly listingsService: ListingsService) {}

  async create(userId: string, data: CreateListingDto) {
    return this.listingsService.create(userId, data);
  }

  async publish(userId: string, listingId: string, data: PublishListingDto) {
    return this.listingsService.publish(listingId, userId, data);
  }

  async pause(userId: string, listingId: string) {
    return this.listingsService.pause(listingId, userId);
  }

  async renew(userId: string, listingId: string, data: RenewListingDto) {
    return this.listingsService.renew(listingId, userId, data);
  }
}
