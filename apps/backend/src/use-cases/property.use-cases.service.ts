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
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    minBedrooms?: number;
    maxBedrooms?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    amenities?: string[];
    distanceMetric?: string;
    skip?: number;
    take?: number;
  }) {
    return this.propertiesService.search(filters);
  }

  async create(userId: string, data: CreatePropertyDto) {
    return this.propertiesService.create(userId, data);
  }
}
