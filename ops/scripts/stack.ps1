# ============================================================================
# Stack Orchestration Script - PowerShell Version (Windows)
# ============================================================================
# Manages Docker Compose stack: database, backend, frontend, Tegola
#
# Usage: .\stack.ps1 -Command <command> -Environment <environment>
#
# Commands:
#   Start      - Start all services
#   Stop       - Stop all services gracefully
#   Restart    - Restart all services
#   Down       - Tear down all services and volumes
#   Logs       - Show logs
#   Status     - Show service status
#   Init       - Initialize stack (migrations, seeds, PostGIS)
#   Health     - Check health of services
#   Shell      - Open shell in database
#   Psql       - Connect to PostgreSQL
#
# Examples:
#   .\stack.ps1 -Command Start -Environment dev
#   .\stack.ps1 -Command Init -Environment test
#   .\stack.ps1 -Command Logs
# ============================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('Start', 'Stop', 'Restart', 'Down', 'Logs', 'Status', 'Init', 'Health', 'Shell', 'Psql', 'Help')]
    [string]$Command = 'Help',
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'test', 'prod')]
    [string]$Environment = 'dev'
)

# Configuration
$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ComposeFile = Join-Path $BaseDir "compose\docker-compose.$Environment.yml"

# Color functions (Windows 10+ supports ANSI codes)
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Debug-Custom {
    param([string]$Message)
    Write-Host "[DEBUG] $Message" -ForegroundColor Cyan
}

# Validate environment
function Validate-Env {
    if (-not (Test-Path $ComposeFile)) {
        Write-Error-Custom "Compose file not found: $ComposeFile"
        Write-Host "Available environments:"
        Get-ChildItem "$BaseDir\compose\docker-compose.*.yml" | ForEach-Object {
            $env_name = $_.Name -replace 'docker-compose\.(.+)\.yml', '$1'
            Write-Host "  - $env_name"
        }
        exit 1
    }
}

# Start services
function Start-Services {
    Write-Info "Starting stack for environment: $Environment"
    Validate-Env
    
    docker-compose -f $ComposeFile up -d
    Write-Info "Waiting for services to initialize..."
    Start-Sleep -Seconds 5
    
    Show-Status
}

# Stop services
function Stop-Services {
    Write-Info "Stopping stack for environment: $Environment"
    Validate-Env
    
    docker-compose -f $ComposeFile stop
    Write-Info "Stack stopped gracefully"
}

# Restart services
function Restart-Services {
    Write-Info "Restarting stack for environment: $Environment"
    Stop-Services
    Start-Sleep -Seconds 2
    Start-Services
}

# Teardown stack
function Teardown-Stack {
    Write-Warn "WARNING: This will remove all containers and volumes!"
    $confirm = Read-Host "Type 'yes' to confirm"
    
    if ($confirm -ne "yes") {
        Write-Info "Teardown cancelled"
        return
    }
    
    Write-Info "Tearing down stack..."
    docker-compose -f $ComposeFile down -v --remove-orphans
    Write-Info "Stack torn down"
}

# Show logs
function Show-Logs {
    Write-Info "Showing logs for environment: $Environment (Press Ctrl+C to exit)"
    Validate-Env
    docker-compose -f $ComposeFile logs -f --tail=50
}

# Show status
function Show-Status {
    Write-Info "Stack status for environment: $Environment"
    Validate-Env
    docker-compose -f $ComposeFile ps
}

