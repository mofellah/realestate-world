#!/bin/bash
# ============================================================================
# Initialize Database with Migrations and PostGIS
# ============================================================================
# Usage: ./init-db.sh [environment]
# Examples:
#   ./init-db.sh dev     # Initialize development database
#   ./init-db.sh test    # Initialize test database
# ============================================================================

set -e

ENVIRONMENT=${1:-dev}
COMPOSE_FILE="../compose/docker-compose.${ENVIRONMENT}.yml"
DB_CONTAINER="realestate_db_${ENVIRONMENT}"
DB_NAME=${DB_NAME:-realestate}
DB_USER=${DB_USER:-postgres}

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

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
  log_error "Compose file not found: $COMPOSE_FILE"
  exit 1
fi

log_info "Initializing database for environment: $ENVIRONMENT"

# Wait for database to be ready
log_info "Waiting for database to be healthy..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if docker-compose -f "$COMPOSE_FILE" exec -T db pg_isready -U "$DB_USER" &>/dev/null; then
    log_info "Database is ready!"
    break
  fi
  attempt=$((attempt + 1))
  sleep 2
  if [ $attempt -eq $max_attempts ]; then
    log_error "Database failed to start after $((max_attempts * 2)) seconds"
    exit 1
  fi
done

# Create database if not exists
log_info "Creating database if not exists..."
docker-compose -f "$COMPOSE_FILE" exec -T db psql -U "$DB_USER" -tc \
  "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  docker-compose -f "$COMPOSE_FILE" exec -T db createdb -U "$DB_USER" "$DB_NAME"

# Initialize PostGIS extension
log_info "Initializing PostGIS extension..."
docker-compose -f "$COMPOSE_FILE" exec -T db psql -U "$DB_USER" -d "$DB_NAME" -c \
  "CREATE EXTENSION IF NOT EXISTS postgis;"

log_info "PostGIS extension created (or already exists)"

# Run migrations
log_info "Running Prisma migrations..."
docker-compose -f "$COMPOSE_FILE" exec -T backend bash -c \
  "cd . && npx prisma migrate deploy --schema=./db/schema.prisma" || true

# Generate Prisma Client
log_info "Generating Prisma Client..."
docker-compose -f "$COMPOSE_FILE" exec -T backend bash -c \
  "cd . && npx prisma generate" || true

# Seed database
if [ "$ENVIRONMENT" = "dev" ] || [ "$ENVIRONMENT" = "test" ]; then
  log_info "Seeding database with test data..."
  docker-compose -f "$COMPOSE_FILE" exec -T backend bash -c \
    "SEED_TEST_DATA=true npm run seed --workspace=db" || \
    log_warn "Seeding failed or not applicable"
fi

log_info "${GREEN}Database initialization complete!${NC}"
