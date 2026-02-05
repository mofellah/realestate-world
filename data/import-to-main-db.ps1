# Import Boundaries from OSM to Main Database
# This script imports boundaries from realestate_osm into the main realestate database

param(
    [string]$DBHost = "localhost",
    [string]$DBPort = "5432",
    [string]$DBUser = "postgres",
    [string]$DBPassword = "postgres",
    [string]$SourceDB = "realestate_osm",
    [string]$TargetDB = "realestate"
)

$env:PGPASSWORD = $DBPassword

Write-Host "=== Import Boundaries to Main Database ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if view exists
Write-Host "[1/4] Checking boundaries_from_osm view..." -ForegroundColor Yellow
$viewCheck = psql -h $DBHost -p $DBPort -U $DBUser -d $SourceDB -t -c "SELECT COUNT(*) FROM boundaries_from_osm;" 2>&1
if ($viewCheck -match '\d+') {
    $count = [int]($viewCheck -replace '\s', '')
    Write-Host "Found $count boundaries ready to import" -ForegroundColor Green
} else {
    Write-Host "View not found. Please run extract-and-preview.ps1 first" -ForegroundColor Red
    exit 1
}

# Step 2: Check target database and table
Write-Host ""
Write-Host "[2/4] Checking target database..." -ForegroundColor Yellow
$tableCheck = psql -h $DBHost -p $DBPort -U $DBUser -d $TargetDB -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'boundaries';" 2>&1
if ($tableCheck -match '1') {
    Write-Host "boundaries table exists in $TargetDB" -ForegroundColor Green
} else {
    Write-Host "boundaries table not found. Please run Prisma migrations first" -ForegroundColor Red
    Write-Host "  cd db && npx prisma migrate dev" -ForegroundColor Yellow
    exit 1
}

# Step 3: Clear existing Belgium boundaries (optional)
Write-Host ""
Write-Host "[3/4] Clearing existing Belgium boundaries..." -ForegroundColor Yellow
$deleteCmd = 'DELETE FROM boundaries WHERE country_code = ''BE'';'
$deleteResult = psql -h $DBHost -p $DBPort -U $DBUser -d $TargetDB -c $deleteCmd 2>&1
Write-Host "Cleared existing Belgium boundaries" -ForegroundColor Gray

# Step 4: Import boundaries
Write-Host ""
Write-Host "[4/4] Importing boundaries..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray

# Build the import query - use single quotes to avoid PowerShell escaping issues
$importQuery = @'
INSERT INTO boundaries (
    name, "nameSlug", "alternateNames", "boundaryType",
    "officialCode", country_code, geometry,
    "minLat", "maxLat", "minLon", "maxLon",
    "centroidLat", "centroidLon", population, area_sqkm,
    metadata, "isOfficial", created_at, updated_at
)
SELECT 
    b.name, 
    b.name_slug, 
    b.alternate_names, 
    b.boundary_type::boundary_type,
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
    'SELECT name, name_slug, alternate_names, boundary_type::text, official_code, country_code, geometry, min_lat, max_lat, min_lon, max_lon, centroid_lat, centroid_lon, population, area_sqkm, metadata, is_official FROM boundaries_from_osm'
) AS b(
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
'@

$startTime = Get-Date
$result = psql -h $DBHost -p $DBPort -U $DBUser -d $TargetDB -c $importQuery 2>&1
$duration = (Get-Date) - $startTime

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Import successful!" -ForegroundColor Green
    Write-Host "Duration: $($duration.Seconds)s" -ForegroundColor Gray
    
    # Count imported boundaries
    Write-Host ""
    Write-Host "=== Import Summary ===" -ForegroundColor Cyan
    $summaryQuery = 'SELECT "boundaryType", COUNT(*) as count FROM boundaries WHERE country_code = ''BE'' GROUP BY "boundaryType" ORDER BY count DESC;'
    psql -h $DBHost -p $DBPort -U $DBUser -d $TargetDB -c $summaryQuery
    
} else {
    Write-Host ""
    Write-Host "Import failed!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Set up parent-child relationships between boundaries" -ForegroundColor White
Write-Host "2. Test the neighborhood search API with Belgium data" -ForegroundColor White
Write-Host "3. Add search rankings based on population/area" -ForegroundColor White
Write-Host ""

$env:PGPASSWORD = $null
