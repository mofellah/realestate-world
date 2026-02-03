# ============================================================================
# Master OSM Data Pipeline - Run All Stages
# ============================================================================
# 
# Purpose: Orchestrate complete OSM data processing pipeline
#          From raw OSM PBF to production-ready database with CSV exports
#
# Pipeline Stages:
#   0. Load OSM data into staging DB (load-osm-data.ps1)
#   1. Extract & export boundaries → CSV
#   2. Extract & export amenities → CSV
#   3. Extract & export addresses → CSV (optional)
#   4. Create PostGIS indexes
#   5. Update boundary hierarchy
#
# Usage: .\run-pipeline.ps1 -CountryCode BE -SkipOSMLoad
#
# ============================================================================

param(
    [string]$DBHost = "localhost",
    [string]$DBPort = "5432",
    [string]$DBUser = "postgres",
    [string]$DBPassword = "postgres",
    [string]$StagingDB = "realestate_osm",
    [string]$MainDB = "realestate",
    [string]$CountryCode = "BE",
    [string]$OSMFile = "data\belgium-latest.osm.pbf",
    [switch]$SkipOSMLoad = $false,
    [switch]$SkipAddresses = $true,  # Skip by default (use official sources)
    [switch]$SkipAmenities = $false
)

$ErrorActionPreference = "Stop"
$startTime = Get-Date

# ============================================================================
# Configuration
# ============================================================================

Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        OSM Data Pipeline - Real Estate Platform               ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Country Code:    $CountryCode" -ForegroundColor Gray
Write-Host "  Staging DB:      $StagingDB" -ForegroundColor Gray
Write-Host "  Main DB:         $MainDB" -ForegroundColor Gray
Write-Host "  OSM File:        $OSMFile" -ForegroundColor Gray
Write-Host "  Skip OSM Load:   $SkipOSMLoad" -ForegroundColor Gray
Write-Host "  Skip Addresses:  $SkipAddresses" -ForegroundColor Gray
Write-Host "  Skip Amenities:  $SkipAmenities" -ForegroundColor Gray
Write-Host ""

$env:PGPASSWORD = $DBPassword

# ============================================================================
# Stage 0: Load OSM Data (Optional)
# ============================================================================

if (-not $SkipOSMLoad) {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ Stage 0: Loading OSM Data into Staging Database               ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not (Test-Path $OSMFile)) {
        Write-Host "ERROR: OSM file not found: $OSMFile" -ForegroundColor Red
        Write-Host "Download from: https://download.geofabrik.de/" -ForegroundColor Yellow
        exit 1
    }
    
    $stage0Start = Get-Date
    & ".\load-osm-data.ps1" `
        -DBHost $DBHost `
        -DBPort $DBPort `
        -DBUser $DBUser `
        -DBPassword $DBPassword `
        -DBName $StagingDB `
        -OSMFile $OSMFile
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Stage 0 failed" -ForegroundColor Red
        exit 1
    }
    
    $stage0Duration = (Get-Date) - $stage0Start
    Write-Host "✓ Stage 0 completed in $($stage0Duration.ToString('mm\:ss'))" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⊳ Skipping Stage 0 (OSM load)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# Stage 1: Boundaries Pipeline
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ Stage 1: Extracting Administrative Boundaries                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$stage1Start = Get-Date
& ".\1-boundaries-pipeline.ps1" `
    -DBHost $DBHost `
    -DBPort $DBPort `
    -DBUser $DBUser `
    -DBPassword $DBPassword `
    -StagingDB $StagingDB `
    -MainDB $MainDB `
    -CountryCode $CountryCode

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Stage 1 failed" -ForegroundColor Red
    exit 1
}

$stage1Duration = (Get-Date) - $stage1Start
Write-Host "✓ Stage 1 completed in $($stage1Duration.ToString('mm\:ss'))" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Stage 2: Amenities Pipeline (Optional)
# ============================================================================

if (-not $SkipAmenities) {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ Stage 2: Extracting Amenities (POI)                           ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    $stage2Start = Get-Date
    & ".\2-amenities-pipeline.ps1" `
        -DBHost $DBHost `
        -DBPort $DBPort `
        -DBUser $DBUser `
        -DBPassword $DBPassword `
        -StagingDB $StagingDB `
        -MainDB $MainDB `
        -CountryCode $CountryCode
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Stage 2 had issues (non-critical)" -ForegroundColor Yellow
    }
    
    $stage2Duration = (Get-Date) - $stage2Start
    Write-Host "✓ Stage 2 completed in $($stage2Duration.ToString('mm\:ss'))" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⊳ Skipping Stage 2 (Amenities)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# Stage 3: Addresses Pipeline (Optional)
