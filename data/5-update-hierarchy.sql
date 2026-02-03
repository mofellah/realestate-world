-- ============================================================================
-- Boundary Hierarchy Setup Script
-- ============================================================================
-- 
-- Purpose: Establish parent-child relationships between boundaries
--          using spatial containment (ST_Contains)
--
-- Hierarchy (top to bottom):
--   country → state → district → municipality → city_district → postal_code
--
-- Approach: For each boundary type, find parent using ST_Contains
--           Prefer smallest containing parent (ORDER BY area_sqkm ASC)
--
-- Usage: psql -h localhost -U postgres -d realestate -f 5-update-hierarchy.sql
--
-- ============================================================================

\timing on

-- ============================================================================
-- Step 1: Link states to countries
-- ============================================================================

\echo ''
\echo '=== Step 1/6: Linking states to countries ==='
\echo ''

UPDATE boundaries child
SET "parentId" = (
    SELECT parent.id
    FROM boundaries parent
    WHERE parent."boundaryType" = 'country'
    AND child."boundaryType" = 'state'
    AND parent.country_code = child.country_code
    AND ST_Contains(
        ST_GeomFromWKB(parent.geometry)::geometry,
        ST_GeomFromWKB(child.geometry)::geometry
    )
    ORDER BY parent.area_sqkm ASC  -- Prefer smallest containing parent
    LIMIT 1
)
WHERE child."boundaryType" = 'state'
AND child."parentId" IS NULL;

SELECT 
    COUNT(*) as states_linked,
    COUNT(CASE WHEN "parentId" IS NOT NULL THEN 1 END) as with_parent
FROM boundaries
WHERE "boundaryType" = 'state';

-- ============================================================================
-- Step 2: Link districts to states
-- ============================================================================

\echo ''
\echo '=== Step 2/6: Linking districts to states ==='
\echo ''

UPDATE boundaries child
SET "parentId" = (
    SELECT parent.id
    FROM boundaries parent
    WHERE parent."boundaryType" = 'state'
    AND child."boundaryType" = 'district'
    AND parent.country_code = child.country_code
    AND ST_Contains(
        ST_GeomFromWKB(parent.geometry)::geometry,
        ST_GeomFromWKB(child.geometry)::geometry
    )
    ORDER BY parent.area_sqkm ASC
    LIMIT 1
)
WHERE child."boundaryType" = 'district'
AND child."parentId" IS NULL;

SELECT 
    COUNT(*) as districts_linked,
    COUNT(CASE WHEN "parentId" IS NOT NULL THEN 1 END) as with_parent
FROM boundaries
WHERE "boundaryType" = 'district';

-- ============================================================================
-- Step 3: Link municipalities to districts (or states if no district)
-- ============================================================================

\echo ''
\echo '=== Step 3/6: Linking municipalities to districts/states ==='
\echo ''

-- First try districts
UPDATE boundaries child
SET "parentId" = (
    SELECT parent.id
    FROM boundaries parent
    WHERE parent."boundaryType" = 'district'
    AND child."boundaryType" = 'municipality'
    AND parent.country_code = child.country_code
    AND ST_Contains(
        ST_GeomFromWKB(parent.geometry)::geometry,
        ST_GeomFromWKB(child.geometry)::geometry
    )
    ORDER BY parent.area_sqkm ASC
    LIMIT 1
)
WHERE child."boundaryType" = 'municipality'
AND child."parentId" IS NULL;

-- Fallback to states if no district found
UPDATE boundaries child
SET "parentId" = (
    SELECT parent.id
    FROM boundaries parent
    WHERE parent."boundaryType" = 'state'
    AND child."boundaryType" = 'municipality'
    AND parent.country_code = child.country_code
    AND ST_Contains(
        ST_GeomFromWKB(parent.geometry)::geometry,
        ST_GeomFromWKB(child.geometry)::geometry
    )
    ORDER BY parent.area_sqkm ASC
    LIMIT 1
)
WHERE child."boundaryType" = 'municipality'
AND child."parentId" IS NULL;

