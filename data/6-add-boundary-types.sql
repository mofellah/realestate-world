-- Manual Migration: Add BoundaryType table and update Boundary model
-- Preserves existing boundary data

-- Step 1: Create boundary_types table
CREATE TABLE "boundary_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "localName" TEXT,
    "pluralName" TEXT,
    "countryCode" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentTypeId" TEXT,
    "osmAdminLevel" INTEGER,
    "osmBoundaryTag" TEXT,
    "abbreviation" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boundary_types_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create indexes on boundary_types
CREATE UNIQUE INDEX "boundary_types_code_countryCode_key" ON "boundary_types"("code", "countryCode");
CREATE INDEX "boundary_types_countryCode_idx" ON "boundary_types"("countryCode");
CREATE INDEX "boundary_types_level_idx" ON "boundary_types"("level");
CREATE INDEX "boundary_types_osmAdminLevel_idx" ON "boundary_types"("osmAdminLevel");

-- Step 3: Create foreign key for parent relationships
ALTER TABLE "boundary_types" ADD CONSTRAINT "boundary_types_parentTypeId_fkey" 
    FOREIGN KEY ("parentTypeId") REFERENCES "boundary_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Seed boundary types for Belgium (we'll expand later)
INSERT INTO "boundary_types" ("id", "code", "name", "localName", "pluralName", "countryCode", "level", "osmAdminLevel", "abbreviation", "description", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid()::text, 'country', 'Country', NULL, 'Countries', 'BE', 0, 2, NULL, 'Sovereign state', NOW(), NOW()),
    (gen_random_uuid()::text, 'state', 'Region', 'Gewest / Région', 'Regions', 'BE', 1, 3, 'Reg.', 'Top-level administrative division', NOW(), NOW()),
    (gen_random_uuid()::text, 'district', 'District', 'Arrondissement', 'Districts', 'BE', 2, 5, 'Arr.', 'Administrative district', NOW(), NOW()),
    (gen_random_uuid()::text, 'municipality', 'Municipality', 'Gemeente / Commune', 'Municipalities', 'BE', 3, 7, 'Mun.', 'Local government area', NOW(), NOW()),
    (gen_random_uuid()::text, 'city_district', 'City District', 'Deelgemeente / Section', 'City Districts', 'BE', 4, 8, 'Dist.', 'Sub-municipal division', NOW(), NOW()),
    (gen_random_uuid()::text, 'postal_code', 'Postal Code', 'Postcode', 'Postal Codes', 'BE', 5, 10, 'PC', 'Postal delivery zone', NOW(), NOW()),
    (gen_random_uuid()::text, 'neighborhood', 'Neighborhood', 'Buurt / Quartier', 'Neighborhoods', 'BE', 6, 11, 'Nbh.', 'Neighborhood area', NOW(), NOW()),
    (gen_random_uuid()::text, 'other', 'Other', 'Andere / Autre', 'Others', 'BE', 99, NULL, NULL, 'Other boundary types', NOW(), NOW());

-- Step 5: Add boundaryTypeId column to boundaries table
ALTER TABLE "boundaries" ADD COLUMN "boundaryTypeId" TEXT;

-- Step 6: Populate boundaryTypeId based on existing boundaryType enum values
UPDATE "boundaries" b
SET "boundaryTypeId" = (
    SELECT bt.id 
    FROM "boundary_types" bt 
    WHERE bt.code = b."boundaryType"::text 
    AND bt."countryCode" = b.country_code
    LIMIT 1
);

-- Step 7: Make boundaryTypeId NOT NULL after populating
ALTER TABLE "boundaries" ALTER COLUMN "boundaryTypeId" SET NOT NULL;

-- Step 8: Create index and foreign key on boundaries.boundaryTypeId
CREATE INDEX "boundaries_boundaryTypeId_idx" ON "boundaries"("boundaryTypeId");

ALTER TABLE "boundaries" ADD CONSTRAINT "boundaries_boundaryTypeId_fkey" 
    FOREIGN KEY ("boundaryTypeId") REFERENCES "boundary_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 9: Update unique constraint to use boundaryTypeId instead of boundaryType
ALTER TABLE "boundaries" DROP CONSTRAINT IF EXISTS "boundaries_nameSlug_boundaryType_country_code_key";
CREATE UNIQUE INDEX "boundaries_nameSlug_boundaryTypeId_country_code_key" 
    ON "boundaries"("nameSlug", "boundaryTypeId", "country_code");

-- Step 10: Drop old boundaryType enum column
-- (We keep it for now for backwards compatibility, will drop in future migration after code updated)

-- Migration complete
-- Note: Run db/seeds/boundary-types.ts to add types for other countries (FR, JP, US)
