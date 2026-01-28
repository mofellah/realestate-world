# PostgreSQL 18 with PostGIS Extension
# Production-ready database container

FROM postgres:18-alpine

# Install PostGIS extension and dependencies
RUN apk add --no-cache \
    postgis \
    && rm -rf /var/cache/apk/*

# Copy initialization script for PostGIS
COPY ops/docker/init-postgis.sh /docker-entrypoint-initdb.d/

# Make script executable
RUN chmod +x /docker-entrypoint-initdb.d/init-postgis.sh

# Expose PostgreSQL port
EXPOSE 5432

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD pg_isready -U postgres || exit 1

# Data persistence volume
VOLUME ["/var/lib/postgresql/data"]
