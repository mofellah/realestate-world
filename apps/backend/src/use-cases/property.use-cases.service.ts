/**
 * Property Use-Cases
 * Centralizes property business workflows
 */

import { Injectable } from "@nestjs/common";
import { PropertiesService } from "../properties/properties.service";
import type { CreatePropertyDto } from "../properties/dto/property.dto";

@Injectable()
export class PropertyUseCasesService {
  constructor(private readonly propertiesService: PropertiesService) {}

  async search(filters: {
    priceMin?: number;
    priceMax?: number;
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    city?: string;
    country?: string;
    skip?: number;
    take?: number;
  }) {
    return this.propertiesService.search(filters);
  }

  async create(userId: string, data: CreatePropertyDto) {
    return this.propertiesService.create(userId, data);
  }
}
