# ============================================================================
# OSM Boundaries Pipeline - Official Administrative Boundaries Only
# ============================================================================
# 
# Purpose: Extract official administrative boundaries from OSM staging DB
#          and load them into the main database via CSV intermediate format
#
# Flow: realestate_osm (staging) → CSV → realestate (main DB)
#
# Excluded: Neighborhoods (sparse, non-coherent)
# Included: country, state, municipality, district, city_district, postal_code
#
# ============================================================================

param(
    [string]$DBHost = "localhost",
    [string]$DBPort = "5432",
    [string]$DBUser = "postgres",
    [string]$DBPassword = "postgres",
    [string]$StagingDB = "realestate_osm",
    [string]$MainDB = "realestate",
    [string]$OutputDir = "data\csv",
    [string]$CountryCode = "BE"  # Belgium by default
)

$ErrorActionPreference = "Stop"

# Create output directory
Write-Host "`n=== OSM Boundaries Pipeline ===" -ForegroundColor Cyan
Write-Host "Output directory: $OutputDir" -ForegroundColor Gray

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "Created output directory: $OutputDir" -ForegroundColor Green
}

$csvFile = Join-Path $OutputDir "boundaries_${CountryCode}.csv"

# ============================================================================
# Step 1: Create boundaries extraction view (if not exists)
# ============================================================================

Write-Host "`n[Step 1/4] Creating boundaries extraction view..." -ForegroundColor Yellow

$env:PGPASSWORD = $DBPassword

$createViewSQL = @"
-- Drop view if exists
DROP VIEW IF EXISTS boundaries_from_osm CASCADE;

-- Create transformation view mapping OSM to Boundary model
CREATE VIEW boundaries_from_osm AS
SELECT
    -- Primary identifier
    'osm_' || osm_id::text AS id,
    
    -- Names (multi-language support)
    COALESCE(name, official_name, tags->'name:en') AS name,
    LOWER(REGEXP_REPLACE(
        COALESCE(name, official_name, tags->'name:en', 'unnamed_' || osm_id::text),
        '[^a-z0-9]+', '-', 'gi'
    )) AS name_slug,
    
    -- Alternate names (JSON array)
    jsonb_build_object(
        'fr', tags->'name:fr',
        'nl', tags->'name:nl',
        'de', tags->'name:de',
        'en', tags->'name:en',
        'alt', tags->'alt_name',
        'old', tags->'old_name'
    ) AS alternate_names,
    
    -- Boundary type mapping (exclude neighborhoods)
    CASE admin_level
        WHEN '2' THEN 'country'
        WHEN '3' THEN 'state'         -- Regions (Flanders, Wallonia, Brussels)
        WHEN '4' THEN 'state'         -- Provinces
        WHEN '5' THEN 'district'      -- Arrondissements
        WHEN '6' THEN 'district'
        WHEN '7' THEN 'municipality'  -- Gemeenten/Communes
        WHEN '8' THEN 'city_district' -- Deelgemeenten/Sections
        WHEN '9' THEN 'city_district'
        WHEN '10' THEN 'postal_code'  -- Postal zones
        ELSE 'other'
    END AS boundary_type,
    
    -- Official codes
    COALESCE(tags->'ref:INS', ref) AS official_code,
    
    -- Country code
    '$CountryCode' AS country_code,
    
    -- Geometry (convert to bytes for Prisma)
    ST_Multi(ST_Force2D(way))::geometry(MultiPolygon, 4326) AS geometry,
    
    -- Bounding box (for spatial indexing)
    ST_YMin(ST_Envelope(way)) AS min_lat,
    ST_YMax(ST_Envelope(way)) AS max_lat,
    ST_XMin(ST_Envelope(way)) AS min_lon,
    ST_XMax(ST_Envelope(way)) AS max_lon,
    
    -- Centroid (for distance queries)
    ST_Y(ST_Centroid(way)) AS centroid_lat,
    ST_X(ST_Centroid(way)) AS centroid_lon,
    
    -- Statistics
    NULLIF(population, '')::integer AS population,
    CAST(ROUND(CAST(ST_Area(way::geography) / 1000000.0 AS numeric), 2) AS double precision) AS area_sqkm,
    
    -- Metadata (JSON)
    jsonb_build_object(
        'osm_id', osm_id,
        'admin_level', admin_level,
        'wikidata', tags->'wikidata',
        'wikipedia', tags->'wikipedia',
        'place', tags->'place',
        'postal_code', tags->'postal_code'
    ) AS metadata,
    
    -- Quality flags
    (official_name IS NOT NULL OR tags->'ref:INS' IS NOT NULL) AS is_official,
    
    -- Timestamps
    NOW() AS created_at,
    NOW() AS updated_at
FROM osm__polygon
WHERE 
    boundary = 'administrative'
    AND admin_level IN ('2', '3', '4', '5', '6', '7', '8', '9', '10')
    AND name IS NOT NULL
    -- Exclude neighborhoods (admin_level 11+)
    AND admin_level::integer <= 10
ORDER BY admin_level::integer, population DESC NULLS LAST;
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $StagingDB -c $createViewSQL
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create boundaries view" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Boundaries extraction view created" -ForegroundColor Green

# ============================================================================
# Step 2: Export boundaries to CSV
# ============================================================================

Write-Host "`n[Step 2/4] Exporting boundaries to CSV..." -ForegroundColor Yellow

# Get statistics before export
$statsSQL = @"
SELECT 
    boundary_type,
    COUNT(*) as count,
    SUM(COALESCE(population, 0)) as total_population,
    ROUND(AVG(area_sqkm), 2) as avg_area_sqkm
