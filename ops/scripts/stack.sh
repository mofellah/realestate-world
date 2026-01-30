#!/bin/bash
# ============================================================================
# Stack Orchestration Script - Production Grade
# ============================================================================
# Manages the full Docker Compose stack with database, backend, frontend, Tegola
# 
# Usage: ./stack.sh <command> [environment]
# 
# Commands:
#   start      - Start all services (db, backend, frontend, tegola)
#   stop       - Stop all services gracefully
#   restart    - Restart all services
#   down       - Tear down all services and volumes (WARNING: data loss)
#   logs       - Show logs for all services (follow mode)
#   status     - Show status of all services
#   init       - Initialize stack (migrations, seeds, PostGIS)
#   health     - Check health of all services
#   shell      - Open shell in database container
#   psql       - Connect to PostgreSQL directly
#
# Examples:
#   ./stack.sh start dev
#   ./stack.sh init dev
#   ./stack.sh logs test
#   ./stack.sh shell dev
# ============================================================================

set -e

COMMAND=${1:-help}
ENVIRONMENT=${2:-dev}
COMPOSE_FILE="compose/docker-compose.${ENVIRONMENT}.yml"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
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

log_debug() {
  echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Validate environment
validate_env() {
  if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "Compose file not found: $COMPOSE_FILE"
    echo "Available environments:"
    ls compose/docker-compose.*.yml 2>/dev/null | sed 's/.*docker-compose\./  - /' | sed 's/\.yml//'
    exit 1
  fi
}

# Start services
start_services() {
  log_info "Starting stack for environment: $ENVIRONMENT"
  validate_env
  
  docker-compose -f "$COMPOSE_FILE" up -d
  
  log_info "Waiting for database to be healthy..."
  sleep 5
  
  if docker-compose -f "$COMPOSE_FILE" exec -T db pg_isready -U postgres &>/dev/null; then
    log_info "✓ Database is ready"
  else
    log_warn "Database health check inconclusive"
  fi
  
  log_info "${GREEN}Stack started successfully!${NC}"
  show_status
}

# Stop services
stop_services() {
  log_info "Stopping stack for environment: $ENVIRONMENT"
  validate_env
  
  docker-compose -f "$COMPOSE_FILE" stop
  log_info "${GREEN}Stack stopped gracefully${NC}"
}

# Restart services
restart_services() {
  log_info "Restarting stack for environment: $ENVIRONMENT"
  stop_services
  sleep 2
  start_services
}

# Tear down stack
teardown_stack() {
  log_warn "WARNING: This will remove all containers and volumes!"
  read -p "Are you sure? Type 'yes' to confirm: " confirm
  
  if [ "$confirm" != "yes" ]; then
    log_info "Teardown cancelled"
    return
  fi
  
  log_info "Tearing down stack..."
  docker-compose -f "$COMPOSE_FILE" down -v --remove-orphans
  log_info "${GREEN}Stack torn down${NC}"
}

# Show logs
show_logs() {
  log_info "Showing logs for environment: $ENVIRONMENT (Press Ctrl+C to exit)"
  validate_env
  docker-compose -f "$COMPOSE_FILE" logs -f --tail=50
}

# Show status
show_status() {
  log_info "Stack status for environment: $ENVIRONMENT"
  validate_env
  docker-compose -f "$COMPOSE_FILE" ps
}

# Health checks
health_check() {
  log_info "Running health checks for environment: $ENVIRONMENT"
  validate_env
  
  echo ""
  echo "Database Health:"
  if docker-compose -f "$COMPOSE_FILE" exec -T db pg_isready -U postgres &>/dev/null; then
    log_info "✓ Database is healthy"
  else
    log_error "✗ Database is not responding"
  fi
  
  echo ""
  echo "Backend Health:"
  if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
    log_info "✓ Backend is healthy"
  else
    log_warn "⚠ Backend health check failed"
  fi
  
  echo ""
  echo "Frontend Health:"
  if curl -sf http://localhost:5173 >/dev/null 2>&1; then
    log_info "✓ Frontend is healthy"
  else
    log_warn "⚠ Frontend health check failed"
  fi
  
  echo ""
  echo "Tegola Health:"
  if curl -sf http://localhost:8081/capabilities >/dev/null 2>&1; then
    log_info "✓ Tegola is healthy"
  else
    log_warn "⚠ Tegola health check failed"
  fi
  
  echo ""
}

# Initialize stack
init_stack() {
  log_info "Initializing stack for environment: $ENVIRONMENT"
  validate_env
  
  # Start services first
  log_info "Starting services..."
  docker-compose -f "$COMPOSE_FILE" up -d
  
  sleep 5
  
  # Wait for database
  log_info "Waiting for database..."
  max_attempts=30
  attempt=0
  while [ $attempt -lt $max_attempts ]; do
    if docker-compose -f "$COMPOSE_FILE" exec -T db pg_isready -U postgres &>/dev/null; then
      break
    fi
    attempt=$((attempt + 1))
    sleep 2
  done
  
  # Initialize PostGIS
  log_info "Initializing PostGIS..."
  docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d realestate -c "CREATE EXTENSION IF NOT EXISTS postgis;" || true
  
  # Run migrations
  log_info "Running migrations..."
  docker-compose -f "$COMPOSE_FILE" exec -T backend bash -c "npx prisma migrate deploy --schema=./db/schema.prisma" || true
  
  # Generate Prisma client
  log_info "Generating Prisma client..."
  docker-compose -f "$COMPOSE_FILE" exec -T backend bash -c "npx prisma generate" || true
  
  # Seed database
  if [ "$ENVIRONMENT" = "dev" ] || [ "$ENVIRONMENT" = "test" ]; then
    log_info "Seeding database..."
    docker-compose -f "$COMPOSE_FILE" exec -T backend bash -c "SEED_TEST_DATA=true npm run seed --workspace=db" || true
  fi
  
  log_info "${GREEN}Stack initialization complete!${NC}"
  health_check
}

# Open shell
open_shell() {
  log_info "Opening shell in database container..."
  validate_env
  docker-compose -f "$COMPOSE_FILE" exec db bash
}

# Connect to PostgreSQL
psql_connect() {
  log_info "Connecting to PostgreSQL..."
  validate_env
  docker-compose -f "$COMPOSE_FILE" exec db psql -U postgres -d realestate
}

# Show help
show_help() {
  cat << EOF
${BLUE}Stack Orchestration Script${NC}

Usage: ./stack.sh <command> [environment]

${BLUE}Commands:${NC}
  start      - Start all services
  stop       - Stop all services gracefully
  restart    - Restart all services
  down       - Tear down stack (data loss!)
  logs       - Show live logs
  status     - Show service status
  init       - Initialize stack (migrations, seeds, PostGIS)
  health     - Run health checks
  shell      - Open shell in database
  psql       - Connect to PostgreSQL
  help       - Show this message

${BLUE}Environments:${NC}
  dev        - Development (default)
  test       - Testing
  prod       - Production

${BLUE}Examples:${NC}
  ./stack.sh start dev       # Start dev stack
  ./stack.sh init test       # Initialize test stack
  ./stack.sh logs            # Show dev logs
  ./stack.sh health prod     # Check prod health
  ./stack.sh down dev        # Tear down dev stack

${BLUE}Service URLs:${NC}
  Backend:   http://localhost:3000
  Frontend:  http://localhost:5173
  Tegola:    http://localhost:8081
  Database:  localhost:5432

EOF
}

# Main execution
case "$COMMAND" in
  start)
    start_services
    ;;
  stop)
    stop_services
    ;;
  restart)
    restart_services
    ;;
  down)
    teardown_stack
    ;;
  logs)
    show_logs
    ;;
  status)
    show_status
    ;;
  init)
    init_stack
    ;;
  health)
    health_check
    ;;
  shell)
    open_shell
    ;;
  psql)
    psql_connect
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    log_error "Unknown command: $COMMAND"
    echo ""
    show_help
    exit 1
    ;;
esac
