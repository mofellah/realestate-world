/**
 * Populate geoJson for properties based on their city coordinates
 * This adds approximate coordinates to properties so amenity filtering works
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Approximate coordinates for Brussels neighborhoods
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  'Brussels Center': { lat: 50.8503, lng: 4.3517 },
  'Etterbeek': { lat: 50.8376, lng: 4.3889 },
  'Ixelles': { lat: 50.8282, lng: 4.3661 },
  'Schaerbeek': { lat: 50.8677, lng: 4.3731 },
  'Saint-Gilles': { lat: 50.8279, lng: 4.3447 },
  'Anderlecht': { lat: 50.8365, lng: 4.3081 },
  'Molenbeek': { lat: 50.8554, lng: 4.3233 },
  'Uccle': { lat: 50.7989, lng: 4.3347 },
  'Forest': { lat: 50.8099, lng: 4.3248 },
  'Woluwe': { lat: 50.8486, lng: 4.4244 },
  'Woluwe-Saint-Pierre': { lat: 50.8422, lng: 4.4244 },
  'Woluwe-Saint-Lambert': { lat: 50.8486, lng: 4.4175 },
};

async function main() {
  console.log('Starting to populate property geoJson data...');

  // Get all properties with addresses
  const properties = await prisma.property.findMany({
    include: {
      address: {
        include: {
          geoObject: true,
        },
      },
    },
  });

  console.log(`Found ${properties.length} properties`);

  let updated = 0;
  let skipped = 0;

  for (const property of properties) {
    if (!property.address || !property.address.geoObject) {
      console.log(`⚠️  Property ${property.id} has no address or geoObject`);
      skipped++;
      continue;
    }

    // Skip if already has geoJson
    if (property.address.geoObject.geoJson) {
      console.log(`✓  Property ${property.id} already has geoJson`);
      skipped++;
      continue;
    }

    const city = property.address.city;
    const coords = cityCoordinates[city];

    if (!coords) {
      console.log(`⚠️  No coordinates found for city: ${city}`);
      skipped++;
      continue;
    }

    // Add small random offset to avoid exact duplicates (50-200 meters)
    const latOffset = (Math.random() - 0.5) * 0.003; // ~0.0015 deg ≈ 150m
    const lngOffset = (Math.random() - 0.5) * 0.003;

    const geoJson = {
      type: 'Point',
      coordinates: [coords.lng + lngOffset, coords.lat + latOffset], // [lng, lat] for GeoJSON
    };

    // Update the geoObject
    await prisma.geoObject.update({
      where: { id: property.address.geoObject.id },
      data: {
        geoJson: geoJson as any,
        type: 'point',
      },
    });

    console.log(
      `✓  Updated property ${property.title} (${city}) with coordinates [${geoJson.coordinates[1].toFixed(4)}, ${geoJson.coordinates[0].toFixed(4)}]`,
    );
    updated++;
  }

  console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