# ============================================================================

if (-not $SkipAddresses) {
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║ Stage 3: Extracting Addresses (Baseline)                      ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    $stage3Start = Get-Date
    & ".\3-addresses-pipeline.ps1" `
        -DBHost $DBHost `
        -DBPort $DBPort `
        -DBUser $DBUser `
        -DBPassword $DBPassword `
        -StagingDB $StagingDB `
        -CountryCode $CountryCode
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Stage 3 had issues (non-critical)" -ForegroundColor Yellow
    }
    
    $stage3Duration = (Get-Date) - $stage3Start
    Write-Host "✓ Stage 3 completed in $($stage3Duration.ToString('mm\:ss'))" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⊳ Skipping Stage 3 (Addresses)" -ForegroundColor Yellow
    Write-Host ""
}

# ============================================================================
# Stage 4: Create PostGIS Indexes
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ Stage 4: Creating PostGIS Spatial Indexes                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$stage4Start = Get-Date
psql -h $DBHost -p $DBPort -U $DBUser -d $MainDB -f "4-create-indexes.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Stage 4 failed" -ForegroundColor Red
    exit 1
}

$stage4Duration = (Get-Date) - $stage4Start
Write-Host "✓ Stage 4 completed in $($stage4Duration.ToString('mm\:ss'))" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Stage 5: Update Boundary Hierarchy
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ Stage 5: Building Boundary Hierarchy                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$stage5Start = Get-Date
psql -h $DBHost -p $DBPort -U $DBUser -d $MainDB -f "5-update-hierarchy.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Stage 5 failed" -ForegroundColor Red
    exit 1
}

$stage5Duration = (Get-Date) - $stage5Start
Write-Host "✓ Stage 5 completed in $($stage5Duration.ToString('mm\:ss'))" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Final Summary
# ============================================================================

$totalDuration = (Get-Date) - $startTime

Write-Host @"

╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                   PIPELINE COMPLETE ✓                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "Total Duration: $($totalDuration.ToString('hh\:mm\:ss'))" -ForegroundColor Cyan
Write-Host ""

# Show final statistics
Write-Host "Database Status:" -ForegroundColor Yellow
$statsSQL = @"
SELECT 
    'Boundaries' as entity,
    COUNT(*) as count,
    COUNT(DISTINCT "boundaryType") as types,
    SUM(COALESCE(population, 0)) as total_population
FROM boundaries
WHERE country_code = '$CountryCode';
"@

psql -h $DBHost -p $DBPort -U $DBUser -d $MainDB -c $statsSQL

Write-Host ""
Write-Host "CSV Files Generated:" -ForegroundColor Yellow
Get-ChildItem "csv\*_$CountryCode.csv" -ErrorAction SilentlyContinue | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines - 1
    Write-Host "  $($_.Name): $size MB ($lines rows)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Test spatial queries with backend API" -ForegroundColor Gray
Write-Host "  2. Import amenities CSV if table schema exists" -ForegroundColor Gray
Write-Host "  3. Set up incremental OSM updates (osmosis/osmupdate)" -ForegroundColor Gray
Write-Host "  4. Monitor query performance with EXPLAIN ANALYZE" -ForegroundColor Gray

Write-Host ""
Write-Host "Fast Rebuild:" -ForegroundColor Cyan
Write-Host "  Use CSV files in data/csv/ for instant database rebuild" -ForegroundColor Gray
Write-Host "  (Much faster than re-processing OSM PBF)" -ForegroundColor Gray
Write-Host ""
