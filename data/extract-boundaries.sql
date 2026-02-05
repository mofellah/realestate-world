-- Extract Administrative Boundaries from OSM Data
-- This SQL script extracts boundaries from the OSM database and prepares them
-- for import into the unified Boundary model

-- =============================================================================
-- 1. Analyze Available Boundary Data
-- =============================================================================

-- Check what admin levels are available
SELECT 
    tags->'admin_level' as admin_level,
    tags->'boundary' as boundary_type,
    COUNT(*) as count
FROM osm__polygon
WHERE tags ? 'boundary' 
  AND tags->'boundary' IN ('administrative', 'postal_code')
GROUP BY tags->'admin_level', tags->'boundary'
ORDER BY (tags->'admin_level')::int NULLS LAST;

-- =============================================================================
-- 2. Preview Administrative Boundaries (Belgium specific)
-- =============================================================================

-- Belgium Admin Levels:
-- admin_level=2: Country (Belgium)
-- admin_level=3: Regions (Flanders, Wallonia, Brussels)
-- admin_level=4: Provinces
-- admin_level=6: Arrondissements
-- admin_level=7: Municipalities (Gemeenten/Communes)
-- admin_level=8: Neighborhoods/Districts within cities
-- admin_level=10: Neighborhoods

-- Preview country level (Belgium)
SELECT 
    osm_id,
    tags->'name' as name,
    tags->'name:en' as name_en,
    tags->'name:fr' as name_fr,
    tags->'name:nl' as name_nl,
    tags->'admin_level' as admin_level,
    tags->'ISO3166-1:alpha2' as country_code,
    ST_Area(way::geography) / 1000000 as area_sqkm,
    ST_AsText(ST_Centroid(way)) as centroid
FROM osm__polygon
WHERE tags->'admin_level' = '2'
  AND tags->'boundary' = 'administrative'
LIMIT 5;

-- Preview regions (admin_level=3)
SELECT 
    osm_id,
    tags->'name' as name,
    tags->'name:en' as name_en,
    tags->'name:fr' as name_fr,
    tags->'name:nl' as name_nl,
    tags->'admin_level' as admin_level,
    ST_Area(way::geography) / 1000000 as area_sqkm
FROM osm__polygon
WHERE tags->'admin_level' = '3'
  AND tags->'boundary' = 'administrative'
ORDER BY tags->'name';

-- Preview provinces (admin_level=4)
SELECT 
    osm_id,
    tags->'name' as name,
    tags->'admin_level' as admin_level,
    ST_Area(way::geography) / 1000000 as area_sqkm
FROM osm__polygon
WHERE tags->'admin_level' = '4'
  AND tags->'boundary' = 'administrative'
ORDER BY tags->'name'
LIMIT 20;

-- Preview municipalities (admin_level=7)
SELECT 
    osm_id,
    tags->'name' as name,
    tags->'name:fr' as name_fr,
    tags->'name:nl' as name_nl,
    tags->'admin_level' as admin_level,
    ST_Area(way::geography) / 1000000 as area_sqkm
FROM osm__polygon
WHERE tags->'admin_level' = '7'
  AND tags->'boundary' = 'administrative'
ORDER BY tags->'name'
LIMIT 50;

-- =============================================================================
-- 3. Extract and Transform to Boundary Model Format
-- =============================================================================

