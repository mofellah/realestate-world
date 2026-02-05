# Extract Belgium Boundaries from OSM Database
# Run this after load-osm-data.ps1 completes successfully

param(
    [string]$DBHost = "localhost",
    [string]$DBPort = "5432",
    [string]$DBUser = "postgres",
    [string]$DBPassword = "postgres",
    [string]$SourceDB = "realestate_osm",
    [string]$TargetDB = "realestate"
)

$env:PGPASSWORD = $DBPassword

Write-Host "=== Belgium Boundary Extraction ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Analyze available boundaries
Write-Host "[1/4] Analyzing boundary data..." -ForegroundColor Yellow
$analyzeQuery = @"
SELECT 
    admin_level,
    boundary as boundary_type,
    COUNT(*) as count
FROM osm__polygon
WHERE boundary IN ('administrative', 'postal_code')
GROUP BY admin_level, boundary
ORDER BY admin_level::int NULLS LAST;
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $SourceDB -c $analyzeQuery

# Step 2: Create transformation view
Write-Host ""
Write-Host "[2/4] Creating boundary transformation view..." -ForegroundColor Yellow
$viewQuery = @"
CREATE OR REPLACE VIEW boundaries_from_osm AS
SELECT 
    'osm_' || osm_id::text as id,
    COALESCE(\"name:en\", name, official_name) as name,
    lower(regexp_replace(COALESCE(\"name:en\", name, official_name), '[^a-zA-Z0-9]+', '-', 'g')) as name_slug,
    ARRAY[\"name:fr\", \"name:nl\", \"name:de\", alt_name, old_name]::text[] as alternate_names,
    CASE 
        WHEN admin_level = '2' THEN 'country'
        WHEN admin_level = '3' THEN 'region'
        WHEN admin_level = '4' THEN 'state'
        WHEN admin_level = '6' THEN 'district'
        WHEN admin_level = '7' THEN 'municipality'
        WHEN admin_level = '8' THEN 'city_district'
        WHEN admin_level = '10' THEN 'neighborhood'
        WHEN boundary = 'postal_code' THEN 'postal_code'
        ELSE 'other'
    END as boundary_type,
    COALESCE(ref, \"ISO3166-1:alpha2\") as official_code,
    COALESCE(\"ISO3166-1:alpha2\", 'BE') as country_code,
    ST_AsBinary(ST_Multi(ST_Force2D(way))) as geometry,
    ST_YMin(ST_Envelope(way)) as min_lat,
    ST_YMax(ST_Envelope(way)) as max_lat,
    ST_XMin(ST_Envelope(way)) as min_lon,
    ST_XMax(ST_Envelope(way)) as max_lon,
    ST_Y(ST_Centroid(way)) as centroid_lat,
    ST_X(ST_Centroid(way)) as centroid_lon,
    COALESCE(population::bigint, 0) as population,
    ROUND((ST_Area(way::geography) / 1000000)::numeric, 2) as area_sqkm,
    jsonb_build_object(
        'osm_id', osm_id,
        'osm_type', 'polygon',
        'admin_level', admin_level,
        'wikidata', wikidata,
        'wikipedia', wikipedia
    ) as metadata,
    true as is_official,
    osm_id
FROM osm__polygon
WHERE boundary IN ('administrative', 'postal_code')
  AND (admin_level IS NOT NULL OR boundary = 'postal_code')
  AND name IS NOT NULL;
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $SourceDB -c $viewQuery

Write-Host "View created successfully" -ForegroundColor Green

# Step 3: Count boundaries by type
Write-Host ""
Write-Host "[3/4] Counting boundaries by type..." -ForegroundColor Yellow
$countQuery = @"
SELECT 
    boundary_type,
    COUNT(*) as count,
    ROUND(AVG(area_sqkm)::numeric, 2) as avg_area_sqkm,
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
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $SourceDB -c $countQuery

# Step 4: Preview sample data
Write-Host ""
Write-Host "[4/4] Preview of extracted boundaries..." -ForegroundColor Yellow

Write-Host ""
Write-Host "Country (admin_level=2):" -ForegroundColor Cyan
$countryQuery = "SELECT name, official_code, boundary_type, ROUND(area_sqkm::numeric, 0) as area_km2 FROM boundaries_from_osm WHERE boundary_type = 'country' LIMIT 5;"
psql -h $DBHost -p $DBPort -U $DBUser -d $SourceDB -c $countryQuery

Write-Host ""
Write-Host "Regions (admin_level=3):" -ForegroundColor Cyan
$regionQuery = "SELECT name, boundary_type, ROUND(area_sqkm::numeric, 0) as area_km2 FROM boundaries_from_osm WHERE boundary_type = 'region' ORDER BY name LIMIT 10;"
psql -h $DBHost -p $DBPort -U $DBUser -d $SourceDB -c $regionQuery

Write-Host ""
Write-Host "Provinces (admin_level=4):" -ForegroundColor Cyan
$provinceQuery = "SELECT name, boundary_type, ROUND(area_sqkm::numeric, 0) as area_km2 FROM boundaries_from_osm WHERE boundary_type = 'state' ORDER BY name LIMIT 20;"
psql -h $DBHost -p $DBPort -U $DBUser -d $SourceDB -c $provinceQuery

Write-Host ""
Write-Host "Sample Municipalities (admin_level=7):" -ForegroundColor Cyan
$muniQuery = "SELECT name, official_code, population FROM boundaries_from_osm WHERE boundary_type = 'municipality' ORDER BY population DESC NULLS LAST LIMIT 20;"
psql -h $DBHost -p $DBPort -U $DBUser -d $SourceDB -c $muniQuery

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Review the extracted boundaries above" -ForegroundColor White
Write-Host "2. Run import-to-main-db.ps1 to load into your main database" -ForegroundColor White
Write-Host "3. Set up parent-child relationships" -ForegroundColor White
Write-Host ""

$env:PGPASSWORD = $null
