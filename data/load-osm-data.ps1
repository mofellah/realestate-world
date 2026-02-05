# Load Belgium OSM Data into PostgreSQL with PostGIS
param(
    [string]$DBHost = "localhost",
    [string]$DBPort = "5432",
    [string]$DBUser = "postgres",
    [string]$DBPassword = "postgres",
    [string]$DBName = "realestate_osm"
)

$OSM_FILE = Join-Path $PSScriptRoot "belgium-latest.osm.pbf"

Write-Host "=== OSM Data Import for Belgium ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check osm2pgsql
Write-Host "[1/5] Checking osm2pgsql installation..." -ForegroundColor Yellow
try {
    $version = osm2pgsql --version 2>&1 | Select-Object -First 1
    Write-Host "osm2pgsql found: $version" -ForegroundColor Green
} catch {
    Write-Host "osm2pgsql not found in PATH" -ForegroundColor Red
    exit 1
}

# Step 2: Check OSM file
Write-Host ""
Write-Host "[2/5] Checking OSM data file..." -ForegroundColor Yellow
if (-Not (Test-Path $OSM_FILE)) {
    Write-Host "OSM file not found: $OSM_FILE" -ForegroundColor Red
    exit 1
}
$fileSize = [math]::Round(((Get-Item $OSM_FILE).Length / 1MB), 2)
Write-Host "Found: belgium-latest.osm.pbf ($fileSize MB)" -ForegroundColor Green

# Step 3: Create database
Write-Host ""
Write-Host "[3/5] Creating database '$DBName'..." -ForegroundColor Yellow
$env:PGPASSWORD = $DBPassword

Write-Host "  Dropping existing database..." -ForegroundColor Gray
$dropCmd = "DROP DATABASE IF EXISTS $DBName;"
psql -h $DBHost -p $DBPort -U $DBUser -d postgres -c $dropCmd 2>&1 | Out-Null

Write-Host "  Creating new database..." -ForegroundColor Gray
$createCmd = "CREATE DATABASE $DBName;"
psql -h $DBHost -p $DBPort -U $DBUser -d postgres -c $createCmd 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to create database" -ForegroundColor Red
    exit 1
}

# Step 4: Enable PostGIS
Write-Host ""
Write-Host "[4/5] Enabling PostGIS extension..." -ForegroundColor Yellow
$postgisCmd = "CREATE EXTENSION IF NOT EXISTS postgis;"
$hstoreCmd = "CREATE EXTENSION IF NOT EXISTS hstore;"
psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -c $postgisCmd 2>&1 | Out-Null
psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -c $hstoreCmd 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "PostGIS and hstore extensions enabled" -ForegroundColor Green
} else {
    Write-Host "Failed to enable extensions" -ForegroundColor Red
    exit 1
}

# Step 5: Import OSM data
Write-Host ""
Write-Host "[5/5] Importing OSM data (this may take several minutes)..." -ForegroundColor Yellow
Write-Host "  Using slim mode with hstore and boundary style..." -ForegroundColor Gray

$styleFile = Join-Path $PSScriptRoot "boundary.style"
$startTime = Get-Date

osm2pgsql --create --slim --hstore --latlong --extra-attributes --prefix osm_ --database $DBName --host $DBHost --port $DBPort --user $DBUser --style $styleFile $OSM_FILE

if ($LASTEXITCODE -eq 0) {
    $duration = (Get-Date) - $startTime
    Write-Host ""
    Write-Host "OSM data imported successfully!" -ForegroundColor Green
    Write-Host "Duration: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "OSM import failed" -ForegroundColor Red
    exit 1
}

# Step 6: Verify
Write-Host ""
Write-Host "=== Verifying Import ===" -ForegroundColor Cyan
Write-Host ""

$tables = @("osm_point", "osm_line", "osm_polygon", "osm_roads")
foreach ($table in $tables) {
    $countCmd = "SELECT COUNT(*) FROM $table;"
    $count = psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -t -c $countCmd 2>&1
    if ($count -match '\d+') {
        $countNum = [int]($count -replace '\s', '')
        $formatted = $countNum.ToString('N0')
        Write-Host "  ${table}: $formatted rows" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Checking administrative boundaries..." -ForegroundColor Yellow
$adminCmd = "SELECT tags->'admin_level' as admin_level, COUNT(*) as count FROM osm_polygon WHERE tags ? 'admin_level' GROUP BY tags->'admin_level' ORDER BY (tags->'admin_level')::int;"
psql -h $DBHost -p $DBPort -U $DBUser -d $DBName -c $adminCmd

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Review the imported data in database: $DBName" -ForegroundColor White
Write-Host "2. Run extract-boundaries.sql to extract boundary data" -ForegroundColor White
Write-Host ""
Write-Host "Connection string:" -ForegroundColor Yellow
Write-Host "  postgresql://${DBUser}:${DBPassword}@${DBHost}:${DBPort}/${DBName}" -ForegroundColor Gray
Write-Host ""

$env:PGPASSWORD = $null
