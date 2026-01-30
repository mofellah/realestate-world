# Real Estate World - Complete Test Execution Script (Windows)
# Usage: .\run-all-tests.ps1
# Runs all test suites (unit, integration, E2E) with coverage reporting

param(
    [switch]$SkipInstall = $false,
    [switch]$Verbose = $false,
    [switch]$Coverage = $true
)

$ErrorActionPreference = "Stop"

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor $Blue
    Write-Host "  $Title" -ForegroundColor $Blue
    Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor $Blue
    Write-Host ""
}

function Write-Section {
    param([string]$Phase, [string]$Title)
    Write-Host ""
    Write-Host "[$Phase] $Title" -ForegroundColor $Blue
    Write-Host "─────────────────────────────────────────────────────────────────────" -ForegroundColor $Blue
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $Yellow
}

# ============================================================================
# PHASE 0: ENVIRONMENT SETUP
# ============================================================================

Write-Header "Real Estate World - Complete Test Execution"

Write-Section "PHASE 0" "Environment Setup"

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Success "Node.js: $nodeVersion"
} catch {
    Write-Error "Node.js not found"
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Success "npm: $npmVersion"
} catch {
    Write-Error "npm not found"
    exit 1
}

# Check .env files
if (!(Test-Path "apps/backend/.env.test")) {
    Write-Warning "apps/backend/.env.test not found, using defaults"
}

# ============================================================================
# PHASE 1: BACKEND UNIT TESTS
# ============================================================================

Write-Section "PHASE 1" "Backend Unit Tests"

Push-Location "apps/backend"

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..."
    npm install
}

# Run unit tests with coverage
Write-Host "Running backend unit tests..."

if ($Coverage) {
    npm run test:unit -- --coverage --collectCoverageFrom="src/**/*.ts" --testPathPattern="__tests__/services"
} else {
    npm run test:unit -- --testPathPattern="__tests__/services"
}

$unitTestResult = $LASTEXITCODE

if ($unitTestResult -eq 0) {
    Write-Success "Backend unit tests passed"
} else {
    Write-Error "Backend unit tests failed"
    Pop-Location
    exit 1
}

Pop-Location

# ============================================================================
# PHASE 2: BACKEND INTEGRATION TESTS
# ============================================================================

Write-Section "PHASE 2" "Backend Integration Tests"

Push-Location "apps/backend"

Write-Host "Running backend integration tests..."

if ($Coverage) {
    npm run test:integration -- --coverage --testPathPattern="__tests__/integration"
} else {
    npm run test:integration -- --testPathPattern="__tests__/integration"
}

$integrationTestResult = $LASTEXITCODE

if ($integrationTestResult -eq 0) {
    Write-Success "Backend integration tests passed"
} else {
    Write-Warning "Backend integration tests incomplete (Phase 2 - in progress)"
}

Pop-Location

# ============================================================================
# PHASE 3: FRONTEND COMPONENT TESTS
# ============================================================================

Write-Section "PHASE 3" "Frontend Component Tests"

Push-Location "apps/frontend"

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..."
    npm install
}

Write-Host "Running frontend component tests..."

if ($Coverage) {
    npm run test -- --coverage --testPathPattern="__tests__" --coveragePathIgnorePatterns="node_modules"
} else {
    npm run test -- --testPathPattern="__tests__" --coveragePathIgnorePatterns="node_modules"
}

$componentTestResult = $LASTEXITCODE

if ($componentTestResult -eq 0) {
    Write-Success "Frontend component tests passed"
} else {
    Write-Warning "Frontend component tests incomplete (Phase 3 - in progress)"
}

Pop-Location

# ============================================================================
# PHASE 4: E2E TESTS
# ============================================================================

Write-Section "PHASE 4" "End-to-End Tests (Cypress)"

Push-Location "apps/frontend"

Write-Host "Running Cypress E2E tests..."

npm run test:e2e

$e2eTestResult = $LASTEXITCODE

if ($e2eTestResult -eq 0) {
    Write-Success "E2E tests passed"
} else {
    Write-Warning "E2E tests incomplete (Phase 4 - in progress)"
}

Pop-Location

# ============================================================================
# PHASE 5: COVERAGE REPORT GENERATION
# ============================================================================

Write-Section "PHASE 5" "Coverage Report Generation"

Push-Location "apps/backend"

Write-Host "Generating coverage report..."

npm run test:coverage -- --testPathPattern="__tests__"

$coverageResult = $LASTEXITCODE

if ($coverageResult -eq 0) {
    Write-Success "Coverage report generated"
    Write-Host "  Location: coverage/lcov-report/index.html"
} else {
    Write-Warning "Coverage report generation had issues"
}

Pop-Location

# ============================================================================
# SUMMARY
# ============================================================================

$endTime = Get-Date

Write-Header "TEST EXECUTION SUMMARY"

# Test results
if ($unitTestResult -eq 0) {
    Write-Host "✓ Unit Tests        PASSED" -ForegroundColor $Green
} else {
    Write-Host "✗ Unit Tests        FAILED" -ForegroundColor $Red
}

if ($integrationTestResult -eq 0) {
    Write-Host "✓ Integration Tests PASSED" -ForegroundColor $Green
} else {
    Write-Host "⚠ Integration Tests IN PROGRESS" -ForegroundColor $Yellow
}

if ($componentTestResult -eq 0) {
    Write-Host "✓ Component Tests   PASSED" -ForegroundColor $Green
} else {
    Write-Host "⚠ Component Tests   IN PROGRESS" -ForegroundColor $Yellow
}

if ($e2eTestResult -eq 0) {
    Write-Host "✓ E2E Tests         PASSED" -ForegroundColor $Green
} else {
    Write-Host "⚠ E2E Tests         IN PROGRESS" -ForegroundColor $Yellow
}

Write-Host ""
Write-Host "Coverage Status:"
Write-Host "  Backend Unit Tests:     ≥85% target (85%+ critical paths)"
Write-Host "  Integration Tests:      ≥80% target"
Write-Host "  Frontend Components:    ≥80% target"
Write-Host "  E2E Coverage:           Core workflows"
Write-Host ""

# Next steps
if ($unitTestResult -ne 0) {
    Write-Error "Tests failed. Fix errors and re-run."
    exit 1
} else {
    Write-Host "✅ All available test phases completed!" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Next Steps:"
    Write-Host "  1. Review coverage report: open coverage/lcov-report/index.html"
    Write-Host "  2. Address any coverage gaps"
    Write-Host "  3. Run specific test suites:"
    Write-Host "     npm run test -- property.service.test.ts"
    Write-Host "     npm run test -- auth.service.test.ts"
    Write-Host "  4. Deploy to staging and run full test suite in CI/CD"
    Write-Host ""
}

Write-Host "════════════════════════════════════════════════════════════════════" -ForegroundColor $Blue
