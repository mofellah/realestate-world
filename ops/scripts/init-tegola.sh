#!/bin/bash
# ============================================================================
# Initialize Tegola Vector Tile Server
# ============================================================================
# Usage: ./init-tegola.sh [environment]
# Examples:
#   ./init-tegola.sh dev
# ============================================================================

set -e

ENVIRONMENT=${1:-dev}
COMPOSE_FILE="../compose/docker-compose.${ENVIRONMENT}.yml"
TEGOLA_CONTAINER="realestate_tegola_${ENVIRONMENT}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_info "Initializing Tegola for environment: $ENVIRONMENT"

# Check if Tegola container exists
if ! docker-compose -f "$COMPOSE_FILE" ps tegola &>/dev/null; then
  log_warn "Tegola not running, starting..."
  docker-compose -f "$COMPOSE_FILE" up -d tegola
fi

# Wait for Tegola to be ready
log_info "Waiting for Tegola to be ready..."
max_attempts=20
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if curl -sf http://localhost:8081/capabilities >/dev/null 2>&1; then
    log_info "Tegola is ready!"
    break
  fi
  attempt=$((attempt + 1))
  sleep 2
  if [ $attempt -eq $max_attempts ]; then
    log_warn "Tegola took longer than expected to start (may still be initializing)"
  fi
done

# Test Tegola capabilities endpoint
log_info "Testing Tegola capabilities endpoint..."
if curl -sf http://localhost:8081/capabilities >/dev/null 2>&1; then
  log_info "✓ Tegola /capabilities endpoint responding"
else
  log_warn "✗ Tegola /capabilities endpoint not responding (may need database setup)"
fi

# Test Tegola tile endpoint (may return 404 if no data)
log_info "Testing Tegola tile endpoint..."
if curl -sf "http://localhost:8081/maps/properties/12/2096/1400.pbf" >/dev/null 2>&1; then
  log_info "✓ Tegola tile endpoint responding"
else
  log_info "⚠ Tegola tile endpoint may not have data yet (expected if database just initialized)"
fi

log_info "${GREEN}Tegola initialization complete!${NC}"
log_info "Tegola is accessible at http://localhost:8081"
log_info "Vector tiles: http://localhost:8081/maps/properties/{z}/{x}/{y}.pbf"
