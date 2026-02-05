-- Enable PostGIS extension for geographic data types
-- Required for geography, geometry types and spatial functions

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify extensions are enabled
SELECT extname, extversion FROM pg_extension WHERE extname IN ('postgis', 'postgis_topology');
