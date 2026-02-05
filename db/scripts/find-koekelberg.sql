SELECT p.id, p.title, a.city, a."streetName", a."streetNumber",
       ST_AsText(ST_GeomFromGeoJSON(g."geoJson"::text)) as coordinates
FROM properties p 
JOIN addresses a ON p."addressId" = a.id 
JOIN geo_objects g ON a."geoObjectId" = g.id 
WHERE LOWER(a."streetName") LIKE '%delcoigne%' 
   OR LOWER(a.city) LIKE '%koekelberg%';
