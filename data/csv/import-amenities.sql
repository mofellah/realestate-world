BEGIN;

-- Create temp table and load CSV
CREATE TABLE amenities_temp (
    id TEXT, name TEXT, category TEXT, amenity_type TEXT, 
    house_number TEXT, street TEXT, postal_code TEXT, city TEXT, 
    phone TEXT, website TEXT, email TEXT, opening_hours TEXT, 
    latitude DOUBLE PRECISION, longitude DOUBLE PRECISION, 
    country_code TEXT, metadata TEXT
);

COPY amenities_temp FROM '/tmp/amenities_BE.csv' WITH (FORMAT CSV, HEADER true, ENCODING 'UTF8');

-- Step 1: Insert GeoObjects for amenities (Point geometries)
INSERT INTO geo_objects (
    id, type, latitude, longitude, metadata, "createdAt", "updatedAt"
)
SELECT 
    'geo_' || id,
    'point'::"GeoObjectType",
    latitude,
    longitude,
    jsonb_build_object(
        'source', 'osm',
        'amenity_id', id,
        'postal_code', postal_code
    ),
    NOW(),
    NOW()
FROM amenities_temp
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Step 2: Insert amenities with geoObjectId references
INSERT INTO amenities (
    id, name, type, "geoObjectId", address, city, country_code, 
    phone, website, "openingHours", 
    metadata, "createdAt", "updatedAt"
)
SELECT 
    t.id, 
    t.name, 
    CASE
        WHEN t.amenity_type = 'hospital' THEN 'hospital'
        WHEN t.amenity_type = 'clinic' THEN 'hospital'
        WHEN t.amenity_type = 'school' THEN 'school'
        WHEN t.amenity_type = 'university' THEN 'school'
        WHEN t.amenity_type = 'college' THEN 'school'
        WHEN t.amenity_type = 'kindergarten' THEN 'school'
        WHEN t.amenity_type = 'library' THEN 'library'
        WHEN t.amenity_type = 'park' THEN 'park'
        WHEN t.amenity_type = 'playground' THEN 'park'
        WHEN t.amenity_type LIKE '%shop%' OR t.amenity_type = 'marketplace' THEN 'shopping'
        WHEN t.amenity_type = 'supermarket' THEN 'supermarket'
        WHEN t.amenity_type = 'restaurant' THEN 'restaurant'
        WHEN t.amenity_type = 'cafe' THEN 'cafe'
        WHEN t.amenity_type = 'fast_food' THEN 'restaurant'
        WHEN t.amenity_type = 'bank' THEN 'bank'
        WHEN t.amenity_type = 'atm' THEN 'bank'
        WHEN t.amenity_type = 'pharmacy' THEN 'pharmacy'
        WHEN t.amenity_type = 'fitness_centre' THEN 'gym'
        WHEN t.amenity_type = 'sports_centre' THEN 'gym'
        WHEN t.amenity_type = 'swimming_pool' THEN 'gym'
        WHEN t.amenity_type = 'police' THEN 'police'
        WHEN t.amenity_type = 'fire_station' THEN 'fire_station'
        WHEN t.amenity_type = 'fuel' THEN 'gas_station'
        WHEN t.amenity_type = 'charging_station' THEN 'gas_station'
        WHEN t.amenity_type LIKE '%transit%' OR t.amenity_type LIKE '%bus%' OR t.amenity_type LIKE '%train%' THEN 'public_transport'
        ELSE 'other'
    END::"AmenityTypeEnum",
    'geo_' || t.id,
    CONCAT_WS(', ', t.house_number, t.street),
    t.city,
    t.country_code,
    t.phone,
    t.website,
    t.opening_hours,
    jsonb_build_object(
        'category', t.category,
        'amenity_type', t.amenity_type,
        'postal_code', t.postal_code,
        'original_metadata', t.metadata::jsonb
    ),
    NOW(),
    NOW()
FROM amenities_temp t
WHERE t.latitude IS NOT NULL AND t.longitude IS NOT NULL;

-- Drop temp table
DROP TABLE amenities_temp;

COMMIT;

-- Statistics
SELECT 
    type,
    COUNT(*) as count,
    COUNT(phone) as with_phone,
    COUNT(website) as with_website,
    COUNT("openingHours") as with_hours
FROM amenities
WHERE country_code = 'BE'
GROUP BY type
ORDER BY COUNT(*) DESC;
