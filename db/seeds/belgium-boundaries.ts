/**
 * Belgium Boundaries Sample Data
 * Major cities and regions for testing
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedBelgiumBoundaries() {
  console.log("🇧🇪 Seeding Belgium boundaries...\n");

  // Get boundary types
  const regionType = await prisma.boundaryType.findFirst({
    where: { code: "region", countryCode: "BE" },
  });
  const provinceType = await prisma.boundaryType.findFirst({
    where: { code: "province", countryCode: "BE" },
  });
  const municipalityType = await prisma.boundaryType.findFirst({
    where: { code: "municipality", countryCode: "BE" },
  });

  if (!regionType || !provinceType || !municipalityType) {
    throw new Error("Boundary types not found. Run boundary-types seed first.");
  }

  // Regions
  const flanders = await prisma.boundary.create({
    data: {
      name: "Flanders",
      nameSlug: "flanders",
      alternateNames: ["Vlaanderen", "Flemish Region"],
      boundaryTypeId: regionType.id,
      country_code: "BE",
      centroidLat: 51.0,
      centroidLon: 4.5,
      population: 6653062,
      area_sqkm: 13522,
      isPopular: true,
      searchRank: 100,
    },
  });

  const wallonia = await prisma.boundary.create({
    data: {
      name: "Wallonia",
      nameSlug: "wallonia",
      alternateNames: ["Wallonie", "Walloon Region"],
      boundaryTypeId: regionType.id,
      country_code: "BE",
      centroidLat: 50.4,
      centroidLon: 5.0,
      population: 3645243,
      area_sqkm: 16901,
      isPopular: true,
      searchRank: 95,
    },
  });

  const brussels = await prisma.boundary.create({
    data: {
      name: "Brussels",
      nameSlug: "brussels",
      alternateNames: ["Bruxelles", "Brussel", "Brussels-Capital Region"],
      boundaryTypeId: regionType.id,
      country_code: "BE",
      centroidLat: 50.8503,
      centroidLon: 4.3517,
      population: 1218255,
      area_sqkm: 161.38,
      isPopular: true,
      searchRank: 100,
    },
  });

  console.log("  ✓ Flanders (Region)");
  console.log("  ✓ Wallonia (Region)");
  console.log("  ✓ Brussels (Region)\n");

  // Provinces
  const antwerp = await prisma.boundary.create({
    data: {
      name: "Antwerp",
      nameSlug: "antwerp",
      alternateNames: ["Antwerpen", "Province of Antwerp"],
      boundaryTypeId: provinceType.id,
      country_code: "BE",
      parentId: flanders.id,
      regionName: "Flanders",
      centroidLat: 51.2194,
      centroidLon: 4.4025,
      population: 1857986,
      area_sqkm: 2867,
      isPopular: true,
      searchRank: 90,
    },
  });

  const eastFlanders = await prisma.boundary.create({
    data: {
      name: "East Flanders",
      nameSlug: "east-flanders",
      alternateNames: ["Oost-Vlaanderen"],
      boundaryTypeId: provinceType.id,
      country_code: "BE",
      parentId: flanders.id,
      regionName: "Flanders",
      centroidLat: 51.0,
      centroidLon: 3.7,
      population: 1525255,
      area_sqkm: 3007,
      isPopular: true,
      searchRank: 85,
    },
  });

  console.log("  ✓ Antwerp (Province)");
  console.log("  ✓ East Flanders (Province)\n");

  // Major municipalities
  const cities = [
    {
      name: "Antwerp",
      slug: "antwerp-city",
      lat: 51.2213,
      lon: 4.3997,
      pop: 529247,
      parent: antwerp,
      region: "Flanders",
      rank: 100,
    },
    {
      name: "Ghent",
      slug: "ghent",
      lat: 51.0543,
      lon: 3.7174,
      pop: 262219,
      parent: eastFlanders,
      region: "Flanders",
      rank: 95,
    },
    {
      name: "Bruges",
      slug: "bruges",
      lat: 51.2093,
      lon: 3.2247,
      pop: 118284,
      parent: eastFlanders,
      region: "Flanders",
      rank: 90,
    },
    {
      name: "Leuven",
      slug: "leuven",
      lat: 50.8798,
      lon: 4.7005,
      pop: 102275,
      parent: flanders,
      region: "Flanders",
      rank: 85,
    },
    {
      name: "Mechelen",
      slug: "mechelen",
      lat: 51.0259,
      lon: 4.4777,
      pop: 86304,
      parent: antwerp,
      region: "Flanders",
      rank: 80,
    },
    {
      name: "Aalst",
      slug: "aalst",
      lat: 50.9378,
      lon: 4.0401,
      pop: 87794,
      parent: eastFlanders,
      region: "Flanders",
      rank: 75,
    },
    {
      name: "Charleroi",
      slug: "charleroi",
      lat: 50.4108,
      lon: 4.4446,
      pop: 201816,
      parent: wallonia,
      region: "Wallonia",
      rank: 90,
    },
    {
      name: "Liège",
      slug: "liege",
      lat: 50.6326,
      lon: 5.5797,
      pop: 197355,
      parent: wallonia,
      region: "Wallonia",
      rank: 90,
    },
    {
      name: "Namur",
      slug: "namur",
      lat: 50.4674,
      lon: 4.872,
      pop: 110939,
      parent: wallonia,
      region: "Wallonia",
      rank: 85,
    },
    {
      name: "Mons",
      slug: "mons",
      lat: 50.4542,
      lon: 3.9517,
      pop: 95299,
      parent: wallonia,
      region: "Wallonia",
      rank: 80,
    },
  ];

  for (const city of cities) {
    await prisma.boundary.create({
      data: {
        name: city.name,
        nameSlug: city.slug,
        alternateNames: [],
        boundaryTypeId: municipalityType.id,
        country_code: "BE",
        parentId: city.parent.id,
        cityName: city.name,
        regionName: city.region,
        centroidLat: city.lat,
        centroidLon: city.lon,
        population: city.pop,
        isPopular: true,
        searchRank: city.rank,
      },
    });
    console.log(`  ✓ ${city.name} (Municipality)`);
  }

  console.log("\n✅ Belgium boundaries seeded successfully!");
  console.log(`   Total: ${cities.length + 5} boundaries created\n`);
}

seedBelgiumBoundaries()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
