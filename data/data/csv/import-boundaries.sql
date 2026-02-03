DROP TABLE IF EXISTS boundaries_temp;
CREATE TABLE boundaries_temp (
    id TEXT,
    name TEXT,
    name_slug TEXT,
    alternate_names TEXT,
    boundary_type TEXT,
    official_code TEXT,
    country_code TEXT,
    geometry_wkt TEXT,
    min_lat DOUBLE PRECISION,
    max_lat DOUBLE PRECISION,
    min_lon DOUBLE PRECISION,
    max_lon DOUBLE PRECISION,
    centroid_lat DOUBLE PRECISION,
    centroid_lon DOUBLE PRECISION,
    population INTEGER,
    area_sqkm DOUBLE PRECISION,
    metadata TEXT,
    is_official BOOLEAN
);

\copy boundaries_temp FROM 'C:/Users/fella/Desktop/projects/realestate-world/data/data/csv/boundaries_BE.csv' WITH (FORMAT CSV, HEADER true, ENCODING 'UTF8')

-- Insert with geometry conversion
INSERT INTO boundaries (
    id, name, "nameSlug", "alternateNames", "boundaryTypeId",
    "officialCode", country_code, geometry,
    "minLat", "maxLat", "minLon", "maxLon",
    "centroidLat", "centroidLon", population, area_sqkm,
    metadata, "isOfficial", "createdAt", "updatedAt"
)
SELECT 
    id, 
    name, 
    name_slug,
    ARRAY[alternate_names]::text[],
    (SELECT id FROM boundary_types WHERE code = t.boundary_type AND "countryCode" = t.country_code) as "boundaryTypeId",
    official_code,
    country_code,
    ST_GeomFromText(geometry_wkt, 4326)::bytea,
    min_lat, max_lat, min_lon, max_lon,
    centroid_lat, centroid_lon,
    population,
    area_sqkm,
    metadata::jsonb,
    is_official,
    NOW(),
    NOW()
FROM boundaries_temp t;

DROP TABLE boundaries_temp;

-- Statistics
SELECT 
    bt.code as boundary_type,
    COUNT(*) as count,
    SUM(COALESCE(b.population, 0)) as total_population,
    CAST(ROUND(CAST(AVG(b.area_sqkm) AS numeric), 2) AS double precision) as avg_area_sqkm
FROM boundaries b
JOIN boundary_types bt ON b."boundaryTypeId" = bt.id
WHERE b.country_code = 'BE'
GROUP BY bt.code, bt.level
ORDER BY bt.level;
