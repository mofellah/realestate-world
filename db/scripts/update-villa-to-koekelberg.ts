/**
 * Update Luxury Villa Uccle to be in Koekelberg
 * Using a point slightly offset from centroid for variety
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.findUnique({
    where: { id: "cml6h4rdo0044x9ndgbpnm3zj" },
    include: {
      address: {
        include: {
          geoObject: true,
        },
      },
    },
  });

  if (!property) {
    console.log("Property not found");
    return;
  }

  console.log(`Updating property: ${property.title}`);

  // Update address to Koekelberg
  await prisma.address.update({
    where: { id: property.address.id },
    data: {
      streetName: "Avenue du Panthéon",
      streetNumber: "12",
      postalCode: "1081",
      city: "Koekelberg",
      region: "Brussels",
      country_code: "BE",
    },
  });

  // Use coordinates slightly offset from centroid (about 100m north)
  const geoJson = {
    type: "Point",
    coordinates: [4.324087298306575, 50.864], // [lng, lat]
  };

  await prisma.geoObject.update({
    where: { id: property.address.geoObject.id },
    data: {
      geoJson: geoJson as any,
      latitude: 50.864,
      longitude: 4.324087298306575,
      type: "point",
    },
  });

  console.log(`✓ Updated property to: 12 Avenue du Panthéon, 1081 Koekelberg`);
  console.log(`✓ Coordinates: 50.864, 4.324`);

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