FROM boundaries_from_osm
GROUP BY boundary_type
ORDER BY 
    CASE boundary_type
        WHEN 'country' THEN 1
        WHEN 'state' THEN 2
        WHEN 'district' THEN 3
        WHEN 'municipality' THEN 4
        WHEN 'city_district' THEN 5
        WHEN 'postal_code' THEN 6
        ELSE 99
    END;
"@

Write-Host "`nBoundary Statistics (before deduplication):" -ForegroundColor Cyan
psql -h $DBHost -p $DBPort -U $DBUser -d $StagingDB -c $statsSQL

# Export to CSV with proper encoding for geometry
$exportSQL = @"
\copy (
    SELECT DISTINCT ON (name_slug, boundary_type, country_code)
        id, name, name_slug, alternate_names::text,
        boundary_type, official_code, country_code,
        ST_AsText(geometry) as geometry_wkt,
        min_lat, max_lat, min_lon, max_lon,
        centroid_lat, centroid_lon,
        population, area_sqkm,
        metadata::text,
        is_official
    FROM boundaries_from_osm
    ORDER BY name_slug, boundary_type, country_code, 
             population DESC NULLS LAST, 
             area_sqkm DESC NULLS LAST
) TO '$($csvFile.Replace('\', '\\'))' WITH (FORMAT CSV, HEADER true, ENCODING 'UTF8');
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $StagingDB -c $exportSQL
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to export CSV" -ForegroundColor Red
    exit 1
}

# Check CSV file size
$fileInfo = Get-Item $csvFile
Write-Host "✓ Exported to: $csvFile" -ForegroundColor Green
Write-Host "  File size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
Write-Host "  Rows: $((Get-Content $csvFile | Measure-Object -Line).Lines - 1)" -ForegroundColor Gray

# ============================================================================
# Step 3: Import CSV to main database
# ============================================================================

Write-Host "`n[Step 3/4] Importing CSV to main database..." -ForegroundColor Yellow

# Ensure main database exists and has PostGIS
$setupMainDB = @"
-- Create database if not exists (will fail silently if exists)
SELECT 'Main database check' AS status;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Truncate existing boundaries for this country
DELETE FROM boundaries WHERE country_code = '$CountryCode';
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $MainDB -c $setupMainDB

# Import CSV with geometry conversion
$csvPath = (Resolve-Path $csvFile).Path
Write-Host "Importing from: $csvPath" -ForegroundColor Gray

# Use psql's \copy through STDIN
$importCmd = @"
DROP TABLE IF EXISTS boundaries_temp;
CREATE TEMPORARY TABLE boundaries_temp (
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
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $MainDB -c $importCmd

# Create SQL file with \copy command
$importSQLFile = Join-Path $OutputDir "import-boundaries.sql"
$importScript = @"
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

\copy boundaries_temp FROM '$($csvPath.Replace('\', '/'))' WITH (FORMAT CSV, HEADER true, ENCODING 'UTF8')

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
WHERE b.country_code = '$CountryCode'
GROUP BY bt.code, bt.level
ORDER BY bt.level;
"@

Set-Content -Path $importSQLFile -Value $importScript -Encoding UTF8
Write-Host "Running import script..." -ForegroundColor Gray
psql -h $DBHost -p $DBPort -U $DBUser -d $MainDB -f $importSQLFile
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to import to main database" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Imported to main database" -ForegroundColor Green

# ============================================================================
# Step 4: Verify import
# ============================================================================

Write-Host "`n[Step 4/4] Verifying import..." -ForegroundColor Yellow

$verifySQL = @"
SELECT 
    COUNT(*) as total_boundaries,
    COUNT(DISTINCT bt.code) as distinct_types,
    COUNT(CASE WHEN b."isOfficial" THEN 1 END) as official_count,
    SUM(COALESCE(b.population, 0)) as total_population,
    CAST(ROUND(CAST(SUM(b.area_sqkm) AS numeric), 2) AS double precision) as total_area_sqkm
FROM boundaries b
JOIN boundary_types bt ON b."boundaryTypeId" = bt.id
WHERE b.country_code = '$CountryCode';
"@

Write-Host "`nFinal Statistics:" -ForegroundColor Cyan
psql -h $DBHost -p $DBPort -U $DBUser -d $MainDB -c $verifySQL

# Sample records
$sampleSQL = @"
SELECT b.name, bt.code as boundary_type, b.population, CAST(ROUND(CAST(b.area_sqkm AS numeric), 2) AS double precision) as area_sqkm
FROM boundaries b
JOIN boundary_types bt ON b."boundaryTypeId" = bt.id
WHERE b.country_code = '$CountryCode'
ORDER BY b.population DESC NULLS LAST
LIMIT 10;
"@

Write-Host "`nTop 10 by Population:" -ForegroundColor Cyan
psql -h $DBHost -p $DBPort -U $DBUser -d $MainDB -c $sampleSQL

# ============================================================================
# Completion
# ============================================================================

Write-Host "`n=== Pipeline Complete ===" -ForegroundColor Green
Write-Host "✓ Boundaries extracted from OSM staging" -ForegroundColor Green
Write-Host "✓ CSV exported: $csvFile" -ForegroundColor Green
Write-Host "✓ Imported to main database: $MainDB" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Run 4-create-indexes.sql to optimize queries" -ForegroundColor Gray
Write-Host "  2. Run 5-update-hierarchy.sql to set up parent-child relationships" -ForegroundColor Gray
Write-Host "  3. Test spatial queries with PostGIS" -ForegroundColor Gray

Write-Host "`nCSV file location: $csvFile" -ForegroundColor Cyan
Write-Host "  (Keep this CSV for fast database rebuilds)" -ForegroundColor Gray
