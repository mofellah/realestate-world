/*
  Warnings:

  - You are about to drop the column `boundaryType` on the `boundaries` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "boundaries_nameSlug_boundaryType_country_code_key";

-- AlterTable
ALTER TABLE "boundaries" DROP COLUMN "boundaryType";

-- AlterTable
ALTER TABLE "geo_objects" ADD COLUMN     "centroidLat" DOUBLE PRECISION,
ADD COLUMN     "centroidLon" DOUBLE PRECISION,
ADD COLUMN     "maxLat" DOUBLE PRECISION,
ADD COLUMN     "maxLon" DOUBLE PRECISION,
ADD COLUMN     "minLat" DOUBLE PRECISION,
ADD COLUMN     "minLon" DOUBLE PRECISION;

-- DropEnum
DROP TYPE "BoundaryType";

-- CreateIndex
CREATE INDEX "boundaries_centroidLat_centroidLon_idx" ON "boundaries"("centroidLat", "centroidLon");

-- CreateIndex
CREATE INDEX "geo_objects_minLat_minLon_maxLat_maxLon_idx" ON "geo_objects"("minLat", "minLon", "maxLat", "maxLon");

-- CreateIndex
CREATE INDEX "geo_objects_centroidLat_centroidLon_idx" ON "geo_objects"("centroidLat", "centroidLon");
