SELECT name, "centroidLat", "centroidLon", 
       ST_AsText(ST_Centroid(geometry)) as geom_centroid
FROM boundaries 
WHERE name = 'Koekelberg';