SELECT 
    COUNT(*) as municipalities_linked,
    COUNT(CASE WHEN "parentId" IS NOT NULL THEN 1 END) as with_parent
FROM boundaries
WHERE "boundaryType" = 'municipality';

-- ============================================================================
-- Step 4: Link city districts to municipalities
-- ============================================================================

\echo ''
\echo '=== Step 4/6: Linking city districts to municipalities ==='
\echo ''

UPDATE boundaries child
SET "parentId" = (
    SELECT parent.id
    FROM boundaries parent
    WHERE parent."boundaryType" = 'municipality'
    AND child."boundaryType" = 'city_district'
    AND parent.country_code = child.country_code
    AND ST_Contains(
        ST_GeomFromWKB(parent.geometry)::geometry,
        ST_GeomFromWKB(child.geometry)::geometry
    )
    ORDER BY parent.area_sqkm ASC
    LIMIT 1
)
WHERE child."boundaryType" = 'city_district'
AND child."parentId" IS NULL;

SELECT 
    COUNT(*) as city_districts_linked,
    COUNT(CASE WHEN "parentId" IS NOT NULL THEN 1 END) as with_parent
FROM boundaries
WHERE "boundaryType" = 'city_district';

-- ============================================================================
-- Step 5: Link postal codes to municipalities
-- ============================================================================

\echo ''
\echo '=== Step 5/6: Linking postal codes to municipalities ==='
\echo ''

-- Use centroid for postal codes (better than full geometry)
UPDATE boundaries child
SET "parentId" = (
    SELECT parent.id
    FROM boundaries parent
    WHERE parent."boundaryType" = 'municipality'
    AND child."boundaryType" = 'postal_code'
    AND parent.country_code = child.country_code
    AND ST_Contains(
        ST_GeomFromWKB(parent.geometry)::geometry,
        ST_SetSRID(ST_MakePoint(child."centroidLon", child."centroidLat"), 4326)
    )
    ORDER BY parent.area_sqkm ASC
    LIMIT 1
)
WHERE child."boundaryType" = 'postal_code'
AND child."parentId" IS NULL;

SELECT 
    COUNT(*) as postal_codes_linked,
    COUNT(CASE WHEN "parentId" IS NOT NULL THEN 1 END) as with_parent
FROM boundaries
WHERE "boundaryType" = 'postal_code';

-- ============================================================================
-- Step 6: Denormalize hierarchy fields
-- ============================================================================

\echo ''
\echo '=== Step 6/6: Denormalizing hierarchy fields ==='
\echo ''

-- Update cityName from parent municipality
UPDATE boundaries child
SET "cityName" = parent.name
FROM boundaries parent
WHERE child."parentId" = parent.id
AND parent."boundaryType" IN ('municipality', 'city')
AND child."cityName" IS NULL;

\echo '✓ Updated cityName from parent municipalities'

-- Update regionName from parent state
WITH hierarchy AS (
    SELECT 
        child.id as child_id,
        state.name as state_name
    FROM boundaries child
    LEFT JOIN boundaries municipality ON child."parentId" = municipality.id
    LEFT JOIN boundaries district ON municipality."parentId" = district.id
    LEFT JOIN boundaries state ON COALESCE(district."parentId", municipality."parentId") = state.id
    WHERE state."boundaryType" = 'state'
)
UPDATE boundaries
SET "regionName" = hierarchy.state_name
FROM hierarchy
WHERE boundaries.id = hierarchy.child_id
AND boundaries."regionName" IS NULL;

\echo '✓ Updated regionName from parent states'

-- Update countryName from country code
UPDATE boundaries
SET "countryName" = CASE country_code
    WHEN 'BE' THEN 'Belgium'
    WHEN 'FR' THEN 'France'
    WHEN 'NL' THEN 'Netherlands'
    WHEN 'DE' THEN 'Germany'
    WHEN 'LU' THEN 'Luxembourg'
    ELSE country_code
