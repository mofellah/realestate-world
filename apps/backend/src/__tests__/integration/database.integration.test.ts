/**
 * Database Integration Tests
 * NOTE: Requires test database connection - SKIPPED
 */

import { PrismaClient } from "@prisma/client";
import {
  geoObjectsFixture,
  addressesFixture,
  personsFixture,
  usersFixture,
  propertiesFixture,
} from "../fixtures/test.fixtures";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_TEST_URL,
});

describe.skip("Database Integration Tests - Requires Database", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test (reverse dependency order)
    await prisma.saleListing.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.property.deleteMany();
    await prisma.onetimePaymentTerm.deleteMany();
    await prisma.paymentTerms.deleteMany();
    await prisma.user.deleteMany();
    await prisma.physicalPerson.deleteMany();
    await prisma.person.deleteMany();
    await prisma.address.deleteMany();
    await prisma.geoObject.deleteMany();
  });

  describe("Full Property Chain Creation", () => {
    it("should create property with address and geoobject", async () => {
      // Create GeoObject
      const geoObject = await prisma.geoObject.create({
        data: geoObjectsFixture.brussels_center,
      });

      // Create Address with GeoObject
      const address = await prisma.address.create({
        data: {
          ...addressesFixture.brussels_apartment,
          geoObjectId: geoObject.id,
        },
      });

      // Create Person (base)
      const person = await prisma.person.create({
        data: personsFixture.property_owner,
      });

      // Create User (no person link to simplify)
      const user = await prisma.user.create({
        data: usersFixture.property_lister,
      });

      // Create Property
      const property = await prisma.property.create({
        data: {
          ...propertiesFixture.apartment_brussels,
          addressId: address.id,
          ownerPersonId: person.id,
          userId: user.id,
        },
      });

      // Verify complete chain
      expect(property.id).toBeDefined();
      expect(property.addressId).toBe(address.id);
      expect(property.userId).toBe(user.id);
      expect(property.ownerPersonId).toBe(person.id);
    });

    it("should query property with all relationships", async () => {
      // Create chain
      const geoObject = await prisma.geoObject.create({ data: geoObjectsFixture.brussels_center });
      const address = await prisma.address.create({
        data: { ...addressesFixture.brussels_apartment, geoObjectId: geoObject.id },
      });
      const person = await prisma.person.create({ data: personsFixture.property_owner });
      const user = await prisma.user.create({ data: usersFixture.property_lister });
      const property = await prisma.property.create({
        data: {
          ...propertiesFixture.apartment_brussels,
          addressId: address.id,
          ownerPersonId: person.id,
          userId: user.id,
        },
      });

      // Query with relations
      const propertyWithRelations = await prisma.property.findUnique({
        where: { id: property.id },
        include: {
          address: {
            include: {
              geoObject: true,
            },
          },
          user: true,
          ownerPerson: true,
        },
      });

      expect(propertyWithRelations).toBeDefined();
      expect(propertyWithRelations?.address.streetName).toBe("Rue de la Paix");
      expect(propertyWithRelations?.address.geoObject?.latitude).toBe(50.8503);
      expect(propertyWithRelations?.user?.email).toBe("lister@test.com");
      expect(propertyWithRelations?.ownerPerson?.email).toBe("owner@realestate.com");
    });
  });

  describe("Transaction Safety", () => {
    it("should rollback on error", async () => {
      try {
        await prisma.$transaction(async (tx) => {
          // Create valid geoObject
          await tx.geoObject.create({ data: geoObjectsFixture.brussels_center });

          // This should fail (duplicate email)
          await tx.person.create({ data: personsFixture.john_doe });
          await tx.person.create({ data: personsFixture.john_doe }); // Duplicate!
        });
        fail("Transaction should have thrown an error");
      } catch (error) {
        // Expected to throw
      }

      // Verify nothing was committed
      const count = await prisma.geoObject.count();
      expect(count).toBe(0);
    });
  });

  describe("Unique Constraints", () => {
    it("should enforce unique email on users", async () => {
      await prisma.user.create({ data: usersFixture.regular_user });

      await expect(prisma.user.create({ data: usersFixture.regular_user })).rejects.toThrow();
    });

    it("should enforce unique email on persons", async () => {
      await prisma.person.create({ data: personsFixture.john_doe });

      await expect(prisma.person.create({ data: personsFixture.john_doe })).rejects.toThrow();
    });
  });

  describe("Cascade Deletes", () => {
    it("should cascade delete property when address is deleted", async () => {
      const geoObject = await prisma.geoObject.create({ data: geoObjectsFixture.brussels_center });
      const address = await prisma.address.create({
        data: { ...addressesFixture.brussels_apartment, geoObjectId: geoObject.id },
      });
      const person = await prisma.person.create({ data: personsFixture.property_owner });
      const user = await prisma.user.create({ data: usersFixture.property_lister });
      const property = await prisma.property.create({
        data: {
          ...propertiesFixture.apartment_brussels,
          addressId: address.id,
          ownerPersonId: person.id,
          userId: user.id,
        },
      });

      // Delete address (should cascade to property)
      await prisma.address.delete({ where: { id: address.id } });

      // Verify property was deleted
      const propertyExists = await prisma.property.findUnique({ where: { id: property.id } });
      expect(propertyExists).toBeNull();
    });
  });

  describe("Connection Pooling", () => {
    it("should handle concurrent queries", async () => {
      const geoObject = await prisma.geoObject.create({ data: geoObjectsFixture.brussels_center });

      // Run multiple queries concurrently
      const queries = Array(10)
        .fill(null)
        .map(() => prisma.geoObject.findUnique({ where: { id: geoObject.id } }));

      const results = await Promise.all(queries);

      // All queries should succeed
      results.forEach((result) => {
        expect(result?.id).toBe(geoObject.id);
      });
    });
  });
});
