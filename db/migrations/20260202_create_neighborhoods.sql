-- CreateNeighborhoods Migration
-- Adds neighborhood search infrastructure with PostGIS geometry support

-- Create PostGIS extension if not exists
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create neighborhoods table
CREATE TABLE IF NOT EXISTS "neighborhoods" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nameSlug" TEXT NOT NULL,
  "alternateNames" TEXT[],
  
  -- Administrative hierarchy
  "adminBoundaryId" TEXT NOT NULL,
  "cityName" TEXT NOT NULL,
  "regionName" TEXT,
  "country_code" TEXT NOT NULL,
  
  -- PostGIS geometry (MultiPolygon in WGS84 - SRID 4326)
  "boundaryGeometry" GEOMETRY(MULTIPOLYGON, 4326),
  
  -- Bounding box for fast filtering (indexed)
  "minLat" DOUBLE PRECISION,
  "minLon" DOUBLE PRECISION,
  "maxLat" DOUBLE PRECISION,
  "maxLon" DOUBLE PRECISION,
  
  -- Centroid for distance calculations
  "centroidLat" DOUBLE PRECISION,
  "centroidLon" DOUBLE PRECISION,
  
  -- Metadata
  "population" INTEGER,
  "area_sqkm" DOUBLE PRECISION,
  "propertyCount" INTEGER NOT NULL DEFAULT 0,
  "avgPrice" DOUBLE PRECISION,
  
  -- Search optimization
  "searchRank" INTEGER NOT NULL DEFAULT 0,
  "isPopular" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "neighborhoods_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "neighborhoods_cityName_idx" ON "neighborhoods"("cityName");
CREATE INDEX "neighborhoods_country_code_idx" ON "neighborhoods"("country_code");
CREATE INDEX "neighborhoods_nameSlug_idx" ON "neighborhoods"("nameSlug");
CREATE INDEX "neighborhoods_searchRank_idx" ON "neighborhoods"("searchRank");
CREATE INDEX "neighborhoods_isPopular_idx" ON "neighborhoods"("isPopular");
CREATE INDEX "neighborhoods_bbox_idx" ON "neighborhoods"("minLat", "minLon", "maxLat", "maxLon");
CREATE INDEX "neighborhoods_adminBoundaryId_idx" ON "neighborhoods"("adminBoundaryId");

-- Create spatial index for geometry (PostGIS GIST index)
CREATE INDEX "neighborhoods_geometry_idx" ON "neighborhoods" USING GIST ("boundaryGeometry");

-- Create unique constraint for slug combination
CREATE UNIQUE INDEX "neighborhoods_nameSlug_cityName_country_code_key" ON "neighborhoods"("nameSlug", "cityName", "country_code");

-- Add foreign key to admin_boundaries
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_adminBoundaryId_fkey" 
  FOREIGN KEY ("adminBoundaryId") REFERENCES "admin_boundaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update admin_boundaries table to support relationship (if needed)
-- This assumes admin_boundaries already exists from base schema

COMMENT ON TABLE "neighborhoods" IS 'Search-optimized neighborhood boundaries for property search';
COMMENT ON COLUMN "neighborhoods"."boundaryGeometry" IS 'PostGIS MultiPolygon geometry in SRID 4326 (WGS84)';
COMMENT ON COLUMN "neighborhoods"."searchRank" IS 'Popularity rank for autocomplete ordering (higher = more popular)';
COMMENT ON COLUMN "neighborhoods"."propertyCount" IS 'Cached count of properties in this neighborhood';
COMMENT ON COLUMN "neighborhoods"."avgPrice" IS 'Cached average listing price in this neighborhood';