END
WHERE "countryName" IS NULL;

\echo '✓ Updated countryName from country codes'

-- ============================================================================
-- Step 7: Calculate search rank
-- ============================================================================

\echo ''
\echo '=== Calculating Search Rank ==='
\echo ''

UPDATE boundaries
SET "searchRank" = (
    -- Population component (in thousands)
    COALESCE(population, 0)::float / 1000.0 +
    
    -- Boundary type weight
    CASE "boundaryType"
        WHEN 'country' THEN 10000
        WHEN 'state' THEN 5000
        WHEN 'district' THEN 1000
        WHEN 'municipality' THEN 500
        WHEN 'city_district' THEN 100
        WHEN 'postal_code' THEN 10
        ELSE 1
    END +
    
    -- Official boundary bonus
    CASE WHEN "isOfficial" THEN 100 ELSE 0 END +
    
    -- Area penalty (prefer smaller boundaries for precision)
    CASE 
        WHEN area_sqkm < 1 THEN 50
        WHEN area_sqkm < 10 THEN 20
        WHEN area_sqkm < 100 THEN 10
        ELSE 0
    END
);

\echo '✓ Search rank calculated'

-- ============================================================================
-- Step 8: Mark popular boundaries
-- ============================================================================

\echo ''
\echo '=== Marking Popular Boundaries ==='
\echo ''

-- Mark top 200 by search rank as popular
UPDATE boundaries SET "isPopular" = false;

UPDATE boundaries SET "isPopular" = true
WHERE id IN (
    SELECT id
    FROM boundaries
    WHERE "searchRank" IS NOT NULL
    ORDER BY "searchRank" DESC
    LIMIT 200
);

SELECT 
    "boundaryType",
    COUNT(*) as popular_count
FROM boundaries
WHERE "isPopular" = true
GROUP BY "boundaryType"
ORDER BY popular_count DESC;

-- ============================================================================
-- Step 9: Verification
-- ============================================================================

\echo ''
\echo '=== Hierarchy Verification ==='
\echo ''

-- Show hierarchy statistics
SELECT 
    "boundaryType",
    COUNT(*) as total,
    COUNT("parentId") as with_parent,
    ROUND(100.0 * COUNT("parentId") / COUNT(*), 1) as parent_percentage
FROM boundaries
GROUP BY "boundaryType"
ORDER BY 
    CASE "boundaryType"
        WHEN 'country' THEN 1
        WHEN 'state' THEN 2
        WHEN 'district' THEN 3
        WHEN 'municipality' THEN 4
        WHEN 'city_district' THEN 5
        WHEN 'postal_code' THEN 6
        ELSE 99
    END;

-- Show sample hierarchy chain
\echo ''
\echo 'Sample Hierarchy Chain:'
\echo ''

WITH RECURSIVE hierarchy AS (
    -- Start from a city district
    SELECT 
        id, name, "boundaryType", "parentId", 1 as level
    FROM boundaries
    WHERE "boundaryType" = 'city_district'
    AND name IS NOT NULL
    LIMIT 1
    
    UNION ALL
    
    -- Recursively find parents
    SELECT 
        p.id, p.name, p."boundaryType", p."parentId", h.level + 1
    FROM boundaries p
    JOIN hierarchy h ON p.id = h."parentId"
)
SELECT 
    level,
    "boundaryType",
    name
FROM hierarchy
ORDER BY level;

\echo ''
\echo '=== Hierarchy Setup Complete ==='
\echo ''
\echo 'Denormalized fields updated:'
\echo '  - parentId (spatial containment)'
\echo '  - cityName (from municipality)'
\echo '  - regionName (from state)'
\echo '  - countryName (from country code)'
\echo '  - searchRank (population + type + official)'
\echo '  - isPopular (top 200 by rank)'
\echo ''
\echo 'Next Steps:'
\echo '  1. Test hierarchy queries'
\echo '  2. Update backend services to use searchRank'
\echo '  3. Implement autocomplete with isPopular filter'
\echo ''