# Health checks
function Check-Health {
    Write-Info "Running health checks for environment: $Environment"
    Validate-Env
    
    Write-Host ""
    Write-Host "Database Health:" -ForegroundColor Cyan
    $dbHealthy = & { docker-compose -f $ComposeFile exec -T db pg_isready -U postgres 2>$null } | Select-String "accepting"
    if ($dbHealthy) {
        Write-Host "✓ Database is healthy" -ForegroundColor Green
    } else {
        Write-Host "✗ Database is not responding" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Backend Health:" -ForegroundColor Cyan
    try {
        $backendTest = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 2
        if ($backendTest.StatusCode -eq 200) {
            Write-Host "✓ Backend is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠ Backend health check failed" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Frontend Health:" -ForegroundColor Cyan
    try {
        $frontendTest = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2
        if ($frontendTest.StatusCode -eq 200) {
            Write-Host "✓ Frontend is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠ Frontend health check failed" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Tegola Health:" -ForegroundColor Cyan
    try {
        $tegolaTest = Invoke-WebRequest -Uri "http://localhost:8081/capabilities" -UseBasicParsing -TimeoutSec 2
        if ($tegolaTest.StatusCode -eq 200) {
            Write-Host "✓ Tegola is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠ Tegola health check failed" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Initialize stack
function Initialize-Stack {
    Write-Info "Initializing stack for environment: $Environment"
    Validate-Env
    
    Write-Info "Starting services..."
    docker-compose -f $ComposeFile up -d
    
    Start-Sleep -Seconds 5
    
    Write-Info "Waiting for database..."
    $maxAttempts = 30
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $dbReady = & { docker-compose -f $ComposeFile exec -T db pg_isready -U postgres 2>$null } | Select-String "accepting"
        if ($dbReady) {
            break
        }
        $attempt++
        Start-Sleep -Seconds 2
    }
    
    Write-Info "Initializing PostGIS..."
    & docker-compose -f $ComposeFile exec -T db psql -U postgres -d realestate -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>$null
    
    Write-Info "Running migrations..."
    & docker-compose -f $ComposeFile exec -T backend bash -c "npx prisma migrate deploy --schema=./db/schema.prisma" 2>$null
    
    Write-Info "Generating Prisma client..."
    & docker-compose -f $ComposeFile exec -T backend bash -c "npx prisma generate" 2>$null
    
    if ($Environment -eq "dev" -or $Environment -eq "test") {
        Write-Info "Seeding database..."
        & docker-compose -f $ComposeFile exec -T backend bash -c "SEED_TEST_DATA=true npm run seed --workspace=db" 2>$null
    }
    
    Write-Info "Stack initialization complete!"
    Check-Health
}

# Open shell
function Open-Shell {
    Write-Info "Opening shell in database container..."
    Validate-Env
    docker-compose -f $ComposeFile exec db bash
}

# Connect to PostgreSQL
function Connect-Psql {
    Write-Info "Connecting to PostgreSQL..."
    Validate-Env
    docker-compose -f $ComposeFile exec db psql -U postgres -d realestate
}

# Show help
function Show-Help {
    @"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stack Orchestration Script (PowerShell)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

USAGE: .\stack.ps1 -Command <command> -Environment <environment>

COMMANDS:
  Start        Start all services
  Stop         Stop all services gracefully
  Restart      Restart all services
  Down         Tear down stack (data loss!)
  Logs         Show live logs
  Status       Show service status
  Init         Initialize stack (migrations, seeds, PostGIS)
  Health       Run health checks
  Shell        Open shell in database
  Psql         Connect to PostgreSQL
  Help         Show this message

ENVIRONMENTS:
  dev          Development (default)
  test         Testing
  prod         Production

EXAMPLES:
  .\stack.ps1 -Command Start -Environment dev
  .\stack.ps1 -Command Init
  .\stack.ps1 -Command Logs -Environment test
  .\stack.ps1 -Command Health

SERVICE URLS:
  Backend:     http://localhost:3000
  Frontend:    http://localhost:5173
  Tegola:      http://localhost:8081
  Database:    localhost:5432 (postgres/postgres)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"@
}

# Main execution
switch ($Command) {
    'Start'   { Start-Services }
    'Stop'    { Stop-Services }
    'Restart' { Restart-Services }
    'Down'    { Teardown-Stack }
    'Logs'    { Show-Logs }
    'Status'  { Show-Status }
    'Init'    { Initialize-Stack }
    'Health'  { Check-Health }
    'Shell'   { Open-Shell }
    'Psql'    { Connect-Psql }
    'Help'    { Show-Help }
    default   { Show-Help }
}
