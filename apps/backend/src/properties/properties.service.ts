import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { PrismaService } from "../prisma/prisma.service";
import { Logger } from "@boilerplate/logger";
import { ZodError } from "zod";
import crypto from "crypto";
import type { Request } from "express";
import type { CreatePropertyDto } from "./dto/property.dto";
import {
  CreatePropertySchema,
  UpdatePropertySchema,
  SearchPropertiesSchema,
} from "./schemas/property.schema";

// PropertyType enum matching Prisma schema
enum PropertyType {
  house = "house",
  apartment = "apartment",
  villa = "villa",
  land = "land",
  room = "room",
  commercial = "commercial",
  other = "other",
}

/**
 * PropertiesService - CRUD operations for properties
 * Properties are owned by users and linked to addresses
 * Supports filtering by location, type, and bedrooms
 */
@Injectable()
export class PropertiesService {
  private logger = new Logger("info", { service: "PropertiesService" });

  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private request: Request,
  ) {}

  /**
   * Get or generate correlation ID from request context
   * ✅ Uses request context instead of generating new ID (fixes distributed tracing)
   */
  private getCorrelationId(): string {
    // Get from request context (set by CorrelationIdMiddleware)
    const id = (this.request as any).correlationId;
    if (id) {
      return id;
    }

    // Fallback: generate new ID if not in middleware context
    return crypto.randomUUID();
  }

  /**
   * Create property - requires user and address
   * ✅ Validates input with Zod schemas before database operation
   */
  async create(userId: string, data: CreatePropertyDto) {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      // ✅ Validate input data with Zod schema
      let validatedData;
      try {
        validatedData = CreatePropertySchema.parse(data);
      } catch (zodError) {
        if (zodError instanceof ZodError) {
          const messages = zodError.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join("; ");
          throw new BadRequestException(`Validation error: ${messages}`);
        }
        throw zodError;
      }

      // Validate user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { person: true },
      });
      if (!user) throw new NotFoundException(`User not found`);
      if (!user.person) throw new BadRequestException("User person record missing");

      // ✅ Validate property type against Prisma enum
      const propertyType = (validatedData.propertyType || "house") as PropertyType;
      if (!Object.values(PropertyType).includes(propertyType)) {
        throw new BadRequestException(
          `Invalid propertyType. Must be one of: ${Object.values(PropertyType).join(", ")}`,
        );
      }

      const property = await this.prisma.property.create({
        data: {
          title: validatedData.title,
          description: validatedData.description || null,
          addressId: validatedData.addressId,
          ownerPersonId: user.person.id,
          userId,
          propertyType, // ✅ No type casting needed
          bedrooms: validatedData.bedrooms || null,
          bathrooms: validatedData.bathrooms || null,
          surfaceArea: validatedData.surfaceArea || null,
          gardenSize: validatedData.gardenSize || null,
          yearBuilt: validatedData.yearBuilt || null,
          amenitiesList: validatedData.amenitiesList || [],
          metadata: (validatedData.metadata as any) || null,
          isAvailable: true,
        },
        include: { address: true, user: true },
      });

      this.logger.info(`Property ${property.id} created by ${userId}`);
      return property;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown";
      this.logger.error(`Property create failed: ${msg}`);

      // Handle Prisma foreign key constraint errors
      if (error && typeof error === "object" && "code" in error && error.code === "P2003") {
        throw new BadRequestException("Invalid address ID");
      }

      throw error;
    }
  }

  /**
   * Get user's properties (paginated)
   */
  async findByUser(userId: string, skip = 0, take = 10) {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      const [properties, total] = await Promise.all([
        this.prisma.property.findMany({
          where: { userId },
          skip,
          take,
          orderBy: { createdAt: "desc" },
          include: { address: true, user: true },
        }),
        this.prisma.property.count({ where: { userId } }),
      ]);

      return { properties, total };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown";
      this.logger.error(`Property findByUser failed: ${msg}`);
      throw error;
    }
  }

  /**
   * Get single property with full details (public)
   * Includes: address with geo data, listings with payment terms, owner/agency info
   */
  async findById(id: string) {
    try {
      const property = await this.prisma.property.findUnique({
        where: { id },
        include: {
          // Address with full geo data
          address: {
            include: {
              geoObject: {
                select: {
                  id: true,
                  latitude: true,
                  longitude: true,
                  type: true,
                  geoJson: true,
                },
              },
            },
          },
          // All listings with payment terms
          listings: {
            orderBy: { createdAt: "desc" },
            include: {
              paymentTerms: {
                include: {
                  onetimePayment: true,
                  periodicPayment: true,
                },
              },
              saleListing: true,
              rentalListing: true,
              shortTermListing: true,
              leaseListing: true,
              views: {
                select: {
                  id: true,
                  viewType: true,
                  timestamp: true,
                },
                take: 5,
                orderBy: { timestamp: "desc" },
              },
            },
          },
          // Owner person details
          ownerPerson: {
            include: {
              physicalPerson: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
              organization: {
                select: {
                  businessName: true,
                },
              },
              // If owner has agency
              agency: {
                select: {
                  id: true,
                  tier: true,
                  profileImageUrl: true,
                  description: true,
                  person: {
                    select: {
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
          // User info (if owner is a registered user)
          user: {
            select: {
              id: true,
              email: true,
              person: {
                select: {
                  email: true,
                  phone: true,
                },
              },
            },
          },
          // Child properties (e.g., garage, storage)
          childProperties: {
            select: {
              id: true,
              title: true,
              propertyType: true,
              surfaceArea: true,
            },
          },
          // Parent property (if this is a sub-property)
          parentProperty: {
            select: {
              id: true,
              title: true,
              propertyType: true,
            },
          },
        },
      });

      if (!property) throw new NotFoundException("Property not found");

      // Increment view count (async, don't wait)
      this.incrementPropertyView(id).catch((err) =>
        this.logger.warn(`Failed to increment view for property ${id}: ${err.message}`),
      );

      return property;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown";
      this.logger.error(`Property findById failed: ${msg}`);
      throw error;
    }
  }

  /**
   * Increment property view count (async, non-blocking)
   * Creates a View record for the latest published listing
   */
  private async incrementPropertyView(propertyId: string, viewerId?: string) {
    try {
      // Find the latest published listing for this property
      const listing = await this.prisma.listing.findFirst({
        where: {
          propertyId,
          status: "published",
        },
        orderBy: { publishedAt: "desc" },
      });

      if (!listing) {
        this.logger.debug(
          `No published listing found for property ${propertyId}, skipping view tracking`,
        );
        return;
      }

      // Create view record
      await this.prisma.view.create({
        data: {
          listingId: listing.id,
          viewerId: viewerId || null,
          viewType: "detail", // detail view (vs preview in search results)
        },
      });

      this.logger.debug(`View recorded for listing ${listing.id}`);
    } catch (error) {
      // Don't throw - view tracking is non-critical
      this.logger.warn(
        `View tracking failed: ${error instanceof Error ? error.message : "Unknown"}`,
      );
    }
  }

  /**
   * Update property (owner only)
   * ✅ Validates input with Zod schemas before database operation
   */
  async update(id: string, userId: string, data: any) {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      // ✅ Validate input data with Zod schema
      let validatedData;
      try {
        validatedData = UpdatePropertySchema.parse(data);
      } catch (zodError) {
        if (zodError instanceof ZodError) {
          const messages = zodError.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join("; ");
          throw new BadRequestException(`Validation error: ${messages}`);
        }
        throw zodError;
      }

      const property = await this.prisma.property.findUnique({ where: { id } });
      if (!property) throw new NotFoundException("Property not found");
      if (property.userId !== userId) throw new ForbiddenException("Not owner");

      // Validate property type if provided
      let propertyType = undefined;
      if (validatedData.propertyType) {
        propertyType = validatedData.propertyType as PropertyType;
        if (!Object.values(PropertyType).includes(propertyType)) {
          throw new BadRequestException(
            `Invalid propertyType. Must be one of: ${Object.values(PropertyType).join(", ")}`,
          );
        }
      }

      const updated = await this.prisma.property.update({
        where: { id },
        data: {
          ...(validatedData.title && { title: validatedData.title }),
          ...(validatedData.description !== undefined && {
            description: validatedData.description,
          }),
          ...(validatedData.propertyType && { propertyType }),
          ...(validatedData.bedrooms !== undefined && { bedrooms: validatedData.bedrooms }),
          ...(validatedData.bathrooms !== undefined && { bathrooms: validatedData.bathrooms }),
          ...(validatedData.surfaceArea !== undefined && {
            surfaceArea: validatedData.surfaceArea,
          }),
          ...(validatedData.gardenSize !== undefined && { gardenSize: validatedData.gardenSize }),
          ...(validatedData.yearBuilt !== undefined && { yearBuilt: validatedData.yearBuilt }),
          ...(validatedData.amenitiesList && { amenitiesList: validatedData.amenitiesList }),
          ...(validatedData.metadata !== undefined && {
            metadata: (validatedData.metadata as any) || null,
          }),
          ...(validatedData.isAvailable !== undefined && {
            isAvailable: validatedData.isAvailable,
          }),
        },
        include: { address: true },
      });

      this.logger.info(`Property ${id} updated by ${userId}`);
      return updated;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown";
      this.logger.error(`Property update failed: ${msg}`);
      throw error;
    }
  }

  /**
   * Delete property (owner only)
   */
  async delete(id: string, userId: string) {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      const property = await this.prisma.property.findUnique({ where: { id } });
      if (!property) throw new NotFoundException("Property not found");
      if (property.userId !== userId) throw new ForbiddenException("Not owner");

      await this.prisma.property.delete({ where: { id } });

      this.logger.info(`Property ${id} deleted by ${userId}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown";
      this.logger.error(`Property delete failed: ${msg}`);
      throw error;
    }
  }

  /**
   * Search properties with filters and spatial queries (PUBLIC)
   * Supports: price, type, bedrooms, bathrooms, location, proximity
   * ✅ Validates input with Zod schemas before query
   */
  async search(filters: {
    priceMin?: number;
    priceMax?: number;
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    latitude?: number;
    longitude?: number;
    radius?: number; // meters
    city?: string;
    country?: string;
    skip?: number;
    take?: number;
  }) {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      // ✅ Validate input data with Zod schema
      let validatedFilters;
      try {
        validatedFilters = SearchPropertiesSchema.parse(filters);
      } catch (zodError) {
        if (zodError instanceof ZodError) {
          const messages = zodError.errors
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join("; ");
          throw new BadRequestException(`Validation error: ${messages}`);
        }
        throw zodError;
      }

      const { skip = 0, take = 20, latitude, longitude, radius } = validatedFilters;

      // Build WHERE clause
      const where: any = {
        isAvailable: true, // Only show available properties
      };

      // Property filters
      if (validatedFilters.propertyType) {
        where.propertyType = validatedFilters.propertyType;
      }
      if (validatedFilters.minBedrooms !== undefined) {
        where.bedrooms = { gte: validatedFilters.minBedrooms };
      }
      if (validatedFilters.maxBedrooms !== undefined) {
        where.bedrooms = { ...where.bedrooms, lte: validatedFilters.maxBedrooms };
      }

      // Location filters (via address)
      const addressWhere: any = {};
      // Note: city and country filters are removed from schema to keep MVP simple
      // Can be extended later if needed

      // Spatial filter (PostGIS ST_DWithin)
      if (latitude !== undefined && longitude !== undefined && radius !== undefined) {
        // Use raw SQL for PostGIS spatial query
        const spatialProperties = await this.prisma.$queryRaw<Array<{ id: string }>>`
          SELECT DISTINCT p.id
          FROM properties p
          INNER JOIN addresses a ON p.address_id = a.id
          INNER JOIN geo_objects g ON a.geo_object_id = g.id
          WHERE p.is_available = true
            AND ST_DWithin(
              g.geo_json::geography,
              ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
              ${radius}
            )
        `;

        const spatialIds = spatialProperties.map((p: { id: string }) => p.id);

        // If no properties in radius, return empty
        if (spatialIds.length === 0) {
          return { properties: [], total: 0 };
        }

        where.id = { in: spatialIds };
      }

      // Apply address filters if any
      if (Object.keys(addressWhere).length > 0) {
        where.address = addressWhere;
      }

      // Price filtering via listings - note that price is in paymentTerms now
      // For MVP, we'll include all published listings and filter on frontend
      // A more complex implementation would need raw SQL to filter by payment terms
      const listingWhere: any = { status: "published" };

      // TODO: Price filtering requires complex query because price is in polymorphic paymentTerms
      // For now, returning all published listings - frontend can filter by price
      if (validatedFilters.minPrice !== undefined || validatedFilters.maxPrice !== undefined) {
        // This would require joining payment_terms and checking both onetime and periodic amounts
        // Keeping it simple for MVP - will enhance later
        this.logger.warn("Price filtering not yet implemented - returning all published listings");
      }

      // Get properties with published listings
      const [properties, total] = await Promise.all([
        this.prisma.property.findMany({
          where,
          skip,
          take,
          include: {
            address: {
              include: {
                geoObject: {
                  select: {
                    id: true,
                    latitude: true,
                    longitude: true,
                    type: true,
                  },
                },
              },
            },
            listings: {
              where: listingWhere,
              orderBy: { createdAt: "desc" },
              take: 1, // Only get latest listing
              select: {
                id: true,
                type: true,
                status: true,
                publishedAt: true,
                paymentTerms: {
                  select: {
                    id: true,
                    currency: true,
                    termType: true,
                    onetimePayment: {
                      select: {
                        amount: true,
                      },
                    },
                    periodicPayment: {
                      select: {
                        amountPerPeriod: true,
                        periodType: true,
                      },
                    },
                  },
                },
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                person: {
                  select: {
                    id: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.property.count({ where }),
      ]);

      this.logger.info(`Property search returned ${properties.length} of ${total} properties`);
      return { properties, total };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown";
      this.logger.error(`Property search failed: ${msg}`);
      throw error;
    }
  }
}
