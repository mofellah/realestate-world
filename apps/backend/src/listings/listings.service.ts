import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@boilerplate/logger';
import { Prisma } from '@prisma/client';
import crypto from 'crypto';

/**
 * ListingsService - CRUD operations for property listings
 * Listings are created for properties and are owned by the property owner
 * Supports multiple listing types: sale, rental, short_term, lease
 */
@Injectable()
export class ListingsService {
  private logger = new Logger('info', { service: 'ListingsService' });

  constructor(private prisma: PrismaService) {}

  private getCorrelationId(): string {
    return crypto.randomUUID();
  }

  /**
   * Create listing for property - requires user to own the property
   */
  async create(userId: string, data: any) {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      // Validate required fields first
      if (!data.propertyId || !data.type || !data.paymentTermsId) {
        throw new BadRequestException('propertyId, type, and paymentTermsId required');
      }

      // Validate property exists
      const property = await this.prisma.property.findUnique({
        where: { id: data.propertyId },
      });
      if (!property) throw new NotFoundException('Property not found');

      // Validate user owns the property
      if (property.userId !== userId) {
        throw new ForbiddenException('Not owner of property');
      }

      const listing = await this.prisma.listing.create({
        data: {
          type: data.type,
          propertyId: data.propertyId,
          createdBy: userId,
          paymentTermsId: data.paymentTermsId,
          status: data.status || 'draft',
          visibilityStart: data.visibilityStart || null,
          visibilityEnd: data.visibilityEnd || null,
          visibilityDays: data.visibilityDays || null,
        },
        include: { property: true, creator: true, paymentTerms: true },
      });

      this.logger.info(`Listing ${listing.id} created by ${userId}`);
      return listing;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      this.logger.error(`Listing create failed: ${msg}`);
      
      // Handle Prisma foreign key constraint errors
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new BadRequestException('Invalid paymentTermsId or propertyId');
      }
      
      throw error;
    }
  }

  /**
   * Get user's listings (paginated) - returns listings for user's properties
   */
  async findByUser(userId: string, skip = 0, take = 10) {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      const [listings, total] = await Promise.all([
        this.prisma.listing.findMany({
          where: {
            createdBy: userId,
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { property: true, creator: true, paymentTerms: true },
        }),
        this.prisma.listing.count({
          where: { createdBy: userId },
        }),
      ]);

      return { listings, total };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      this.logger.error(`Listing findByUser failed: ${msg}`);
      throw error;
    }
  }

  /**
   * Get single listing by ID (public)
   */
  async findById(id: string) {
    try {
      const listing = await this.prisma.listing.findUnique({
        where: { id },
        include: { property: true, creator: true, paymentTerms: true },
      });

      if (!listing) throw new NotFoundException('Listing not found');
      return listing;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      this.logger.error(`Listing findById failed: ${msg}`);
      throw error;
    }
  }

  /**
   * Update listing (owner only)
   */
  async update(id: string, userId: string, data: any) {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      const listing = await this.prisma.listing.findUnique({
        where: { id },
      });
      if (!listing) throw new NotFoundException('Listing not found');
      if (listing.createdBy !== userId) {
        throw new ForbiddenException('Not owner');
      }

      const updated = await this.prisma.listing.update({
        where: { id },
        data: {
          ...(data.status !== undefined && { status: data.status }),
          ...(data.visibilityStart !== undefined && { visibilityStart: data.visibilityStart }),
          ...(data.visibilityEnd !== undefined && { visibilityEnd: data.visibilityEnd }),
          ...(data.visibilityDays !== undefined && { visibilityDays: data.visibilityDays }),
        },
        include: { property: true, creator: true, paymentTerms: true },
      });

      this.logger.info(`Listing ${id} updated by ${userId}`);
      return updated;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      this.logger.error(`Listing update failed: ${msg}`);
      throw error;
    }
  }

  /**
   * Delete listing (owner only)
   */
  async delete(id: string, userId: string): Promise<void> {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      const listing = await this.prisma.listing.findUnique({
        where: { id },
      });
      if (!listing) throw new NotFoundException('Listing not found');
      if (listing.createdBy !== userId) {
        throw new ForbiddenException('Not owner');
      }

      await this.prisma.listing.delete({ where: { id } });

      this.logger.info(`Listing ${id} deleted by ${userId}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      this.logger.error(`Listing delete failed: ${msg}`);
      throw error;
    }
  }
}
