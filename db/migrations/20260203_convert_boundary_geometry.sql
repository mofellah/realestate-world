-- Convert boundaries.geometry from bytea to PostGIS geometry type
-- This enables spatial indexing and improves query performance

-- Step 1: Add a new geometry column with proper PostGIS type
ALTER TABLE boundaries 
  ADD COLUMN geometry_new geometry(MultiPolygon, 4326);

-- Step 2: Convert existing bytea data to PostGIS geometry
-- The bytea is already in WKB format, so we can use ST_GeomFromWKB
UPDATE boundaries 
  SET geometry_new = ST_GeomFromWKB(geometry, 4326)
  WHERE geometry IS NOT NULL;

-- Step 3: Drop the old bytea column
ALTER TABLE boundaries 
  DROP COLUMN geometry;

-- Step 4: Rename the new column to geometry
ALTER TABLE boundaries 
  RENAME COLUMN geometry_new TO geometry;

-- Step 5: Create spatial index on geometry column for fast queries
CREATE INDEX boundaries_geometry_gist_idx 
  ON boundaries 
  USING GIST (geometry);

-- Step 6: Verify the conversion
SELECT 
  COUNT(*) as total_boundaries,
  COUNT(geometry) as boundaries_with_geometry,
  ST_GeometryType(geometry) as geom_type
FROM boundaries
WHERE geometry IS NOT NULL
GROUP BY ST_GeometryType(geometry);
