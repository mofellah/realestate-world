-- CreateTable: boundary_types (Country-Specific Administrative Division Types)
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

-- CreateIndex
CREATE UNIQUE INDEX "boundary_types_code_countryCode_key" ON "boundary_types"("code", "countryCode");

-- CreateIndex
CREATE INDEX "boundary_types_countryCode_idx" ON "boundary_types"("countryCode");

-- CreateIndex
CREATE INDEX "boundary_types_level_idx" ON "boundary_types"("level");

-- CreateIndex
CREATE INDEX "boundary_types_osmAdminLevel_idx" ON "boundary_types"("osmAdminLevel");

-- AddForeignKey (Self-referential for hierarchy)
ALTER TABLE "boundary_types" ADD CONSTRAINT "boundary_types_parentTypeId_fkey" FOREIGN KEY ("parentTypeId") REFERENCES "boundary_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed Belgium boundary types
INSERT INTO "boundary_types" ("id", "code", "name", "localName", "pluralName", "countryCode", "level", "osmAdminLevel", "abbreviation", "description", "createdAt", "updatedAt", "color")
VALUES
    ('bt_be_country', 'country', 'Country', NULL, 'Countries', 'BE', 0, 2, NULL, 'Sovereign state', NOW(), NOW(), '#1E40AF'),
    ('bt_be_state', 'state', 'Region', 'Gewest / Région', 'Regions', 'BE', 1, 3, 'Reg.', 'Top-level administrative division (Flanders, Wallonia, Brussels-Capital)', NOW(), NOW(), '#3B82F6'),
    ('bt_be_district', 'district', 'District', 'Arrondissement', 'Districts', 'BE', 2, 5, 'Arr.', 'Administrative district', NOW(), NOW(), '#93C5FD'),
    ('bt_be_municipality', 'municipality', 'Municipality', 'Gemeente / Commune', 'Municipalities', 'BE', 3, 7, 'Mun.', 'Local government area', NOW(), NOW(), '#BFDBFE'),
    ('bt_be_city_district', 'city_district', 'City District', 'Deelgemeente / Section', 'City Districts', 'BE', 4, 8, 'Dist.', 'Sub-municipal division', NOW(), NOW(), '#DBEAFE'),
    ('bt_be_postal_code', 'postal_code', 'Postal Code', 'Postcode', 'Postal Codes', 'BE', 5, 10, 'PC', 'Postal delivery zone', NOW(), NOW(), '#E0E7FF'),
    ('bt_be_neighborhood', 'neighborhood', 'Neighborhood', 'Buurt / Quartier', 'Neighborhoods', 'BE', 6, 11, 'Nbh.', 'Neighborhood area', NOW(), NOW(), '#F0F4FF'),
    ('bt_be_other', 'other', 'Other', 'Andere / Autre', 'Others', 'BE', 99, NULL, NULL, 'Other boundary types', NOW(), NOW(), '#E5E7EB');

-- Set up parent relationships for Belgium
UPDATE "boundary_types" SET "parentTypeId" = 'bt_be_country' WHERE "id" = 'bt_be_state';
UPDATE "boundary_types" SET "parentTypeId" = 'bt_be_state' WHERE "id" = 'bt_be_district';
UPDATE "boundary_types" SET "parentTypeId" = 'bt_be_district' WHERE "id" = 'bt_be_municipality';
UPDATE "boundary_types" SET "parentTypeId" = 'bt_be_municipality' WHERE "id" IN ('bt_be_city_district', 'bt_be_postal_code');

-- AlterTable: Add boundaryTypeId to boundaries
ALTER TABLE "boundaries" ADD COLUMN "boundaryTypeId" TEXT;

-- Migrate existing data: Map old enum values to new boundary_types
UPDATE "boundaries" b
SET "boundaryTypeId" = CASE 
    WHEN b."boundaryType"::text = 'country' THEN 'bt_be_country'
    WHEN b."boundaryType"::text = 'state' THEN 'bt_be_state'
    WHEN b."boundaryType"::text = 'district' THEN 'bt_be_district'
    WHEN b."boundaryType"::text = 'municipality' THEN 'bt_be_municipality'
    WHEN b."boundaryType"::text = 'city_district' THEN 'bt_be_city_district'
    WHEN b."boundaryType"::text = 'postal_code' THEN 'bt_be_postal_code'
    WHEN b."boundaryType"::text = 'neighborhood' THEN 'bt_be_neighborhood'
    ELSE 'bt_be_other'
END
WHERE b.country_code = 'BE';

-- Make boundaryTypeId required
ALTER TABLE "boundaries" ALTER COLUMN "boundaryTypeId" SET NOT NULL;

-- CreateIndex on boundaries.boundaryTypeId
CREATE INDEX "boundaries_boundaryTypeId_idx" ON "boundaries"("boundaryTypeId");

-- AddForeignKey
ALTER TABLE "boundaries" ADD CONSTRAINT "boundaries_boundaryTypeId_fkey" FOREIGN KEY ("boundaryTypeId") REFERENCES "boundary_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old unique constraint with enum
ALTER TABLE "boundaries" DROP CONSTRAINT IF EXISTS "boundaries_nameSlug_boundaryType_country_code_key";

-- Create new unique constraint with boundaryTypeId
CREATE UNIQUE INDEX "boundaries_nameSlug_boundaryTypeId_country_code_key" ON "boundaries"("nameSlug", "boundaryTypeId", "country_code");

-- Drop old index on boundaryType enum
DROP INDEX IF EXISTS "boundaries_boundaryType_idx";

-- Note: Keep old boundaryType column for now (backwards compatibility)
-- Will be dropped in future migration after backend code is updated
-- For now, it's nullable and not used
ALTER TABLE "boundaries" ALTER COLUMN "boundaryType" DROP NOT NULL;
