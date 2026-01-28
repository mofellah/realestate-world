import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@boilerplate/logger';
import crypto from 'crypto';

/**
 * PropertiesService - CRUD operations for properties
 * Properties are owned by users and linked to addresses
 * Supports filtering by location, type, and bedrooms
 */
@Injectable()
export class PropertiesService {
  private logger = new Logger('info', { service: 'PropertiesService' });

  constructor(private prisma: PrismaService) {}

  private getCorrelationId(): string {
    return crypto.randomUUID();
  }

  /**
   * Create property - requires user and address
   */
  async create(userId: string, data: any) {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      // Validate user
      const user = await this.prisma.user.findUnique({ 
        where: { id: userId },
        include: { person: true },
      });
      if (!user) throw new NotFoundException(`User not found`);
      if (!user.person) throw new BadRequestException('User person record missing');

      // Validate required fields
      if (!data.title || !data.addressId) {
        throw new BadRequestException('title and addressId required');
      }

      const property = await this.prisma.property.create({
        data: {
          title: data.title,
          description: data.description || null,
          addressId: data.addressId,
          ownerPersonId: user.person.id,
          userId,
          propertyType: data.propertyType || 'residential',
          bedrooms: data.bedrooms || null,
          bathrooms: data.bathrooms || null,
          surfaceArea: data.surfaceArea || null,
          gardenSize: data.gardenSize || null,
          yearBuilt: data.yearBuilt || null,
          amenitiesList: data.amenitiesList || [],
          metadata: data.metadata || null,
          isAvailable: true,
        },
        include: { address: true, user: true },
      });

      this.logger.info(`Property ${property.id} created by ${userId}`);
      return property;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      this.logger.error(`Property create failed: ${msg}`);
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
          orderBy: { createdAt: 'desc' },
          include: { address: true, user: true },
        }),
        this.prisma.property.count({ where: { userId } }),
      ]);

      return { properties, total };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      this.logger.error(`Property findByUser failed: ${msg}`);
      throw error;
    }
  }

  /**
   * Get single property (public)
   */
  async findById(id: string) {
    try {
      const property = await this.prisma.property.findUnique({
        where: { id },
        include: { address: true, user: true, listings: true },
      });

      if (!property) throw new NotFoundException('Property not found');
      return property;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      this.logger.error(`Property findById failed: ${msg}`);
      throw error;
    }
  }

  /**
   * Update property (owner only)
   */
  async update(id: string, userId: string, data: any) {
    const correlationId = this.getCorrelationId();
    this.logger.setCorrelationId(correlationId);

    try {
      const property = await this.prisma.property.findUnique({ where: { id } });
      if (!property) throw new NotFoundException('Property not found');
      if (property.userId !== userId) throw new ForbiddenException('Not owner');

      const updated = await this.prisma.property.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.bedrooms !== undefined && { bedrooms: data.bedrooms }),
          ...(data.bathrooms !== undefined && { bathrooms: data.bathrooms }),
          ...(data.surfaceArea !== undefined && { surfaceArea: data.surfaceArea }),
          ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
        },
        include: { address: true },
      });

      this.logger.info(`Property ${id} updated by ${userId}`);
      return updated;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
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
      if (!property) throw new NotFoundException('Property not found');
      if (property.userId !== userId) throw new ForbiddenException('Not owner');

      await this.prisma.property.delete({ where: { id } });

      this.logger.info(`Property ${id} deleted by ${userId}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      this.logger.error(`Property delete failed: ${msg}`);
      throw error;
    }
  }
}
