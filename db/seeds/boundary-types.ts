/**
 * Boundary Type Seed Data - Country-Specific Administrative Divisions
 *
 * Defines administrative hierarchy for each supported country
 * Maps to OSM admin_level for data import compatibility
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface BoundaryTypeData {
  code: string;
  name: string;
  localName?: string;
  pluralName?: string;
  countryCode: string;
  level: number;
  parentCode?: string; // Reference to parent by code
  osmAdminLevel?: number;
  abbreviation?: string;
  description?: string;
  icon?: string;
  color?: string;
}

const boundaryTypes: BoundaryTypeData[] = [
  // ============================================================================
  // BELGIUM (BE) - Regions, Provinces, Municipalities
  // ============================================================================
  {
    code: "country",
    name: "Country",
    pluralName: "Countries",
    countryCode: "BE",
    level: 0,
    osmAdminLevel: 2,
    description: "Sovereign state",
    icon: "flag",
    color: "#1E40AF",
  },
  {
    code: "region",
    name: "Region",
    localName: "Gewest / Région",
    pluralName: "Regions",
    countryCode: "BE",
    level: 1,
    parentCode: "country",
    osmAdminLevel: 3,
    abbreviation: "Reg.",
    description: "Top-level administrative division (Flanders, Wallonia, Brussels-Capital)",
    icon: "map",
    color: "#3B82F6",
  },
  {
    code: "province",
    name: "Province",
    localName: "Provincie / Province",
    pluralName: "Provinces",
    countryCode: "BE",
    level: 2,
    parentCode: "region",
    osmAdminLevel: 4,
    abbreviation: "Prov.",
    description: "Provincial division",
    icon: "map-pin",
    color: "#60A5FA",
  },
  {
    code: "arrondissement",
    name: "Arrondissement",
    pluralName: "Arrondissements",
    countryCode: "BE",
    level: 3,
    parentCode: "province",
    osmAdminLevel: 5,
    abbreviation: "Arr.",
    description: "Administrative district",
    icon: "layers",
    color: "#93C5FD",
  },
  {
    code: "municipality",
    name: "Municipality",
    localName: "Gemeente / Commune",
    pluralName: "Municipalities",
    countryCode: "BE",
    level: 4,
    parentCode: "arrondissement",
    osmAdminLevel: 7,
    abbreviation: "Mun.",
    description: "Local government area",
    icon: "building",
    color: "#BFDBFE",
  },
  {
    code: "deelgemeente",
    name: "City District",
    localName: "Deelgemeente / Section",
    pluralName: "City Districts",
    countryCode: "BE",
    level: 5,
    parentCode: "municipality",
    osmAdminLevel: 8,
    abbreviation: "Dist.",
    description: "Sub-municipal division",
    icon: "map-pin",
    color: "#DBEAFE",
  },
  {
    code: "postal_code",
    name: "Postal Code",
    localName: "Postcode",
    pluralName: "Postal Codes",
    countryCode: "BE",
    level: 6,
    parentCode: "municipality",
    osmAdminLevel: 10,
    abbreviation: "PC",
    description: "Postal delivery zone",
    icon: "mail",
    color: "#E0E7FF",
  },

  // ============================================================================
  // FRANCE (FR) - Régions, Départements, Communes
  // ============================================================================
  {
    code: "country",
    name: "Country",
    pluralName: "Countries",
    countryCode: "FR",
    level: 0,
    osmAdminLevel: 2,
    description: "Sovereign state",
    icon: "flag",
    color: "#DC2626",
  },
  {
    code: "region",
    name: "Region",
    localName: "Région",
    pluralName: "Regions",
    countryCode: "FR",
    level: 1,
    parentCode: "country",
    osmAdminLevel: 4,
    abbreviation: "Rég.",
    description: "Regional administrative division",
    icon: "map",
    color: "#EF4444",
  },
  {
    code: "departement",
    name: "Department",
    localName: "Département",
    pluralName: "Departments",
    countryCode: "FR",
    level: 2,
    parentCode: "region",
    osmAdminLevel: 6,
    abbreviation: "Dép.",
    description: "Departmental division (numbered 01-99)",
    icon: "layers",
    color: "#F87171",
  },
  {
    code: "arrondissement",
    name: "Arrondissement",
    pluralName: "Arrondissements",
    countryCode: "FR",
    level: 3,
    parentCode: "departement",
    osmAdminLevel: 7,
    abbreviation: "Arr.",
    description: "Sub-departmental district",
    icon: "grid",
    color: "#FCA5A5",
  },
  {
    code: "commune",
    name: "Commune",
    pluralName: "Communes",
    countryCode: "FR",
    level: 4,
    parentCode: "arrondissement",
    osmAdminLevel: 8,
    abbreviation: "Com.",
    description: "Municipal division (smallest administrative unit)",
    icon: "building",
    color: "#FECACA",
  },
  {
    code: "postal_code",
    name: "Postal Code",
    localName: "Code Postal",
    pluralName: "Postal Codes",
    countryCode: "FR",
    level: 5,
    parentCode: "commune",
    osmAdminLevel: 10,
    abbreviation: "CP",
    description: "Postal delivery zone (5-digit code)",
    icon: "mail",
    color: "#FEE2E2",
  },

  // ============================================================================
  // JAPAN (JP) - Prefectures, Cities, Wards
  // ============================================================================
  {
    code: "country",
    name: "Country",
    localName: "国",
    pluralName: "Countries",
    countryCode: "JP",
    level: 0,
    osmAdminLevel: 2,
    description: "Sovereign state",
    icon: "flag",
    color: "#DC2626",
  },
  {
    code: "prefecture",
    name: "Prefecture",
    localName: "都道府県",
    pluralName: "Prefectures",
    countryCode: "JP",
    level: 1,
    parentCode: "country",
    osmAdminLevel: 4,
    abbreviation: "Pref.",
    description: "First-level administrative division (47 total)",
    icon: "map",
    color: "#B91C1C",
  },
  {
    code: "city",
    name: "City",
    localName: "市",
    pluralName: "Cities",
    countryCode: "JP",
    level: 2,
    parentCode: "prefecture",
    osmAdminLevel: 7,
    abbreviation: "City",
    description: "Municipal city (shi)",
    icon: "building",
    color: "#DC2626",
  },
  {
    code: "ward",
    name: "Ward",
    localName: "区",
    pluralName: "Wards",
    countryCode: "JP",
    level: 3,
    parentCode: "city",
    osmAdminLevel: 8,
    abbreviation: "Ward",
    description: "Special ward (ku) in designated cities",
    icon: "grid",
    color: "#EF4444",
  },
  {
    code: "town",
    name: "Town",
    localName: "町",
    pluralName: "Towns",
    countryCode: "JP",
    level: 2,
    parentCode: "prefecture",
    osmAdminLevel: 7,
    abbreviation: "Town",
    description: "Municipal town (machi/cho)",
    icon: "map-pin",
    color: "#F87171",
  },
  {
    code: "postal_code",
    name: "Postal Code",
    localName: "郵便番号",
    pluralName: "Postal Codes",
    countryCode: "JP",
    level: 4,
    parentCode: "ward",
    osmAdminLevel: 10,
    abbreviation: "〒",
    description: "Postal delivery zone (7-digit code)",
    icon: "mail",
    color: "#FCA5A5",
  },

  // ============================================================================
  // UNITED STATES (US) - States, Counties, Cities
  // ============================================================================
  {
    code: "country",
    name: "Country",
    pluralName: "Countries",
    countryCode: "US",
    level: 0,
    osmAdminLevel: 2,
    description: "Sovereign state",
    icon: "flag",
    color: "#1E40AF",
  },
  {
    code: "state",
    name: "State",
    pluralName: "States",
    countryCode: "US",
    level: 1,
    parentCode: "country",
    osmAdminLevel: 4,
    abbreviation: "State",
    description: "First-level administrative division (50 states + DC)",
    icon: "map",
    color: "#3B82F6",
  },
  {
    code: "county",
    name: "County",
    pluralName: "Counties",
    countryCode: "US",
    level: 2,
    parentCode: "state",
    osmAdminLevel: 6,
    abbreviation: "Co.",
    description: "County or county-equivalent",
    icon: "layers",
    color: "#60A5FA",
  },
  {
    code: "city",
    name: "City",
    pluralName: "Cities",
    countryCode: "US",
    level: 3,
    parentCode: "county",
    osmAdminLevel: 8,
    abbreviation: "City",
    description: "Incorporated city or town",
    icon: "building",
    color: "#93C5FD",
  },
  {
    code: "postal_code",
    name: "ZIP Code",
    pluralName: "ZIP Codes",
    countryCode: "US",
    level: 4,
    parentCode: "city",
    osmAdminLevel: 10,
    abbreviation: "ZIP",
    description: "Zone Improvement Plan code (5 or 9 digits)",
    icon: "mail",
    color: "#BFDBFE",
  },
];

export async function seedBoundaryTypes() {
  console.log("🌍 Seeding boundary types...\n");

  // Create map to store created types by country+code for parent linking
  const createdTypes: Map<string, string> = new Map();

  // First pass: Create all types without parent relationships
  for (const typeData of boundaryTypes) {
    const { parentCode, ...data } = typeData;

    const boundaryType = await prisma.boundaryType.upsert({
      where: {
        code_countryCode: {
          code: data.code,
          countryCode: data.countryCode,
        },
      },
      update: data,
      create: data,
    });

    createdTypes.set(`${data.countryCode}:${data.code}`, boundaryType.id);
    console.log(`  ✓ ${data.countryCode}: ${data.name} (${data.code})`);
  }

  console.log("\n🔗 Linking parent-child relationships...\n");

  // Second pass: Link parent relationships
  for (const typeData of boundaryTypes) {
    if (typeData.parentCode) {
      const parentId = createdTypes.get(`${typeData.countryCode}:${typeData.parentCode}`);

      if (parentId) {
        await prisma.boundaryType.update({
          where: {
            code_countryCode: {
              code: typeData.code,
              countryCode: typeData.countryCode,
            },
          },
          data: {
            parentTypeId: parentId,
          },
        });
        console.log(`  ✓ ${typeData.countryCode}: ${typeData.code} → ${typeData.parentCode}`);
      }
    }
  }

  console.log("\n✅ Boundary types seeded successfully!\n");
}

// Run if executed directly
if (require.main === module) {
  seedBoundaryTypes()
    .catch((e) => {
      console.error("❌ Error seeding boundary types:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
