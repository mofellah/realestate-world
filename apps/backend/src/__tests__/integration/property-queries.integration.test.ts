/**
 * Property Queries Integration Tests
 * NOTE: Requires test database connection - SKIPPED
 */

import { PrismaClient } from '@prisma/client';
import {
  geoObjectsFixture,
  addressesFixture,
  personsFixture,
  usersFixture,
  propertiesFixture,
} from '../fixtures/test.fixtures';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_TEST_URL,
});

describe.skip('Property Query Integration Tests - Requires Database', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();
    await prisma.person.deleteMany();
    await prisma.address.deleteMany();
    await prisma.geoObject.deleteMany();
  });

  describe('Basic Property Queries', () => {
    it('should filter properties by type', async () => {
      // Create test data
      const geo = await prisma.geoObject.create({ data: geoObjectsFixture.brussels_center });
      const addr = await prisma.address.create({ data: { ...addressesFixture.brussels_apartment, geoObjectId: geo.id } });
      const person = await prisma.person.create({ data: personsFixture.property_owner });
      const user = await prisma.user.create({ data: usersFixture.property_lister });

      // Create apartment
      await prisma.property.create({
        data: {
          ...propertiesFixture.apartment_brussels,
          propertyType: 'apartment',
          addressId: addr.id,
          ownerPersonId: person.id,
          userId: user.id,
        },
      });

      // Create house
      const geo2 = await prisma.geoObject.create({ data: geoObjectsFixture.ghent_center });
      const addr2 = await prisma.address.create({ data: { ...addressesFixture.ghent_house, geoObjectId: geo2.id } });
      await prisma.property.create({
        data: {
          ...propertiesFixture.house_ghent,
          propertyType: 'house',
          addressId: addr2.id,
          ownerPersonId: person.id,
          userId: user.id,
        },
      });

      // Query apartments only
      const apartments = await prisma.property.findMany({
        where: { propertyType: 'apartment' },
      });

      expect(apartments).toHaveLength(1);
      expect(apartments[0].propertyType).toBe('apartment');
    });

    it('should filter by bedrooms count', async () => {
      const geo = await prisma.geoObject.create({ data: geoObjectsFixture.brussels_center });
      const addr = await prisma.address.create({ data: { ...addressesFixture.brussels_apartment, geoObjectId: geo.id } });
      const person = await prisma.person.create({ data: personsFixture.property_owner });
      const user = await prisma.user.create({ data: usersFixture.property_lister });

      // 2-bedroom apartment
      await prisma.property.create({
        data: {
          ...propertiesFixture.apartment_brussels,
          bedrooms: 2,
          addressId: addr.id,
          ownerPersonId: person.id,
          userId: user.id,
        },
      });

      // Studio (0 bedrooms)
      const geo2 = await prisma.geoObject.create({ data: geoObjectsFixture.antwerp_center });
      const addr2 = await prisma.address.create({ data: { ...addressesFixture.antwerp_studio, geoObjectId: geo2.id } });
      await prisma.property.create({
        data: {
          ...propertiesFixture.studio_antwerp,
          bedrooms: 0,
          addressId: addr2.id,
          ownerPersonId: person.id,
          userId: user.id,
        },
      });

      // Query 2+ bedrooms
      const largePlaces = await prisma.property.findMany({
        where: { bedrooms: { gte: 2 } },
      });

      expect(largePlaces).toHaveLength(1);
      expect(largePlaces[0].bedrooms).toBe(2);
    });
  });

  describe('Geographic Queries', () => {
    it('should query properties by city', async () => {
      const geo = await prisma.geoObject.create({ data: geoObjectsFixture.brussels_center });
      const addr = await prisma.address.create({ data: { ...addressesFixture.brussels_apartment, geoObjectId: geo.id } });
      const person = await prisma.person.create({ data: personsFixture.property_owner });
      const user = await prisma.user.create({ data: usersFixture.property_lister });

      await prisma.property.create({
        data: {
          ...propertiesFixture.apartment_brussels,
          addressId: addr.id,
          ownerPersonId: person.id,
          userId: user.id,
        },
      });

      // Query via address relation
      const brusselsProperties = await prisma.property.findMany({
        where: {
          address: { city: 'Brussels' },
        },
        include: { address: true },
      });

      expect(brusselsProperties).toHaveLength(1);
      expect(brusselsProperties[0].address.city).toBe('Brussels');
    });

    it('should query properties with coordinates', async () => {
      const geo = await prisma.geoObject.create({ data: geoObjectsFixture.brussels_center });
      const addr = await prisma.address.create({ data: { ...addressesFixture.brussels_apartment, geoObjectId: geo.id } });
      const person = await prisma.person.create({ data: personsFixture.property_owner });
      const user = await prisma.user.create({ data: usersFixture.property_lister });

      await prisma.property.create({
        data: {
          ...propertiesFixture.apartment_brussels,
          addressId: addr.id,
          ownerPersonId: person.id,
          userId: user.id,
        },
      });

      // Query properties with geoObjects that have coordinates
      const propertiesWithCoords = await prisma.property.findMany({
        where: {
          address: {
            geoObject: {
              latitude: { not: null },
              longitude: { not: null },
            },
          },
        },
        include: {
          address: {
            include: { geoObject: true },
          },
        },
      });

      expect(propertiesWithCoords).toHaveLength(1);
      expect(propertiesWithCoords[0].address.geoObject?.latitude).toBe(50.8503);
    });
  });

  describe('Complex Filtering', () => {
    it('should combine multiple filters', async () => {
      const geo = await prisma.geoObject.create({ data: geoObjectsFixture.brussels_center });
      const addr = await prisma.address.create({ data: { ...addressesFixture.brussels_apartment, geoObjectId: geo.id } });
      const person = await prisma.person.create({ data: personsFixture.property_owner });
      const user = await prisma.user.create({ data: usersFixture.property_lister });

      // 2-bedroom apartment in Brussels
      await prisma.property.create({
        data: {
          ...propertiesFixture.apartment_brussels,
          propertyType: 'apartment',
          bedrooms: 2,
          surfaceArea: 65,
          addressId: addr.id,
          ownerPersonId: person.id,
          userId: user.id,
        },
      });

      // Query: apartment, 2+ bedrooms, >60m²
      const results = await prisma.property.findMany({
        where: {
          AND: [
            { propertyType: 'apartment' },
            { bedrooms: { gte: 2 } },
            { surfaceArea: { gt: 60 } },
          ],
        },
      });

      expect(results).toHaveLength(1);
      expect(results[0].bedrooms).toBe(2);
    });
  });

  describe('Pagination', () => {
    it('should paginate results', async () => {
      const geo = await prisma.geoObject.create({ data: geoObjectsFixture.brussels_center });
      const addr = await prisma.address.create({ data: { ...addressesFixture.brussels_apartment, geoObjectId: geo.id } });
      const person = await prisma.person.create({ data: personsFixture.property_owner });
      const user = await prisma.user.create({ data: usersFixture.property_lister });

      // Create 5 properties
      for (let i = 0; i < 5; i++) {
        await prisma.property.create({
          data: {
            ...propertiesFixture.apartment_brussels,
            title: `Property ${i + 1}`,
            addressId: addr.id,
            ownerPersonId: person.id,
            userId: user.id,
          },
        });
      }

      // Page 1 (first 2)
      const page1 = await prisma.property.findMany({
        take: 2,
        skip: 0,
        orderBy: { createdAt: 'asc' },
      });

      // Page 2 (next 2)
      const page2 = await prisma.property.findMany({
        take: 2,
        skip: 2,
        orderBy: { createdAt: 'asc' },
      });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });
});
