#Requires -Version 5.0
<#
.SYNOPSIS
Comprehensive stack verification and diagnostic script for Real Estate World platform

.DESCRIPTION
Verifies all services, databases, and integrations are working correctly.
Runs health checks, connectivity tests, and generates detailed diagnostic report.

.PARAMETER Environment
Environment to verify: dev, test, or prod (default: dev)

.PARAMETER Verbose
Show detailed diagnostic information

.EXAMPLE
.\verify-stack.ps1 -Environment dev
.\verify-stack.ps1 -Environment prod -Verbose
#>

param(
    [string]$Environment = "dev",
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$WarningPreference = "Continue"

# Colors for output
$colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput($message, $color) {
    Write-Host $message -ForegroundColor $color
}

function Write-Success($message) {
    Write-ColorOutput "✓ $message" $colors.Success
}

function Write-Error($message) {
    Write-ColorOutput "✗ $message" $colors.Error
}

function Write-Warning($message) {
    Write-ColorOutput "⚠ $message" $colors.Warning
}

function Write-Info($message) {
    Write-ColorOutput "ℹ $message" $colors.Info
}

function Write-Header($message) {
    Write-ColorOutput "`n========== $message ==========" $colors.Header
}

# Validate environment
if ($Environment -notin @("dev", "test", "prod")) {
    Write-Error "Invalid environment: $Environment. Use 'dev', 'test', or 'prod'."
    exit 1
}

$composeFile = "ops/compose/docker-compose.$Environment.yml"
if (-not (Test-Path $composeFile)) {
    Write-Error "Compose file not found: $composeFile"
    exit 1
}

Write-Header "Real Estate World Platform - Verification Report"
Write-Info "Environment: $Environment"
Write-Info "Compose File: $composeFile"
Write-Info "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')"

# Track failures
$failures = @()
$warnings = @()

# ============================================================================
# 1. Docker & Compose Setup
# ============================================================================
Write-Header "1. Docker & Docker Compose Setup"

try {
    $dockerVersion = docker --version
    Write-Success "Docker installed: $dockerVersion"
} catch {
    Write-Error "Docker not found. Please install Docker Desktop."
    $failures += "Docker not installed"
}

try {
    $composeVersion = docker compose version
    Write-Success "Docker Compose installed: $composeVersion"
} catch {
    Write-Warning "Docker Compose version command failed. Using legacy 'docker-compose'."
}

# ============================================================================
# 2. Services Status
# ============================================================================
Write-Header "2. Service Status"

$services = @("db", "backend", "frontend", "tegola")
$runningServices = @()
$stoppedServices = @()

foreach ($service in $services) {
    try {
        $ps = docker-compose -f $composeFile ps $service 2>&1
        if ($ps -like "*running*" -or $ps -like "*Up*") {
            Write-Success "$service is running"
            $runningServices += $service
        } elseif ($ps -like "*exited*" -or $ps -like "*Exited*") {
            Write-Error "$service is stopped"
            $stoppedServices += $service
            $failures += "$service not running"
        } else {
            Write-Warning "$service status unknown"
            $warnings += "$service status unclear"
        }
    } catch {
        Write-Error "Could not determine status of $service"
        $failures += "Cannot determine $service status"
    }
}

Write-Info "Running: $($runningServices.Count) | Stopped: $($stoppedServices.Count)"

# ============================================================================
# 3. Database Connectivity
# ============================================================================
Write-Header "3. Database Connectivity"

try {
    $dbCheck = docker-compose -f $composeFile exec -T db pg_isready -U postgres 2>&1
    if ($dbCheck -like "*accepting*") {
        Write-Success "Database is accepting connections"
    } else {
        Write-Warning "Database health status unclear: $dbCheck"
        $warnings += "Database health check ambiguous"
    }
} catch {
    Write-Error "Database connection failed: $_"
    $failures += "Database not responding"
}

# Check if database exists
try {
    $dbExists = docker-compose -f $composeFile exec -T db psql -U postgres -lqt 2>&1 | grep -i realestate
    if ($dbExists) {
        Write-Success "Database 'realestate' exists"
    } else {
        Write-Warning "Database 'realestate' not found"
        $warnings += "Database may not be initialized"
    }
} catch {
    Write-Warning "Could not check database list"
}

# Check PostGIS extension
try {
    $postgis = docker-compose -f $composeFile exec -T db psql -U postgres -d realestate -c "SELECT PostGIS_Version();" 2>&1
    if ($postgis -like "*PostGIS*") {
        Write-Success "PostGIS extension active"
    } else {
        Write-Warning "PostGIS extension not found or not active"
        $warnings += "PostGIS extension may need initialization"
    }
} catch {
    Write-Warning "PostGIS check failed (may not be initialized): $_"
}

# ============================================================================
# 4. Backend API Health
# ============================================================================
Write-Header "4. Backend API Health"

try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:3000/health" -ErrorAction Stop
    Write-Success "Backend is responding to requests"
    if ($Verbose) {
        Write-Info "Health response: $($backendHealth | ConvertTo-Json)"
    }
} catch {
    Write-Error "Backend health check failed: $_"
    $failures += "Backend API not responding"
}

# ============================================================================
# 5. Frontend Server
# ============================================================================
Write-Header "5. Frontend Server"

