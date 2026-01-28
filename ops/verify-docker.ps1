# Docker Build Verification Script

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Docker Build Verification" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Navigate to compose directory
Set-Location "ops/compose"

# Test development build
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Testing Development Build" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Building images (this may take a few minutes)..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml build --no-cache

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Development build successful" -ForegroundColor Green
} else {
    Write-Host "❌ Development build failed" -ForegroundColor Red
    Set-Location ../..
    exit 1
}

Write-Host ""
Write-Host "Starting containers..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Containers started" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start containers" -ForegroundColor Red
    docker compose -f docker-compose.dev.yml down
    Set-Location ../..
    exit 1
}

Write-Host ""
Write-Host "Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host ""
Write-Host "Checking services..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml ps

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Service URLs" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8080" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Green
Write-Host "Health:   http://localhost:3000/health" -ForegroundColor Green
Write-Host "Database: localhost:5432" -ForegroundColor Green
Write-Host ""

Write-Host "Press any key to stop containers and cleanup..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host ""
Write-Host "Stopping containers..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml down

Write-Host ""
Write-Host "✅ Verification complete" -ForegroundColor Green
Set-Location ../..
