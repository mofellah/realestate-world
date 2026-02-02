#!/bin/bash
set -e

# Exit if the script is run as root
if [ "$1" = 'postgres' ]; then
  shift
fi

# This script runs as the postgres user via PGUSER env variable set by docker-entrypoint.sh
# It initializes the database with PostGIS extension and creates application database/user

# Connect to the application database and create PostGIS extension
psql -v ON_ERROR_STOP=1 -d "${POSTGRES_DB}" <<-EOSQL
  -- Create PostGIS extension if not exists
  CREATE EXTENSION IF NOT EXISTS postgis;
  
  -- Verify PostGIS installation
  SELECT postgis_version();
EOSQL

echo "PostGIS initialized for database: ${POSTGRES_DB}"
