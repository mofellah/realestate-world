import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateBrusselsBoundary() {
  console.log("📍 Updating Brussels boundary with municipality names...\n");

  const brusselsId = "cml6gx4pr00019vk2dxht2ycr";

  // All Brussels municipalities and common names
  const alternateNames = [
    "Brussels",
    "Bruxelles",
    "Brussels Center",
    "Brussels-Capital",
    "Brussels Region",
    "Etterbeek",
    "Ixelles",
    "Elsene", // Dutch name for Ixelles
    "Saint-Gilles",
    "Sint-Gillis", // Dutch name
    "Schaerbeek",
    "Schaarbeek", // Dutch name
    "Anderlecht",
    "Molenbeek",
    "Molenbeek-Saint-Jean",
    "Sint-Jans-Molenbeek", // Dutch name
    "Forest",
    "Vorst", // Dutch name
    "Uccle",
    "Ukkel", // Dutch name
    "Woluwe-Saint-Pierre",
    "Sint-Pieters-Woluwe", // Dutch name
    "Koekelberg",
    "Jette",
    "Ganshoren",
    "Berchem-Sainte-Agathe",
    "Sint-Agatha-Berchem", // Dutch name
    "Evere",
    "Auderghem",
    "Oudergem", // Dutch name
    "Watermael-Boitsfort",
    "Watermaal-Bosvoorde", // Dutch name
    "Woluwe-Saint-Lambert",
    "Sint-Lambrechts-Woluwe", // Dutch name
  ];

  const updated = await prisma.boundary.update({
    where: { id: brusselsId },
    data: {
      alternateNames: alternateNames,
    },
  });

  console.log(`✅ Updated Brussels boundary`);
  console.log(`   Name: ${updated.name}`);
  console.log(`   Alternate names: ${alternateNames.length} municipalities`);
  console.log(`   Sample: ${alternateNames.slice(0, 5).join(", ")}...`);

  await prisma.$disconnect();
}

updateBrusselsBoundary().catch((error) => {
  console.error("❌ Error updating boundary:", error);
  process.exit(1);
});
