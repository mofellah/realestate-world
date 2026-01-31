#!/bin/bash
#
# Comprehensive stack verification and diagnostic script for Real Estate World platform
# Usage: ./verify-stack.sh [dev|test|prod] [--verbose]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Parse arguments
ENVIRONMENT="${1:-dev}"
VERBOSE="${2:-}"

if [[ "$VERBOSE" != "--verbose" && "$VERBOSE" != "-v" ]]; then
    VERBOSE=false
else
    VERBOSE=true
fi

# Validation
if [[ ! "$ENVIRONMENT" =~ ^(dev|test|prod)$ ]]; then
    echo -e "${RED}✗ Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: $0 [dev|test|prod] [--verbose]"
    exit 1
fi

COMPOSE_FILE="ops/compose/docker-compose.$ENVIRONMENT.yml"
if [[ ! -f "$COMPOSE_FILE" ]]; then
    echo -e "${RED}✗ Compose file not found: $COMPOSE_FILE${NC}"
    exit 1
fi

# Output functions
write_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

write_error() {
    echo -e "${RED}✗ $1${NC}"
}

write_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

write_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

write_header() {
    echo -e "${MAGENTA}\n========== $1 ==========${NC}"
}

# Initialize tracking
FAILURES=()
WARNINGS=()

# ============================================================================
# 1. Docker & Compose Setup
# ============================================================================
write_header "1. Docker & Docker Compose Setup"

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    write_success "Docker installed: $DOCKER_VERSION"
else
    write_error "Docker not found. Please install Docker."
    FAILURES+=("Docker not installed")
fi

if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    write_success "Docker Compose installed: $COMPOSE_VERSION"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    write_success "Docker Compose available (via 'docker compose')"
else
    write_error "Docker Compose not found"
    FAILURES+=("Docker Compose not installed")
fi

# ============================================================================
# 2. Services Status
# ============================================================================
write_header "2. Service Status"

SERVICES=("db" "backend" "frontend" "tegola")
RUNNING_COUNT=0
STOPPED_COUNT=0

for service in "${SERVICES[@]}"; do
    if docker-compose -f "$COMPOSE_FILE" ps "$service" 2>&1 | grep -q "running\|Up"; then
        write_success "$service is running"
        ((RUNNING_COUNT++))
    elif docker-compose -f "$COMPOSE_FILE" ps "$service" 2>&1 | grep -q "exited\|Exited"; then
        write_error "$service is stopped"
        ((STOPPED_COUNT++))
        FAILURES+=("$service not running")
    else
        write_warning "$service status unknown"
        WARNINGS+=("$service status unclear")
    fi
done

write_info "Running: $RUNNING_COUNT | Stopped: $STOPPED_COUNT"

# ============================================================================
# 3. Database Connectivity
# ============================================================================
write_header "3. Database Connectivity"

if docker-compose -f "$COMPOSE_FILE" exec -T db pg_isready -U postgres &> /dev/null; then
    write_success "Database is accepting connections"
else
    write_error "Database connection failed"
    FAILURES+=("Database not responding")
fi

# Check if database exists
if docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -lqt 2>&1 | grep -q realestate; then
    write_success "Database 'realestate' exists"
else
    write_warning "Database 'realestate' not found"
    WARNINGS+=("Database may not be initialized")
fi

# Check PostGIS extension
if docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d realestate -c "SELECT PostGIS_Version();" 2>&1 | grep -q "PostGIS"; then
    write_success "PostGIS extension is active"
else
    write_warning "PostGIS extension not found or not active"
    WARNINGS+=("PostGIS extension may need initialization")
fi

# ============================================================================
# 4. Backend API Health
# ============================================================================
write_header "4. Backend API Health"

if command -v curl &> /dev/null; then
    if curl -s -f http://localhost:3000/health &> /dev/null; then
        write_success "Backend is responding to requests"
        if [[ "$VERBOSE" == "true" ]]; then
            write_info "Health response:"
            curl -s http://localhost:3000/health | jq . 2>/dev/null || echo "  (response not JSON)"
        fi
    else
        write_error "Backend health check failed"
        FAILURES+=("Backend API not responding")
    fi
else
    write_warning "curl not found, skipping backend health check"
fi

# ============================================================================
# 5. Frontend Server
# ============================================================================
write_header "5. Frontend Server"

if [[ "$ENVIRONMENT" == "prod" ]]; then
    FRONTEND_PORT=80
else
    FRONTEND_PORT=5173
fi

if command -v curl &> /dev/null; then
    if curl -s -f http://localhost:$FRONTEND_PORT &> /dev/null; then
        write_success "Frontend is serving on port $FRONTEND_PORT"
    else
        write_error "Frontend not responding on port $FRONTEND_PORT"
        FAILURES+=("Frontend not accessible")
    fi
else
    write_warning "curl not found, skipping frontend check"
fi

# ============================================================================
# 6. Tegola Vector Tile Server
# ============================================================================
write_header "6. Tegola Vector Tile Server"

