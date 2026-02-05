import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SearchBoundariesDto } from "./dto/search-boundaries.dto";
import { AutocompleteBoundariesDto } from "./dto/autocomplete-boundaries.dto";

export interface BoundaryWithType {
  id: string;
  name: string;
  nameSlug: string;
  boundaryType: {
    code: string;
    name: string;
    localName: string | null;
    level: number;
  };
  country_code: string;
  population: number | null;
  area_sqkm: number | null;
  centroidLat: number | null;
  centroidLon: number | null;
  isPopular: boolean;
  searchRank: number;
}

@Injectable()
export class BoundariesService {
  private readonly logger = new Logger(BoundariesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Autocomplete search for boundaries
   * Returns top matches sorted by popularity and search rank
   */
  async autocomplete(dto: AutocompleteBoundariesDto): Promise<BoundaryWithType[]> {
    const { query, country_code, typeCode, limit = 10 } = dto;

    this.logger.debug(
      `Autocomplete: query="${query}", country="${country_code}", type="${typeCode}"`,
    );

    const where: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { nameSlug: { contains: query.toLowerCase() } },
      ],
    };

    if (country_code) {
      where.country_code = country_code;
    }

    if (typeCode) {
      where.boundaryType = {
        code: typeCode,
      };
    }

    const boundaries = await this.prisma.boundary.findMany({
      where,
      select: {
        id: true,
        name: true,
        nameSlug: true,
        boundaryType: {
          select: {
            code: true,
            name: true,
            localName: true,
            level: true,
          },
        },
        country_code: true,
        population: true,
        area_sqkm: true,
        centroidLat: true,
        centroidLon: true,
        isPopular: true,
        searchRank: true,
      },
      orderBy: [
        { isPopular: "desc" },
        { searchRank: "desc" },
        { population: { sort: "desc", nulls: "last" } },
      ],
      take: limit,
    });

    return boundaries;
  }

  /**
   * Search boundaries with filters
   */
  async search(dto: SearchBoundariesDto): Promise<BoundaryWithType[]> {
    const {
      name,
      typeCode,
      country_code,
      minLat,
      maxLat,
      minLon,
      maxLon,
      lat,
      lon,
      radius = 50,
      limit = 50,
    } = dto;

    const where: any = {};

    // Text search
    if (name) {
      where.OR = [
        { name: { contains: name, mode: "insensitive" } },
        { nameSlug: { contains: name.toLowerCase() } },
      ];
    }

    // Type filter
    if (typeCode) {
      where.boundaryType = {
        code: typeCode,
      };
    }

    // Country filter
    if (country_code) {
      where.country_code = country_code;
    }

    // Bounding box filter
    if (
      minLat !== undefined &&
      maxLat !== undefined &&
      minLon !== undefined &&
      maxLon !== undefined
    ) {
      where.AND = [
        { centroidLat: { gte: minLat, lte: maxLat } },
        { centroidLon: { gte: minLon, lte: maxLon } },
      ];
    }

    // Proximity search (approximate using bounding box)
    if (lat !== undefined && lon !== undefined) {
      // Calculate approximate bounding box for radius (in km)
      // 1 degree latitude ≈ 111 km
      // 1 degree longitude ≈ 111 km * cos(latitude)
      const latDelta = radius / 111;
      const lonDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

      where.AND = [
        { centroidLat: { gte: lat - latDelta, lte: lat + latDelta } },
        { centroidLon: { gte: lon - lonDelta, lte: lon + lonDelta } },
      ];
    }

    const boundaries = await this.prisma.boundary.findMany({
      where,
      select: {
        id: true,
        name: true,
        nameSlug: true,
        boundaryType: {
          select: {
            code: true,
            name: true,
            localName: true,
            level: true,
          },
        },
        country_code: true,
        population: true,
        area_sqkm: true,
        centroidLat: true,
        centroidLon: true,
        isPopular: true,
        searchRank: true,
      },
      orderBy: [{ isPopular: "desc" }, { searchRank: "desc" }],
      take: limit,
    });

    // If proximity search, calculate actual distances and re-sort
    if (lat !== undefined && lon !== undefined) {
      const boundariesWithDistance = boundaries.map((b) => ({
        ...b,
        distance: this.calculateDistance(lat, lon, b.centroidLat!, b.centroidLon!),
      }));

      return boundariesWithDistance
        .filter((b) => b.distance <= radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);
    }

    return boundaries;
  }

  /**
   * Get boundary by ID with full details
   */
  async findById(id: string) {
    return this.prisma.boundary.findUnique({
      where: { id },
      include: {
        boundaryType: true,
        parent: {
          select: {
            id: true,
            name: true,
            nameSlug: true,
            boundaryType: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            nameSlug: true,
            boundaryType: {
              select: {
                code: true,
                name: true,
              },
            },
          },
          take: 100,
        },
      },
    });
  }

  /**
   * Get popular boundaries (featured on homepage, etc.)
   */
  async getPopular(country_code?: string, limit = 20) {
    const where: any = { isPopular: true };
    if (country_code) {
      where.country_code = country_code;
    }

    return this.prisma.boundary.findMany({
      where,
      select: {
        id: true,
        name: true,
        nameSlug: true,
        boundaryType: {
          select: {
            code: true,
            name: true,
            localName: true,
          },
        },
        country_code: true,
        population: true,
        centroidLat: true,
        centroidLon: true,
        searchRank: true,
      },
      orderBy: { searchRank: "desc" },
      take: limit,
    });
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
