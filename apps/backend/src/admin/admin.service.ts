/**
 * Admin Service
 * Provides system-wide metrics and activity data.
 */

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const [totalUsers, totalProperties, totalListings, activeListings, paymentTerms] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.property.count(),
        this.prisma.listing.count(),
        this.prisma.listing.count({ where: { status: "published" } }),
        this.prisma.paymentTerms.findMany({
          where: {
            listings: { some: { status: "published" } },
          },
          include: { onetimePayment: true, periodicPayment: true },
        }),
      ]);

    const revenue = paymentTerms.reduce((sum: number, term: any) => {
      if (term.periodicPayment?.amountPerPeriod) {
        return sum + term.periodicPayment.amountPerPeriod;
      }
      if (term.onetimePayment?.amount) {
        return sum + term.onetimePayment.amount;
      }
      return sum;
    }, 0);

    return {
      totalUsers,
      totalProperties,
      totalListings,
      activeListings,
      revenue,
    };
  }

  async getActivity(limit = 10) {
    const [users, properties, listings] = await Promise.all([
      this.prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, createdAt: true },
      }),
      this.prisma.property.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, propertyType: true, createdAt: true },
      }),
      this.prisma.listing.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, type: true, createdAt: true },
      }),
    ]);

    const events = [
      ...users.map((user: any) => ({
        id: user.id,
        type: "user_registered",
        description: `New user: ${user.email}`,
        timestamp: user.createdAt,
      })),
      ...properties.map((property: any) => ({
        id: property.id,
        type: "property_created",
        description: `Property created: ${property.propertyType}`,
        timestamp: property.createdAt,
      })),
      ...listings.map((listing: any) => ({
        id: listing.id,
        type: "listing_published",
        description: `Listing created: ${listing.type}`,
        timestamp: listing.createdAt,
      })),
    ];

    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map((event) => ({
        ...event,
        timestamp: new Date(event.timestamp).toISOString(),
      }));
  }
}
