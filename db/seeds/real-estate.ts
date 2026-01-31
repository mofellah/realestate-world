/**
 * Real Estate seed: properties, listings, addresses
 * Creates sample real estate data for testing
 */

import {
  PrismaClient,
  PropertyType,
  ListingType,
  ListingStatus,
  PaymentTermType,
  GeoObjectType,
} from "@prisma/client";

const prisma = new PrismaClient();

export async function seedRealEstate() {
  console.log("🏠 Seeding real estate data (properties, listings)...");

  // Get users for property ownership
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
  const normalUser = await prisma.user.findUnique({ where: { email: "user@example.com" } });

  if (!adminUser || !normalUser) {
    throw new Error("Cannot seed real estate: baseline users not found. Run baseline seed first.");
  }

  // ============================================================================
  // 1. Create Addresses with GeoObjects (Coordinates)
  // ============================================================================
  console.log("Creating addresses...");

  const geo1 = await prisma.geoObject.create({
    data: {
      type: GeoObjectType.point,
      latitude: 50.84805,
      longitude: 4.3733345,
      name: "48, Rue Hydraulique",
    },
  });

  const geo2 = await prisma.geoObject.create({
    data: {
      type: GeoObjectType.point,
      latitude: 40.7614,
      longitude: -73.9722,
      name: "456 Park Avenue",
    },
  });

  const geo3 = await prisma.geoObject.create({
    data: {
      type: GeoObjectType.point,
      latitude: 40.7614,
      longitude: -73.9738,
      name: "789 Fifth Avenue",
    },
  });

  const address1 = await prisma.address.create({
    data: {
      streetNumber: "48",
      streetName: "Rue Hydraulique",
      city: "Saint-Josse-ten-Noode",
      region: "Brussels",
      country_code: "BE",
      postalCode: "1210",
      geoObjectId: geo1.id,
    },
  });

  const address2 = await prisma.address.create({
    data: {
      streetName: "456 Park Avenue",
      city: "New York",
      region: "NY",
      country_code: "US",
      postalCode: "10022",
      geoObjectId: geo2.id,
    },
  });

  const address3 = await prisma.address.create({
    data: {
      streetName: "789 Fifth Avenue",
      city: "New York",
      region: "NY",
      country_code: "US",
      postalCode: "10022",
      geoObjectId: geo3.id,
    },
  });

  console.log("✓ Created 3 addresses with geo-coordinates");

  // ============================================================================
  // 2. Create Persons (Property Owners)
  // ============================================================================
  console.log("Creating persons...");

  const person1 = await prisma.person.create({
    data: {
      email: "owner1@example.com",
    },
  });

  await prisma.physicalPerson.create({
    data: {
      personId: person1.id,
      firstName: "Admin",
      lastName: "User",
      nationality: "US",
    },
  });

  const person2 = await prisma.person.create({
    data: {
      email: "owner2@example.com",
    },
  });

  await prisma.physicalPerson.create({
    data: {
      personId: person2.id,
      firstName: "Agent",
      lastName: "Smith",
      nationality: "US",
    },
  });

  const person3 = await prisma.person.create({
    data: {
      email: "owner3@example.com",
    },
  });

  await prisma.physicalPerson.create({
    data: {
      personId: person3.id,
      firstName: "John",
      lastName: "Doe",
      nationality: "US",
    },
  });

  console.log("✓ Created 3 persons (with physical profiles)");

  // ============================================================================
  // 3. Create Properties
  // ============================================================================
  console.log("Creating properties...");

  const property1 = await prisma.property.create({
    data: {
      title: "Beautiful Apartment in Manhattan",
      description: "Stunning 2-bedroom apartment with views of Central Park",
      addressId: address1.id,
      ownerPersonId: person1.id,
      userId: adminUser.id,
      propertyType: PropertyType.apartment,
      bedrooms: 2,
      bathrooms: 2,
      surfaceArea: 1200,
      yearBuilt: 2015,
      amenitiesList: ["elevator", "doorman", "gym"],
    },
  });

  const property2 = await prisma.property.create({
    data: {
      title: "Luxury House with Garden",
      description: "Spacious 4-bedroom house with large backyard",
      addressId: address2.id,
      ownerPersonId: person2.id,
      userId: normalUser.id,
      propertyType: PropertyType.house,
      bedrooms: 4,
      bathrooms: 3,
      surfaceArea: 3500,
      yearBuilt: 2010,
      amenitiesList: ["garden", "garage", "fireplace"],
    },
  });

  const property3 = await prisma.property.create({
    data: {
      title: "Modern Villa in Prime Location",
      description: "Luxurious villa with premium finishes",
      addressId: address3.id,
      ownerPersonId: person3.id,
      userId: normalUser.id,
      propertyType: PropertyType.villa,
      bedrooms: 5,
      bathrooms: 4,
      surfaceArea: 4500,
      yearBuilt: 2018,
      amenitiesList: ["pool", "terrace", "security"],
    },
  });

  console.log("✓ Created 3 properties");

  // ============================================================================
  // 4. Create Payment Terms
  // ============================================================================
  console.log("Creating payment terms...");

  const paymentTerms1 = await prisma.paymentTerms.create({
    data: {
      termType: PaymentTermType.onetime,
      currency: "USD",
      onetimePayment: {
        create: {
          amount: 1500000,
        },
      },
    },
  });

  const paymentTerms2 = await prisma.paymentTerms.create({
    data: {
      termType: PaymentTermType.periodic,
      currency: "USD",
      periodicPayment: {
        create: {
          amountPerPeriod: 5000,
          periodType: "monthly",
        },
      },
    },
  });

  const paymentTerms3 = await prisma.paymentTerms.create({
    data: {
      termType: PaymentTermType.periodic,
      currency: "USD",
      periodicPayment: {
        create: {
          amountPerPeriod: 8000,
          periodType: "monthly",
        },
      },
    },
  });

  console.log("✓ Created 3 payment terms");

  // ============================================================================
  // 5. Create Listings
  // ============================================================================
  console.log("Creating listings...");

  await prisma.listing.create({
    data: {
      type: ListingType.sale,
      status: ListingStatus.published,
      propertyId: property1.id,
      createdBy: adminUser.id,
      paymentTermsId: paymentTerms1.id,
      publishedAt: new Date(),
    },
  });

  await prisma.listing.create({
    data: {
      type: ListingType.rental,
      status: ListingStatus.published,
      propertyId: property2.id,
      createdBy: normalUser.id,
      paymentTermsId: paymentTerms2.id,
      publishedAt: new Date(),
    },
  });

  await prisma.listing.create({
    data: {
      type: ListingType.sale,
      status: ListingStatus.published,
      propertyId: property3.id,
      createdBy: normalUser.id,
      paymentTermsId: paymentTerms3.id,
      publishedAt: new Date(),
    },
  });

  console.log("✓ Created 3 listings");

  console.log("\n✓ Real estate data seeded successfully");
  console.log("  • 3 Addresses (with geo-coordinates for map markers)");
  console.log("  • 3 Persons (with physical profiles)");
  console.log("  • 3 Properties (apartment, house, villa)");
  console.log("  • 3 Payment Terms");
  console.log("  • 3 Listings (2 sale, 1 rental)");
}
