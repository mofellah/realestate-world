# PostgreSQL 18 with PostGIS Extension
# Production-ready database container

FROM postgres:18-bookworm

# Install PostGIS extension and dependencies
RUN apt-get update && apt-get install -y \
    postgis \
    postgresql-18-postgis-3 \
    && rm -rf /var/lib/apt/lists/*

# Copy initialization script for PostGIS
COPY ops/docker/init-postgis.sh /docker-entrypoint-initdb.d/

# Make script executable
RUN chmod +x /docker-entrypoint-initdb.d/init-postgis.sh

# Expose PostgreSQL port
EXPOSE 5432

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD pg_isready -U postgres || exit 1

# Note: Volume mount configured in docker-compose.yml
# PostgreSQL 18+ uses /var/lib/postgresql (not /var/lib/postgresql/data)
