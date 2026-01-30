import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { AddAgentDto } from './dto/add-agent.dto';
import type { Logger } from 'winston';

@Injectable()
export class AgenciesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('LOGGER') private readonly logger: Logger,
  ) {}

  /**
   * Create a new agency
   */
  async create(userId: string, dto: CreateAgencyDto) {
    try {
      // Verify person exists and user owns it
      const person = await this.prisma.person.findUnique({
        where: { id: dto.personId },
        include: { organization: true },
      });

      if (!person) {
        throw new NotFoundException('Person not found');
      }

      if (!person.organization) {
        throw new BadRequestException('Person must be an organization to create agency');
      }

      // Check if agency already exists for this person
      const existing = await this.prisma.agency.findUnique({
        where: { personId: dto.personId },
      });

      if (existing) {
        throw new BadRequestException('Agency already exists for this person');
      }

      // Create agency
      const agency = await this.prisma.agency.create({
        data: {
          personId: dto.personId,
          tier: (dto.tier as any) || 'basic',
          profileImageUrl: dto.profileImageUrl,
          description: dto.description,
          maxAgents: dto.maxAgents || 5,
          maxListings: dto.maxListings || 50,
        },
        include: {
          person: {
            include: {
              organization: true,
            },
          },
          employees: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  person: {
                    select: {
                      physicalPerson: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      this.logger.info(`Agency created: ${agency.id} for person ${dto.personId}`);
      return agency;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create agency: ${msg}`);
      throw error;
    }
  }

  /**
   * Get agency by ID
   */
  async findOne(id: string) {
    try {
      const agency = await this.prisma.agency.findUnique({
        where: { id },
        include: {
          person: {
            include: {
              organization: true,
            },
          },
          employees: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  person: {
                    select: {
                      physicalPerson: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!agency) {
        throw new NotFoundException('Agency not found');
      }

      return agency;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch agency ${id}: ${msg}`);
      throw error;
    }
  }

  /**
   * Update agency (admin only)
   */
  async update(id: string, userId: string, dto: UpdateAgencyDto) {
    try {
      // Verify agency exists and user has admin access
      const agency = await this.prisma.agency.findUnique({
        where: { id },
        include: {
          employees: {
            where: { userId, role: 'owner' },
          },
        },
      });

      if (!agency) {
        throw new NotFoundException('Agency not found');
      }

      if (agency.employees.length === 0) {
        throw new ForbiddenException('Only agency owners can update agency');
      }

      // Update agency
      const updated = await this.prisma.agency.update({
        where: { id },
        data: {
          ...(dto.tier && { tier: dto.tier as any }),
          ...(dto.profileImageUrl !== undefined && { profileImageUrl: dto.profileImageUrl }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.maxAgents && { maxAgents: dto.maxAgents }),
          ...(dto.maxListings && { maxListings: dto.maxListings }),
        },
        include: {
          person: {
            include: {
              organization: true,
            },
          },
        },
      });

      this.logger.info(`Agency updated: ${id}`);
      return updated;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update agency ${id}: ${msg}`);
      throw error;
    }
  }

  /**
   * Add agent to agency
   */
  async addAgent(id: string, adminUserId: string, dto: AddAgentDto) {
    try {
      // Verify agency exists and admin has permission
      const agency = await this.prisma.agency.findUnique({
        where: { id },
        include: {
          employees: true,
        },
      });

      if (!agency) {
        throw new NotFoundException('Agency not found');
      }

      const adminRole = agency.employees.find(e => e.userId === adminUserId && (e.role === 'owner' || e.role === 'manager'));
      if (!adminRole) {
        throw new ForbiddenException('Only agency owners/managers can add agents');
      }

      // Check max agents limit
      if (agency.employees.length >= agency.maxAgents) {
        throw new BadRequestException(`Agency has reached maximum agent limit (${agency.maxAgents})`);
      }

      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if already an employee
      const existing = agency.employees.find(e => e.userId === dto.userId);
      if (existing) {
        throw new BadRequestException('User is already an employee of this agency');
      }

      // Create agency role
      const agencyRole = await this.prisma.agencyRole.create({
        data: {
          userId: dto.userId,
          agencyId: id,
          role: dto.role as any,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              person: {
                select: {
                  physicalPerson: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      this.logger.info(`Agent ${dto.userId} added to agency ${id} with role ${dto.role}`);
      return agencyRole;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to add agent to agency ${id}: ${msg}`);
      throw error;
    }
  }

  /**
   * Remove agent from agency
   */
  async removeAgent(id: string, adminUserId: string, agentUserId: string) {
    try {
      // Verify agency exists and admin has permission
      const agency = await this.prisma.agency.findUnique({
        where: { id },
        include: {
          employees: true,
        },
      });

      if (!agency) {
        throw new NotFoundException('Agency not found');
      }

      const adminRole = agency.employees.find(e => e.userId === adminUserId && (e.role === 'owner' || e.role === 'manager'));
      if (!adminRole) {
        throw new ForbiddenException('Only agency owners/managers can remove agents');
      }

      // Find agent role
      const agentRole = agency.employees.find(e => e.userId === agentUserId);
      if (!agentRole) {
        throw new NotFoundException('Agent not found in agency');
      }

      // Can't remove the last owner
      const owners = agency.employees.filter(e => e.role === 'owner');
      if (owners.length === 1 && agentRole.role === 'owner') {
        throw new BadRequestException('Cannot remove the last owner from agency');
      }

      // Remove role
      await this.prisma.agencyRole.delete({
        where: { id: agentRole.id },
      });

      this.logger.info(`Agent ${agentUserId} removed from agency ${id}`);
      return { message: 'Agent removed successfully' };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to remove agent from agency ${id}: ${msg}`);
      throw error;
    }
  }

  /**
   * Get agency listings portfolio
   */
  async getPortfolio(id: string, skip = 0, take = 20) {
    try {
      const agency = await this.prisma.agency.findUnique({
        where: { id },
        include: {
          employees: {
            select: { userId: true },
          },
        },
      });

      if (!agency) {
        throw new NotFoundException('Agency not found');
      }

      // Get all employee user IDs
      const employeeIds = agency.employees.map(e => e.userId);

      // Get properties owned by agency employees
      const [properties, total] = await Promise.all([
        this.prisma.property.findMany({
          where: {
            userId: { in: employeeIds },
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            address: true,
            listings: {
              where: { status: 'published' },
              orderBy: { publishedAt: 'desc' },
              take: 1,
              include: {
                paymentTerms: {
                  include: {
                    onetimePayment: true,
                    periodicPayment: true,
                  },
                },
              },
            },
          },
        }),
        this.prisma.property.count({
          where: {
            userId: { in: employeeIds },
          },
        }),
      ]);

      return { properties, total };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch agency portfolio ${id}: ${msg}`);
      throw error;
    }
  }
}
