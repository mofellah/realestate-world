/**
 * Update a property to be at rue François Delcoigne in Koekelberg
 * Coordinates: 50.8554, 4.3289 (center of Koekelberg)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Get the first available property
  const property = await prisma.property.findFirst({
    include: {
      address: {
        include: {
          geoObject: true,
        },
      },
    },
  });

  if (!property) {
    console.log("No properties found");
    return;
  }

  console.log(`Updating property: ${property.title}`);

  // Update address to Koekelberg
  await prisma.address.update({
    where: { id: property.address.id },
    data: {
      streetName: "Rue François Delcoigne",
      streetNumber: "58",
      postalCode: "1081",
      city: "Koekelberg",
      region: "Brussels",
      country_code: "BE",
    },
  });

  // Update geo coordinates to be in Koekelberg
  // Using the exact centroid from the Koekelberg boundary geometry
  const geoJson = {
    type: "Point",
    coordinates: [4.324087298306575, 50.86299239185761], // [lng, lat] - exact centroid of Koekelberg
  };

  await prisma.geoObject.update({
    where: { id: property.address.geoObject.id },
    data: {
      geoJson: geoJson as any,
      latitude: 50.86299239185761,
      longitude: 4.324087298306575,
      type: "point",
    },
  });

  console.log(`✓ Updated property to: 58 Rue François Delcoigne, 1081 Koekelberg`);
  console.log(`✓ Coordinates: 50.863, 4.324`);

  // Verify it's within Koekelberg boundary
  const result = await prisma.$queryRaw<Array<{ is_within: boolean }>>`
    SELECT ST_Within(
      ST_GeomFromGeoJSON(${JSON.stringify(geoJson)}::text)::geometry,
      b.geometry
    ) as is_within
    FROM boundaries b
    WHERE b.name = 'Koekelberg'
  `;

  if (result[0]?.is_within) {
    console.log(`✓ Property is now within Koekelberg boundary`);
  } else {
    console.log(`⚠️  Warning: Property coordinates may not be within Koekelberg polygon`);
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
