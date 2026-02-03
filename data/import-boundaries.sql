-- Import Belgium boundaries from OSM database
-- Run with: psql -h localhost -U postgres -d realestate -f import-boundaries.sql

\set ON_ERROR_STOP on

-- Enable dblink if not already enabled
CREATE EXTENSION IF NOT EXISTS dblink;

-- Clear existing Belgium boundaries
DELETE FROM boundaries WHERE country_code = 'BE';

-- Import boundaries
INSERT INTO boundaries (
    id,
    name, 
    "nameSlug", 
    "alternateNames", 
    "boundaryType",
    "officialCode", 
    country_code, 
    geometry,
    "minLat", 
    "maxLat", 
    "minLon", 
    "maxLon",
    "centroidLat", 
    "centroidLon", 
    population, 
    area_sqkm,
    metadata, 
    "isOfficial",
    "createdAt",
    "updatedAt"
)
SELECT 
    b.id,
    b.name, 
    b.name_slug, 
    b.alternate_names, 
    b.boundary_type::"BoundaryType",
    b.official_code, 
    b.country_code, 
    b.geometry,
    b.min_lat, 
    b.max_lat, 
    b.min_lon, 
    b.max_lon,
    b.centroid_lat, 
    b.centroid_lon, 
    b.population, 
    b.area_sqkm,
    b.metadata, 
    b.is_official,
    NOW(),
    NOW()
FROM dblink(
    'dbname=realestate_osm host=localhost port=5432 user=postgres password=postgres',
    'SELECT DISTINCT ON (name_slug, boundary_type, country_code) id, name, name_slug, alternate_names, boundary_type::text, official_code, country_code, geometry, min_lat, max_lat, min_lon, max_lon, centroid_lat, centroid_lon, population, area_sqkm, metadata, is_official FROM boundaries_from_osm ORDER BY name_slug, boundary_type, country_code, population DESC NULLS LAST, area_sqkm DESC NULLS LAST'
) AS b(
    id text,
    name text, 
    name_slug text, 
    alternate_names text[], 
    boundary_type text,
    official_code text, 
    country_code text, 
    geometry bytea,
    min_lat numeric, 
    max_lat numeric, 
    min_lon numeric, 
    max_lon numeric,
    centroid_lat numeric, 
    centroid_lon numeric, 
    population bigint, 
    area_sqkm numeric,
    metadata jsonb, 
    is_official boolean
);

-- Show import summary
SELECT 
    "boundaryType",
    COUNT(*) as count,
    SUM(population) as total_population,
    ROUND(AVG(area_sqkm)::numeric, 2) as avg_area_sqkm
FROM boundaries
WHERE country_code = 'BE'
GROUP BY "boundaryType"
ORDER BY count DESC;
