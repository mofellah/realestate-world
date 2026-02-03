/**
 * Create test properties within each Brussels boundary
 * This ensures boundary filtering returns results
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test properties within Brussels boundaries...');

  // Get all Brussels boundaries with geometry
  const boundaries = await prisma.boundary.findMany({
    where: {
      country_code: 'BE',
      geometry: { not: null },
      OR: [
        { name: { contains: 'Brussel', mode: 'insensitive' } },
        { name: { contains: 'Brussels', mode: 'insensitive' } },
        { cityName: { contains: 'Bruxelles', mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      centroidLat: true,
      centroidLon: true,
    },
  });

  console.log(`Found ${boundaries.length} Brussels boundaries`);

  // Get a user to assign as property owner
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found - please create a user first');
    return;
  }

  let created = 0;

  for (const boundary of boundaries) {
    if (!boundary.centroidLat || !boundary.centroidLon) {
      console.log(`⚠️  Skipping ${boundary.name} - no centroid coordinates`);
      continue;
    }

    // Create a property at the boundary's centroid
    const geoJson = {
      type: 'Point',
      coordinates: [boundary.centroidLon, boundary.centroidLat],
    };

    try {
      // Create geo_object
      const geoObject = await prisma.geoObject.create({
        data: {
          type: 'point',
          geoJson: geoJson as any,
          latitude: boundary.centroidLat,
          longitude: boundary.centroidLon,
        },
      });

      // Create address
      const address = await prisma.address.create({
        data: {
          streetName: `Test Street`,
          streetNumber: '1',
          city: boundary.name,
          postalCode: '1000',
          country_code: 'BE',
          geoObjectId: geoObject.id,
        },
      });

      // Create property
      const property = await prisma.property.create({
        data: {
          title: `Test Property in ${boundary.name}`,
          description: `A test property located within the ${boundary.name} boundary for testing spatial queries.`,
          propertyType: 'apartment',
          surfaceArea: 75,
          bedrooms: 2,
          bathrooms: 1,
          isAvailable: true,
          address: {
            connect: { id: address.id },
          },
          user: {
            connect: { id: user.id },
          },
        },
      });

      // Create a published listing
      const paymentTerms = await prisma.paymentTerms.create({
        data: {
          currency: 'EUR',
          termType: 'periodic',
        },
      });

      const periodicPayment = await prisma.periodicPayment.create({
        data: {
          amountPerPeriod: 850,
          periodType: 'month',
          paymentTermsId: paymentTerms.id,
        },
      });

      await prisma.listing.create({
        data: {
          type: 'rental',
          status: 'published',
          propertyId: property.id,
          createdBy: user.id,
          paymentTermsId: paymentTerms.id,
          publishedAt: new Date(),
        },
      });

      console.log(
        `✓ Created test property in ${boundary.name} at [${boundary.centroidLat.toFixed(4)}, ${boundary.centroidLon.toFixed(4)}]`,
      );
      created++;
    } catch (error) {
      console.error(`❌ Failed to create property in ${boundary.name}:`, error.message);
    }
  }

  console.log(`\n✅ Created ${created} test properties in Brussels boundaries`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
