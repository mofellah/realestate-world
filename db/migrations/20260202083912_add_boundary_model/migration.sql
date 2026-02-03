/*
  Warnings:

  - You are about to drop the `admin_boundaries` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BoundaryType" AS ENUM ('country', 'region', 'state', 'district', 'county', 'municipality', 'city', 'city_district', 'neighborhood', 'postal_code', 'custom_area', 'school_district', 'electoral_district', 'metro_area', 'watershed', 'other');

-- DropForeignKey
ALTER TABLE "admin_boundaries" DROP CONSTRAINT "admin_boundaries_geoObjectId_fkey";

-- DropForeignKey
ALTER TABLE "admin_boundaries" DROP CONSTRAINT "admin_boundaries_parentBoundaryId_fkey";

-- DropTable
DROP TABLE "admin_boundaries";

-- DropEnum
DROP TYPE "AdminBoundaryType";

-- CreateTable
CREATE TABLE "boundaries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameSlug" TEXT NOT NULL,
    "alternateNames" TEXT[],
    "boundaryType" "BoundaryType" NOT NULL,
    "officialCode" TEXT,
    "country_code" TEXT NOT NULL,
    "parentId" TEXT,
    "cityName" TEXT,
    "regionName" TEXT,
    "countryName" TEXT,
    "geometry" BYTEA,
    "minLat" DOUBLE PRECISION,
    "minLon" DOUBLE PRECISION,
    "maxLat" DOUBLE PRECISION,
    "maxLon" DOUBLE PRECISION,
    "centroidLat" DOUBLE PRECISION,
    "centroidLon" DOUBLE PRECISION,
    "population" INTEGER,
    "area_sqkm" DOUBLE PRECISION,
    "propertyCount" INTEGER NOT NULL DEFAULT 0,
    "avgPrice" DOUBLE PRECISION,
    "searchRank" INTEGER NOT NULL DEFAULT 0,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isOfficial" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boundaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "boundaries_boundaryType_idx" ON "boundaries"("boundaryType");

-- CreateIndex
CREATE INDEX "boundaries_country_code_idx" ON "boundaries"("country_code");

-- CreateIndex
CREATE INDEX "boundaries_nameSlug_idx" ON "boundaries"("nameSlug");

-- CreateIndex
CREATE INDEX "boundaries_searchRank_idx" ON "boundaries"("searchRank");

-- CreateIndex
CREATE INDEX "boundaries_isPopular_idx" ON "boundaries"("isPopular");

-- CreateIndex
CREATE INDEX "boundaries_cityName_idx" ON "boundaries"("cityName");

-- CreateIndex
CREATE INDEX "boundaries_minLat_minLon_maxLat_maxLon_idx" ON "boundaries"("minLat", "minLon", "maxLat", "maxLon");

-- CreateIndex
CREATE INDEX "boundaries_parentId_idx" ON "boundaries"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "boundaries_nameSlug_boundaryType_country_code_key" ON "boundaries"("nameSlug", "boundaryType", "country_code");

-- AddForeignKey
ALTER TABLE "boundaries" ADD CONSTRAINT "boundaries_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "boundaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
