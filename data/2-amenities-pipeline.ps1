# ============================================================================
# OSM Amenities Pipeline - Extract Points of Interest
# ============================================================================
# 
# Purpose: Extract amenities (restaurants, schools, parks, shops, etc.)
#          from OSM staging DB and load into main database via CSV
#
# Flow: realestate_osm (staging) → CSV → realestate (main DB)
#
# Amenity Types: restaurant, school, hospital, park, bank, pharmacy, etc.
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
    [string]$CountryCode = "BE"
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== OSM Amenities Pipeline ===" -ForegroundColor Cyan

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$csvFile = Join-Path $OutputDir "amenities_${CountryCode}.csv"

$env:PGPASSWORD = $DBPassword

# ============================================================================
# Step 1: Create amenities extraction view
# ============================================================================

Write-Host "`n[Step 1/4] Creating amenities extraction view..." -ForegroundColor Yellow

$createViewSQL = @"
-- Drop view if exists
DROP VIEW IF EXISTS amenities_from_osm CASCADE;

-- Create amenities extraction view
CREATE VIEW amenities_from_osm AS
SELECT
    -- Identifier
    'osm_amenity_' || osm_id::text AS id,
    
    -- Name
    COALESCE(name, tags->'name:en', tags->'amenity' || '_' || osm_id::text) AS name,
    
    -- Amenity type (maps to our schema categories)
    CASE 
        -- Food & Drink
        WHEN tags->'amenity' IN ('restaurant', 'cafe', 'fast_food', 'bar', 'pub', 'food_court', 'biergarten') 
            THEN 'food_drink'
        
        -- Education
        WHEN tags->'amenity' IN ('school', 'university', 'college', 'kindergarten', 'library', 'music_school', 'language_school')
            THEN 'education'
        
        -- Healthcare
        WHEN tags->'amenity' IN ('hospital', 'clinic', 'doctors', 'dentist', 'pharmacy', 'veterinary')
            THEN 'healthcare'
        
        -- Shopping
        WHEN tags->'amenity' IN ('marketplace', 'supermarket') OR tags->'shop' IS NOT NULL
            THEN 'shopping'
        
        -- Finance
        WHEN tags->'amenity' IN ('bank', 'atm', 'bureau_de_change')
            THEN 'finance'
        
        -- Transportation
        WHEN tags->'amenity' IN ('parking', 'bicycle_parking', 'taxi', 'car_rental', 'fuel', 'charging_station')
            THEN 'transportation'
        
        -- Entertainment
        WHEN tags->'amenity' IN ('cinema', 'theatre', 'nightclub', 'arts_centre', 'community_centre', 'casino')
            THEN 'entertainment'
        
        -- Recreation
        WHEN tags->'amenity' IN ('park', 'playground', 'sports_centre', 'swimming_pool', 'fitness_centre', 'stadium')
            OR tags->'leisure' IS NOT NULL
            THEN 'recreation'
        
        -- Public Services
        WHEN tags->'amenity' IN ('post_office', 'police', 'fire_station', 'townhall', 'courthouse', 'embassy')
            THEN 'public_service'
        
        -- Religious
        WHEN tags->'amenity' IN ('place_of_worship', 'monastery', 'church', 'cathedral')
            THEN 'religious'
        
        -- Other
        ELSE 'other'
    END AS category,
    
    -- Specific amenity type
    COALESCE(tags->'amenity', tags->'shop', tags->'leisure', tags->'tourism') AS amenity_type,
    
    -- Address components
    tags->'addr:housenumber' AS house_number,
    tags->'addr:street' AS street,
    tags->'addr:postcode' AS postal_code,
    tags->'addr:city' AS city,
    
    -- Contact information
    tags->'phone' AS phone,
    tags->'website' AS website,
    tags->'email' AS email,
    
    -- Opening hours
    tags->'opening_hours' AS opening_hours,
    
    -- Coordinates (from point geometry)
    ST_Y(way) AS latitude,
    ST_X(way) AS longitude,
    
    -- Country code
    '$CountryCode' AS country_code,
    
    -- Metadata
    jsonb_build_object(
        'osm_id', osm_id,
        'amenity', tags->'amenity',
        'shop', tags->'shop',
        'leisure', tags->'leisure',
        'tourism', tags->'tourism',
        'cuisine', tags->'cuisine',
        'brand', tags->'brand',
        'operator', tags->'operator',
        'wikidata', tags->'wikidata',
        'wikipedia', tags->'wikipedia',
        'wheelchair', tags->'wheelchair',
        'internet_access', tags->'internet_access'
    ) AS metadata,
    
    -- Timestamps
    NOW() AS created_at,
    NOW() AS updated_at