-- Create a view that maps OSM data to our Boundary model structure
CREATE OR REPLACE VIEW boundaries_from_osm AS
SELECT 
    'osm_' || osm_id::text as id,
    
    -- Name and slug
    COALESCE(
        tags->'name:en',
        tags->'name',
        tags->'official_name'
    ) as name,
    lower(regexp_replace(
        COALESCE(tags->'name:en', tags->'name', tags->'official_name'),
        '[^a-zA-Z0-9]+', '-', 'g'
    )) as name_slug,
    
    -- Alternate names
    ARRAY[
        tags->'name:fr',
        tags->'name:nl',
        tags->'name:de',
        tags->'alt_name',
        tags->'old_name'
    ]::text[] as alternate_names,
    
    -- Boundary type mapping
    CASE 
        WHEN tags->'admin_level' = '2' THEN 'country'
        WHEN tags->'admin_level' = '3' THEN 'region'
        WHEN tags->'admin_level' = '4' THEN 'state'  -- Province in Belgium
        WHEN tags->'admin_level' = '6' THEN 'district'
        WHEN tags->'admin_level' = '7' THEN 'municipality'
        WHEN tags->'admin_level' = '8' THEN 'city_district'
        WHEN tags->'admin_level' = '10' THEN 'neighborhood'
        WHEN tags->'boundary' = 'postal_code' THEN 'postal_code'
        ELSE 'other'
    END as boundary_type,
    
    -- Official code
    COALESCE(
        tags->'ref:INS',  -- Belgian official code
        tags->'ref',
        tags->'ISO3166-1:alpha2'
    ) as official_code,
    
    -- Country
    COALESCE(
        tags->'ISO3166-1:alpha2',
        'BE'
    ) as country_code,
    
    -- Geometry (stored as bytea in Prisma)
    ST_AsBinary(ST_Multi(way)) as geometry,
    
    -- Bounding box
    ST_YMin(ST_Envelope(way)) as min_lat,
    ST_YMax(ST_Envelope(way)) as max_lat,
    ST_XMin(ST_Envelope(way)) as min_lon,
    ST_XMax(ST_Envelope(way)) as max_lon,
    
    -- Centroid
    ST_Y(ST_Centroid(way)) as centroid_lat,
    ST_X(ST_Centroid(way)) as centroid_lon,
    
    -- Statistics
    COALESCE((tags->'population')::bigint, 0) as population,
    ROUND((ST_Area(way::geography) / 1000000)::numeric, 2) as area_sqkm,
    
    -- Metadata
    jsonb_build_object(
        'osm_id', osm_id,
        'osm_type', 'polygon',
        'admin_level', tags->'admin_level',
        'wikidata', tags->'wikidata',
        'wikipedia', tags->'wikipedia'
    ) as metadata,
    
    -- Flags
    true as is_official,
    
    -- Original OSM ID for reference
    osm_id
    
FROM osm__polygon
WHERE tags->'boundary' IN ('administrative', 'postal_code')
  AND (
    tags ? 'admin_level' 
    OR tags->'boundary' = 'postal_code'
  )
  AND tags ? 'name';

-- =============================================================================
-- 4. Export Queries for Different Admin Levels
-- =============================================================================

-- Export countries
\copy (SELECT * FROM boundaries_from_osm WHERE boundary_type = 'country') TO 'belgium_boundaries_country.csv' WITH CSV HEADER;

-- Export regions
\copy (SELECT * FROM boundaries_from_osm WHERE boundary_type = 'region') TO 'belgium_boundaries_regions.csv' WITH CSV HEADER;

-- Export provinces
\copy (SELECT * FROM boundaries_from_osm WHERE boundary_type = 'state') TO 'belgium_boundaries_provinces.csv' WITH CSV HEADER;

-- Export municipalities
\copy (SELECT * FROM boundaries_from_osm WHERE boundary_type = 'municipality') TO 'belgium_boundaries_municipalities.csv' WITH CSV HEADER;

-- Export neighborhoods
\copy (SELECT * FROM boundaries_from_osm WHERE boundary_type = 'neighborhood') TO 'belgium_boundaries_neighborhoods.csv' WITH CSV HEADER;

-- =============================================================================
-- 5. Statistics and Quality Checks
-- =============================================================================

-- Count by boundary type
SELECT 
    boundary_type,
    COUNT(*) as count,
    AVG(area_sqkm) as avg_area_sqkm,
    MIN(population) as min_pop,
    MAX(population) as max_pop
FROM boundaries_from_osm
GROUP BY boundary_type
ORDER BY 
    CASE boundary_type
        WHEN 'country' THEN 1
        WHEN 'region' THEN 2
        WHEN 'state' THEN 3
        WHEN 'district' THEN 4
        WHEN 'municipality' THEN 5
        WHEN 'city_district' THEN 6
        WHEN 'neighborhood' THEN 7
        WHEN 'postal_code' THEN 8
        ELSE 9
    END;

-- Check for missing names
SELECT 
    boundary_type,
    COUNT(*) as missing_names
FROM boundaries_from_osm
WHERE name IS NULL OR name = ''
GROUP BY boundary_type;

-- Check for valid geometries
SELECT 
    boundary_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE geometry IS NOT NULL) as has_geometry,
    COUNT(*) FILTER (WHERE ST_IsValid(ST_GeomFromWKB(geometry))) as valid_geometry
FROM boundaries_from_osm
GROUP BY boundary_type;
