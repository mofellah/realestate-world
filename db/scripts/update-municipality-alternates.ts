import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateMunicipalityAlternateNames() {
  console.log("📍 Updating municipality alternate names...\n");

  const municipalities = await prisma.boundary.findMany({
    where: {
      parentId: { not: null }, // Only municipalities, not the region
    },
  });

  console.log(`Found ${municipalities.length} municipalities to update\n`);

  for (const municipality of municipalities) {
    // Extract all name variations from the full name
    const nameParts = municipality.name.split(/\s*[-–]\s*/);
    const existingAlternates = municipality.alternateNames || [];

    // Create comprehensive list of alternates
    const allAlternates = new Set([
      ...existingAlternates,
      ...nameParts,
      municipality.name, // Include full name too
    ]);

    // Remove empty strings
    const cleanedAlternates = Array.from(allAlternates).filter(Boolean);

    await prisma.boundary.update({
      where: { id: municipality.id },
      data: {
        alternateNames: cleanedAlternates,
      },
    });

    console.log(`✓ ${municipality.name}: ${cleanedAlternates.length} alternates`);
  }

  console.log("\n✅ Updated all municipalities!");

  await prisma.$disconnect();
}

updateMunicipalityAlternateNames().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