FROM osm__point
WHERE 
    (
        tags->'amenity' IS NOT NULL 
        OR tags->'shop' IS NOT NULL 
        OR tags->'leisure' IS NOT NULL 
        OR tags->'tourism' IN ('hotel', 'museum', 'attraction', 'viewpoint', 'information')
    )
    AND (
        tags->'amenity' NOT IN ('waste_basket', 'bench', 'vending_machine', 'toilets', 'recycling', 'telephone')
        OR tags->'amenity' IS NULL
    )
    AND name IS NOT NULL
ORDER BY name;
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $StagingDB -c $createViewSQL
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to create amenities view" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Amenities extraction view created" -ForegroundColor Green

# ============================================================================
# Step 2: Export amenities to CSV
# ============================================================================

Write-Host "`n[Step 2/4] Exporting amenities to CSV..." -ForegroundColor Yellow

# Statistics before export
$statsSQL = @"
SELECT 
    category,
    COUNT(*) as count,
    COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as with_phone,
    COUNT(CASE WHEN website IS NOT NULL THEN 1 END) as with_website,
    COUNT(CASE WHEN opening_hours IS NOT NULL THEN 1 END) as with_hours
FROM amenities_from_osm
GROUP BY category
ORDER BY count DESC;
"@

Write-Host "`nAmenity Statistics:" -ForegroundColor Cyan
psql -h $DBHost -p $DBPort -U $DBUser -d $StagingDB -c $statsSQL

# Export to CSV
$exportSQL = @"
\copy (
    SELECT 
        id, name, category, amenity_type,
        house_number, street, postal_code, city,
        phone, website, email, opening_hours,
        latitude, longitude, country_code,
        metadata::text
    FROM amenities_from_osm
    ORDER BY category, name
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
# Step 3: Import CSV to main database (if amenities table exists)
# ============================================================================

Write-Host "`n[Step 3/4] Checking main database schema..." -ForegroundColor Yellow

# Check if amenities table exists
$checkTableSQL = @"
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'amenities'
);
"@

$tableExists = psql -h $DBHost -p $DBPort -U $DBUser -d $MainDB -t -c $checkTableSQL

if ($tableExists -match 't') {
    Write-Host "✓ Amenities table exists, importing..." -ForegroundColor Green
    
    # Import logic (similar to boundaries)
    $importSQL = @"
-- Create temporary table
DROP TABLE IF EXISTS amenities_temp;
CREATE TEMPORARY TABLE amenities_temp (
    id TEXT,
    name TEXT,
    category TEXT,
    amenity_type TEXT,
    house_number TEXT,
    street TEXT,
    postal_code TEXT,
    city TEXT,
    phone TEXT,
    website TEXT,
    email TEXT,
    opening_hours TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    country_code TEXT,
    metadata TEXT
);

-- Import CSV
\copy amenities_temp FROM '$($csvFile.Replace('\', '\\'))' WITH (FORMAT CSV, HEADER true, ENCODING 'UTF8');

-- Delete existing amenities for this country
DELETE FROM amenities WHERE country_code = '$CountryCode';

-- Insert into amenities table
INSERT INTO amenities (
    id, name, category, "amenityType",
    "houseNumber", street, "postalCode", city,
    phone, website, email, "openingHours",
    latitude, longitude, country_code,
    metadata, created_at, updated_at
)
SELECT 
    id, name, category, amenity_type,
    house_number, street, postal_code, city,
    phone, website, email, opening_hours,
    latitude, longitude, country_code,
    metadata::jsonb, NOW(), NOW()
FROM amenities_temp;

-- Statistics
SELECT 
    category,
    COUNT(*) as count,
    COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as with_contact
FROM amenities
WHERE country_code = '$CountryCode'
GROUP BY category
ORDER BY count DESC;
"@
    
    psql -h $DBHost -p $DBPort -U $DBUser -d $MainDB -c $importSQL
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Imported to main database" -ForegroundColor Green
    } else {
        Write-Host "⚠ Import had issues (table schema mismatch?)" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Amenities table doesn't exist in schema yet" -ForegroundColor Yellow
    Write-Host "  CSV exported, import manually when table is created" -ForegroundColor Gray
}

# ============================================================================
# Step 4: Verification
# ============================================================================

Write-Host "`n[Step 4/4] Pipeline complete" -ForegroundColor Yellow

Write-Host "`n=== Pipeline Complete ===" -ForegroundColor Green
Write-Host "✓ Amenities extracted from OSM" -ForegroundColor Green
Write-Host "✓ CSV exported: $csvFile" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Add amenities table to Prisma schema if not exists" -ForegroundColor Gray
Write-Host "  2. Create spatial indexes on (latitude, longitude)" -ForegroundColor Gray
Write-Host "  3. Link amenities to boundaries via spatial join" -ForegroundColor Gray

Write-Host "`nCSV file location: $csvFile" -ForegroundColor Cyan