$frontendPort = if ($Environment -eq "prod") { 80 } else { 5173 }
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:$frontendPort" -ErrorAction Stop -TimeoutSec 5
    Write-Success "Frontend is serving on port $frontendPort"
} catch {
    Write-Error "Frontend not responding on port $frontendPort: $_"
    $failures += "Frontend not accessible"
}

# ============================================================================
# 6. Tegola Vector Tile Server
# ============================================================================
Write-Header "6. Tegola Vector Tile Server"

try {
    $tegolaCaps = Invoke-RestMethod -Uri "http://localhost:8081/capabilities" -ErrorAction Stop
    Write-Success "Tegola is running and responding"
    
    if ($tegolaCaps.layers) {
        Write-Success "Tegola has $($tegolaCaps.layers.Count) layers configured"
    }
} catch {
    Write-Error "Tegola not responding: $_"
    $failures += "Tegola not accessible"
}

# ============================================================================
# 7. Database Tables & Data
# ============================================================================
Write-Header "7. Database Tables & Data"

try {
    # Check tables
    $tables = docker-compose -f $composeFile exec -T db psql -U postgres -d realestate -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" 2>&1
    $tableList = $tables -split '\n' | Where-Object { $_ -match '\S' } | ForEach-Object { $_.Trim() }
    Write-Success "Found $($tableList.Count) tables"
    
    if ($Verbose) {
        Write-Info "Tables: $($tableList -join ', ')"
    }
    
    # Check record counts
    $propertyCount = docker-compose -f $composeFile exec -T db psql -U postgres -d realestate -t -c "SELECT COUNT(*) FROM properties;" 2>&1
    Write-Info "Properties: $($propertyCount.Trim())"
    
    $addressCount = docker-compose -f $composeFile exec -T db psql -U postgres -d realestate -t -c "SELECT COUNT(*) FROM addresses;" 2>&1
    Write-Info "Addresses: $($addressCount.Trim())"
    
    $geoObjectCount = docker-compose -f $composeFile exec -T db psql -U postgres -d realestate -t -c "SELECT COUNT(*) FROM geo_objects;" 2>&1
    Write-Info "Geo Objects: $($geoObjectCount.Trim())"
    
    $geoObjectWithCoords = docker-compose -f $composeFile exec -T db psql -U postgres -d realestate -t -c "SELECT COUNT(*) FROM geo_objects WHERE latitude IS NOT NULL AND longitude IS NOT NULL;" 2>&1
    Write-Info "Geo Objects with coordinates: $($geoObjectWithCoords.Trim())"
    
} catch {
    Write-Warning "Could not check database contents: $_"
}

# ============================================================================
# 8. Network & DNS
# ============================================================================
Write-Header "8. Network & DNS"

try {
    $network = docker-compose -f $composeFile exec -T backend ping -c 1 db 2>&1
    if ($?) {
        Write-Success "Backend can resolve 'db' hostname"
    }
} catch {
    Write-Warning "DNS resolution check inconclusive"
}

# ============================================================================
# 9. Volume Status
# ============================================================================
Write-Header "9. Docker Volumes"

try {
    $volumes = docker volume ls --filter "name=realestate" -q
    if ($volumes) {
        Write-Success "Found realestate volumes: $($volumes.Count)"
        if ($Verbose) {
            Write-Info "Volumes:`n$volumes"
        }
    } else {
        Write-Warning "No realestate volumes found"
    }
} catch {
    Write-Warning "Could not list volumes: $_"
}

# ============================================================================
# 10. Container Logs (Sample)
# ============================================================================
if ($Verbose) {
    Write-Header "10. Recent Container Logs (Last 10 lines)"
    
    foreach ($service in $services) {
        Write-Info "`n--- $service logs ---"
        try {
            docker-compose -f $composeFile logs --tail=10 $service 2>&1 | Select-Object -Last 10
        } catch {
            Write-Warning "Could not retrieve logs for $service"
        }
    }
}

# ============================================================================
# Summary & Recommendations
# ============================================================================
Write-Header "Verification Summary"

if ($failures.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Success "✓ All checks passed! Platform is healthy."
    exit 0
} elseif ($failures.Count -eq 0) {
    Write-Warning "Warnings detected, but no critical failures."
    Write-Warning "Warnings:"
    $warnings | ForEach-Object { Write-Warning "  - $_" }
    exit 0
} else {
    Write-Error "Critical failures detected!"
    Write-Error "Failures:"
    $failures | ForEach-Object { Write-Error "  - $_" }
    Write-Warning "`nRecommendations:"
    
    if ($failures -contains "Docker not installed") {
        Write-Info "  1. Install Docker Desktop from https://docker.com"
    }
    
    if ($failures | Where-Object { $_ -like "*not running*" }) {
        Write-Info "  2. Start services: .\stack.ps1 -Command Start -Environment $Environment"
    }
    
    if ($failures | Where-Object { $_ -like "*Database*" }) {
        Write-Info "  3. Initialize database: .\stack.ps1 -Command Init -Environment $Environment"
    }
    
    if ($failures | Where-Object { $_ -like "*API*" }) {
        Write-Info "  4. Check backend logs: .\stack.ps1 -Command Logs -Environment $Environment"
    }
    
    exit 1
}
