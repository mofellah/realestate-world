# ============================================================================
# OSM Addresses Pipeline - Extract Address Points (Baseline)
# ============================================================================
# 
# Purpose: Extract addresses from OSM as baseline dataset
#          Note: Superior datasets (e.g., official address registries) exist
#          This is a fallback/validation source
#
# Flow: realestate_osm (staging) → CSV → realestate (main DB)
#
# ============================================================================

param(
    [string]$DBHost = "localhost",
    [string]$DBPort = "5432",
    [string]$DBUser = "postgres",
    [string]$DBPassword = "postgres",
    [string]$StagingDB = "realestate_osm",
    [string]$OutputDir = "data\csv",
    [string]$CountryCode = "BE"
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== OSM Addresses Pipeline (Baseline) ===" -ForegroundColor Cyan
Write-Host "NOTE: This extracts OSM addresses as fallback." -ForegroundColor Yellow
Write-Host "      Use official address registries for production." -ForegroundColor Yellow

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$csvFile = Join-Path $OutputDir "addresses_osm_${CountryCode}.csv"

$env:PGPASSWORD = $DBPassword

# ============================================================================
# Step 1: Create addresses extraction view
# ============================================================================

Write-Host "`n[Step 1/3] Creating addresses extraction view..." -ForegroundColor Yellow

$createViewSQL = @"
-- Drop view if exists
DROP VIEW IF EXISTS addresses_from_osm CASCADE;

-- Create addresses extraction view
CREATE VIEW addresses_from_osm AS
SELECT
    -- Identifier
    'osm_addr_' || osm_id::text AS id,
    
    -- Address components
    "addr:housenumber" AS house_number,
    "addr:street" AS street,
    "addr:postcode" AS postal_code,
    "addr:city" AS city,
    "addr:suburb" AS suburb,
    "addr:district" AS district,
    "addr:province" AS province,
    "addr:state" AS state,
    
    -- Building information
    name AS building_name,
    building AS building_type,
    "building:levels" AS building_levels,
    
    -- Coordinates
    ST_Y(way) AS latitude,
    ST_X(way) AS longitude,
    
    -- Country code
    '$CountryCode' AS country_code,
    
    -- Metadata
    jsonb_build_object(
        'osm_id', osm_id,
        'place', place,
        'amenity', amenity,
        'shop', shop,
        'office', office
    ) AS metadata,
    
    -- Timestamps
    NOW() AS created_at,
    NOW() AS updated_at
FROM osm__point
WHERE 
    "addr:housenumber" IS NOT NULL
    AND "addr:street" IS NOT NULL
    AND (
        "addr:postcode" IS NOT NULL
        OR "addr:city" IS NOT NULL
    )
ORDER BY "addr:city", "addr:street", "addr:housenumber";
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $StagingDB -c $createViewSQL
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create addresses view" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Addresses extraction view created" -ForegroundColor Green

# ============================================================================
# Step 2: Export addresses to CSV
# ============================================================================

Write-Host "`n[Step 2/3] Exporting addresses to CSV..." -ForegroundColor Yellow

# Statistics
$statsSQL = @"
SELECT 
    COUNT(*) as total_addresses,
    COUNT(DISTINCT postal_code) as unique_postcodes,
    COUNT(DISTINCT city) as unique_cities,
    COUNT(CASE WHEN building_name IS NOT NULL THEN 1 END) as named_buildings
FROM addresses_from_osm;
"@

Write-Host "`nAddress Statistics:" -ForegroundColor Cyan
psql -h $DBHost -p $DBPort -U $DBUser -d $StagingDB -c $statsSQL

# Sample by city
$sampleSQL = @"
SELECT 
    city,
    COUNT(*) as address_count
FROM addresses_from_osm
WHERE city IS NOT NULL
GROUP BY city
ORDER BY address_count DESC
LIMIT 20;
"@

Write-Host "`nTop 20 Cities by Address Count:" -ForegroundColor Cyan
psql -h $DBHost -p $DBPort -U $DBUser -d $StagingDB -c $sampleSQL

# Export to CSV
$exportSQL = @"
\copy (
    SELECT 
        id, house_number, street, postal_code, city,
        suburb, district, province, state,
        building_name, building_type, building_levels,
        latitude, longitude, country_code,
        metadata::text
    FROM addresses_from_osm
    ORDER BY city, street, house_number
) TO '$($csvFile.Replace('\', '\\'))' WITH (FORMAT CSV, HEADER true, ENCODING 'UTF8');
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $StagingDB -c $exportSQL
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to export CSV" -ForegroundColor Red
    exit 1
}

$fileInfo = Get-Item $csvFile
Write-Host "✓ Exported to: $csvFile" -ForegroundColor Green
Write-Host "  File size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
Write-Host "  Rows: $((Get-Content $csvFile | Measure-Object -Line).Lines - 1)" -ForegroundColor Gray

# ============================================================================
# Step 3: Summary
# ============================================================================

Write-Host "`n[Step 3/3] Pipeline complete" -ForegroundColor Yellow

Write-Host "`n=== Pipeline Complete ===" -ForegroundColor Green
Write-Host "✓ Addresses extracted from OSM" -ForegroundColor Green
Write-Host "✓ CSV exported: $csvFile" -ForegroundColor Green

Write-Host "`n⚠ IMPORTANT:" -ForegroundColor Yellow
Write-Host "  OSM addresses are incomplete and may be outdated" -ForegroundColor Gray
Write-Host "  For production, use official sources:" -ForegroundColor Gray
Write-Host "    - Belgium: BeSt Address (https://opendata.bosa.be/)" -ForegroundColor Gray
Write-Host "    - Alternative: Commercial geocoding services" -ForegroundColor Gray

Write-Host "`nCSV file location: $csvFile" -ForegroundColor Cyan
Write-Host "  (Use for validation/fallback only)" -ForegroundColor Gray