if command -v curl &> /dev/null; then
    if TEGOLA_RESPONSE=$(curl -s http://localhost:8081/capabilities 2>/dev/null); then
        write_success "Tegola is running and responding"
        if command -v jq &> /dev/null; then
            LAYER_COUNT=$(echo "$TEGOLA_RESPONSE" | jq '.layers | length' 2>/dev/null || echo "0")
            if [[ "$LAYER_COUNT" -gt 0 ]]; then
                write_success "Tegola has $LAYER_COUNT layers configured"
            fi
        fi
    else
        write_error "Tegola not responding"
        FAILURES+=("Tegola not accessible")
    fi
else
    write_warning "curl not found, skipping Tegola check"
fi

# ============================================================================
# 7. Database Tables & Data
# ============================================================================
write_header "7. Database Tables & Data"

if docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d realestate -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';" &> /dev/null; then
    TABLE_COUNT=$(docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d realestate -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';" 2>&1 | xargs)
    write_success "Found $TABLE_COUNT tables"
    
    if [[ "$VERBOSE" == "true" ]]; then
        TABLES=$(docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d realestate -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;" 2>&1)
        write_info "Tables:"
        echo "$TABLES" | grep -v '^$' | sed 's/^/  /'
    fi
    
    # Check record counts
    PROPERTY_COUNT=$(docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d realestate -t -c "SELECT COUNT(*) FROM properties;" 2>&1 | xargs)
    write_info "Properties: $PROPERTY_COUNT"
    
    ADDRESS_COUNT=$(docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d realestate -t -c "SELECT COUNT(*) FROM addresses;" 2>&1 | xargs)
    write_info "Addresses: $ADDRESS_COUNT"
    
    GEO_OBJECT_COUNT=$(docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d realestate -t -c "SELECT COUNT(*) FROM geo_objects;" 2>&1 | xargs)
    write_info "Geo Objects: $GEO_OBJECT_COUNT"
    
    GEO_WITH_COORDS=$(docker-compose -f "$COMPOSE_FILE" exec -T db psql -U postgres -d realestate -t -c "SELECT COUNT(*) FROM geo_objects WHERE latitude IS NOT NULL AND longitude IS NOT NULL;" 2>&1 | xargs)
    write_info "Geo Objects with coordinates: $GEO_WITH_COORDS"
else
    write_warning "Could not query database tables"
fi

# ============================================================================
# 8. Network & DNS
# ============================================================================
write_header "8. Network & DNS"

if docker-compose -f "$COMPOSE_FILE" exec -T backend ping -c 1 db &> /dev/null; then
    write_success "Backend can resolve 'db' hostname"
else
    write_warning "DNS resolution check inconclusive"
fi

# ============================================================================
# 9. Volume Status
# ============================================================================
write_header "9. Docker Volumes"

VOLUME_COUNT=$(docker volume ls --filter "name=realestate" -q 2>/dev/null | wc -l)
if [[ $VOLUME_COUNT -gt 0 ]]; then
    write_success "Found $VOLUME_COUNT realestate volume(s)"
    if [[ "$VERBOSE" == "true" ]]; then
        write_info "Volumes:"
        docker volume ls --filter "name=realestate" -q | sed 's/^/  /'
    fi
else
    write_warning "No realestate volumes found"
fi

# ============================================================================
# 10. Container Logs (Sample)
# ============================================================================
if [[ "$VERBOSE" == "true" ]]; then
    write_header "10. Recent Container Logs (Last 10 lines)"
    
    for service in "${SERVICES[@]}"; do
        write_info "\n--- $service logs ---"
        docker-compose -f "$COMPOSE_FILE" logs --tail=10 "$service" 2>&1 | tail -10 || write_warning "Could not retrieve logs for $service"
    done
fi

# ============================================================================
# Summary & Recommendations
# ============================================================================
write_header "Verification Summary"

if [[ ${#FAILURES[@]} -eq 0 && ${#WARNINGS[@]} -eq 0 ]]; then
    write_success "✓ All checks passed! Platform is healthy."
    exit 0
elif [[ ${#FAILURES[@]} -eq 0 ]]; then
    write_warning "Warnings detected, but no critical failures."
    write_warning "Warnings:"
    for warning in "${WARNINGS[@]}"; do
        write_warning "  - $warning"
    done
    exit 0
else
    write_error "Critical failures detected!"
    write_error "Failures:"
    for failure in "${FAILURES[@]}"; do
        write_error "  - $failure"
    done
    
    write_warning "\nRecommendations:"
    
    if printf '%s\n' "${FAILURES[@]}" | grep -q "Docker"; then
        write_info "  1. Install Docker from https://docker.com"
    fi
    
    if printf '%s\n' "${FAILURES[@]}" | grep -q "not running"; then
        write_info "  2. Start services: ./stack.sh start $ENVIRONMENT"
    fi
    
    if printf '%s\n' "${FAILURES[@]}" | grep -q "Database"; then
        write_info "  3. Initialize database: ./stack.sh init $ENVIRONMENT"
    fi
    
    if printf '%s\n' "${FAILURES[@]}" | grep -q "API"; then
        write_info "  4. Check backend logs: ./stack.sh logs backend"
    fi
    
    exit 1
fi
