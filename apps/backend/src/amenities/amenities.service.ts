import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SearchAmenitiesDto } from "./dto/search-amenities.dto";
import { AutocompleteAmenitiesDto } from "./dto/autocomplete-amenities.dto";
import { AmenityTypeEnum } from "@prisma/client";

export interface AmenityWithLocation {
  id: string;
  name: string;
  type: AmenityTypeEnum;
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  geoObject: {
    latitude: number | null;
    longitude: number | null;
  };
  distance?: number;
}

@Injectable()
export class AmenitiesService {
  private readonly logger = new Logger(AmenitiesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Autocomplete search for amenities
   */
  async autocomplete(dto: AutocompleteAmenitiesDto): Promise<AmenityWithLocation[]> {
    const { query, type, city, limit = 10 } = dto;

    this.logger.debug(`Autocomplete: query="${query}", type="${type}", city="${city}"`);

    const where: any = {
      name: { contains: query, mode: "insensitive" },
    };

    if (type) {
      where.type = type;
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    const amenities = await this.prisma.amenity.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        city: true,
        phone: true,
        website: true,
        openingHours: true,
        geoObject: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: [{ name: "asc" }],
      take: limit,
    });

    return amenities;
  }

  /**
   * Search amenities with filters and proximity
   */
  async search(dto: SearchAmenitiesDto): Promise<AmenityWithLocation[]> {
    const {
      name,
      type,
      types,
      city,
      lat,
      lon,
      radius = 5,
      minLat,
      maxLat,
      minLon,
      maxLon,
      limit = 50,
    } = dto;

    const where: any = {};

    // Text search
    if (name) {
      where.name = { contains: name, mode: "insensitive" };
    }

    // Type filter (single or multiple)
    if (type) {
      where.type = type;
    } else if (types && types.length > 0) {
      where.type = { in: types };
    }

    // City filter
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    const amenities = await this.prisma.amenity.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        city: true,
        phone: true,
        website: true,
        openingHours: true,
        geoObject: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
      take: limit * 2, // Fetch extra for distance filtering
    });

    // Filter by bounding box if provided
    let filteredAmenities = amenities;
    if (
      minLat !== undefined &&
      maxLat !== undefined &&
      minLon !== undefined &&
      maxLon !== undefined
    ) {
      filteredAmenities = amenities.filter(
        (a) =>
          a.geoObject.latitude !== null &&
          a.geoObject.longitude !== null &&
          a.geoObject.latitude >= minLat &&
          a.geoObject.latitude <= maxLat &&
          a.geoObject.longitude >= minLon &&
          a.geoObject.longitude <= maxLon,
      );
    }

    // If proximity search, calculate actual distances and filter
    if (lat !== undefined && lon !== undefined) {
      const amenitiesWithDistance = filteredAmenities
        .filter(
          (amenity) => amenity.geoObject.latitude !== null && amenity.geoObject.longitude !== null,
        )
        .map((amenity) => ({
          ...amenity,
          distance: this.calculateDistance(
            lat,
            lon,
            amenity.geoObject.latitude!,
            amenity.geoObject.longitude!,
          ),
        }))
        .filter((amenity) => amenity.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      return amenitiesWithDistance;
    }

    return filteredAmenities.slice(0, limit);
  }

  /**
   * Get amenity by ID
   */
  async findById(id: string) {
    return this.prisma.amenity.findUnique({
      where: { id },
      include: {
        geoObject: true,
      },
    });
  }

  /**
   * Get amenities by type
   */
  async findByType(type: AmenityTypeEnum, limit = 100) {
    return this.prisma.amenity.findMany({
      where: { type },
      include: {
        geoObject: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
      },
      take: limit,
    });
  }

  /**
   * Get amenity statistics
   */
  async getStatistics() {
    const counts = await this.prisma.amenity.groupBy({
      by: ["type"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    return counts.map((c) => ({
      type: c.type,
      count: c._count.id,
    }));
  }

  /**
   * Haversine distance calculation (in kilometers)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
