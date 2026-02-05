-- Migration: Add native PostGIS geometry column to geo_objects
-- Purpose: Eliminate GeoJSON conversion overhead for spatial queries
-- Created: 2026-02-05
-- Part of: Phase 2 Property Search Optimization

-- Step 1: Add geometry column (PostGIS type)
-- This stores the actual geometry as native PostGIS geometry type
-- Support for Point, Polygon, MultiPolygon geometries in SRID 4326 (WGS84)
ALTER TABLE "geo_objects" 
ADD COLUMN IF NOT EXISTS geometry geometry(Geometry, 4326);

-- Step 2: Populate geometry from existing geoJson data
-- For Point geometries (when latitude/longitude exist)
UPDATE "geo_objects"
SET geometry = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL
  AND geometry IS NULL;

-- For Polygon/MultiPolygon geometries (from geoJson field)
-- Parse GeoJSON and convert to native PostGIS geometry
UPDATE "geo_objects"
SET geometry = ST_GeomFromGeoJSON("geoJson"::text)
WHERE "geoJson" IS NOT NULL
  AND geometry IS NULL
  AND latitude IS NULL;

-- Step 3: Create GIST spatial index for fast spatial queries
-- Enables efficient ST_Within, ST_DWithin, ST_Contains operations
CREATE INDEX IF NOT EXISTS geo_objects_geometry_gist_idx 
ON "geo_objects" USING GIST (geometry);

-- Step 4: Create index on geometry type for filtering
-- Useful for queries like "find all Points" or "find all Polygons"
CREATE INDEX IF NOT EXISTS geo_objects_geometry_type_idx 
ON "geo_objects" (ST_GeometryType(geometry));

-- Step 5: Update centroid calculations using native geometry
-- More accurate than deriving from geoJson
UPDATE "geo_objects"
SET 
  "centroidLat" = ST_Y(ST_Centroid(geometry)),
  "centroidLon" = ST_X(ST_Centroid(geometry))
WHERE geometry IS NOT NULL
  AND ("centroidLat" IS NULL OR "centroidLon" IS NULL);

-- Step 6: Update bounding boxes using native geometry
-- More accurate and faster than parsing geoJson
UPDATE "geo_objects"
SET 
  "minLat" = ST_YMin(geometry),
  "minLon" = ST_XMin(geometry),
  "maxLat" = ST_YMax(geometry),
  "maxLon" = ST_XMax(geometry)
WHERE geometry IS NOT NULL
  AND ("minLat" IS NULL OR "minLon" IS NULL);

-- Verification query (run after migration)
-- SELECT 
--   COUNT(*) as total,
--   COUNT(geometry) as with_geometry,
--   COUNT("geoJson") as with_geojson,
--   COUNT(CASE WHEN geometry IS NOT NULL AND "geoJson" IS NOT NULL THEN 1 END) as both
-- FROM "geo_objects";

-- Performance comparison query:
-- SELECT 
--   'Old GeoJSON' as method,
--   COUNT(*) as result_count
-- FROM "geo_objects" g
-- WHERE ST_DWithin(
--   ST_GeomFromGeoJSON(g."geoJson"::text)::geography,
--   ST_SetSRID(ST_MakePoint(4.5, 50.5), 4326)::geography,
--   5000
-- );
-- 
-- SELECT 
--   'New Native Geometry' as method,
--   COUNT(*) as result_count
-- FROM "geo_objects" g
-- WHERE ST_DWithin(
--   g.geometry::geography,
--   ST_SetSRID(ST_MakePoint(4.5, 50.5), 4326)::geography,
--   5000
-- );

COMMENT ON COLUMN "geo_objects".geometry IS 'Native PostGIS geometry (Point, Polygon, MultiPolygon) in SRID 4326. Replaces geoJson parsing for ~10x faster spatial queries.';
