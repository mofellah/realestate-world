/**
 * Import OSM Boundaries to Application Database
 * Reads administrative boundaries from realestate_osm and imports to realestate
 */

import { PrismaClient } from "@prisma/client";
import { Client } from "pg";

const prisma = new PrismaClient();

// OSM database connection
const osmDb = new Client({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: "realestate_osm",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

async function importOSMBoundaries() {
  console.log("📍 Importing OSM boundaries to application database...\n");

  try {
    await osmDb.connect();
    console.log("✓ Connected to OSM database\n");

    // Get boundary types
    const regionType = await prisma.boundaryType.findFirst({
      where: { code: "region", countryCode: "BE" },
    });
    const municipalityType = await prisma.boundaryType.findFirst({
      where: { code: "municipality", countryCode: "BE" },
    });

    if (!regionType || !municipalityType) {
      throw new Error("Boundary types not found. Run boundary-types seed first.");
    }

    // Import Brussels region (admin_level = 4)
    console.log("🇧🇪 Importing Brussels region...");
    const brusselsQuery = `
      SELECT 
        osm_id,
        name,
        tags->'name:en' as name_en,
        tags->'name:fr' as name_fr,
        tags->'name:nl' as name_nl,
        admin_level,
        tags->'population' as population,
        ST_AsBinary(way) as geometry_wkb,
        ST_AsText(ST_Centroid(way)) as centroid,
        ST_XMin(way) as min_lon,
        ST_XMax(way) as max_lon,
        ST_YMin(way) as min_lat,
        ST_YMax(way) as max_lat,
        ST_Area(way::geography) / 1000000 as area_sqkm
      FROM osm__polygon
      WHERE boundary = 'administrative'
        AND admin_level = '4'
        AND name ILIKE '%bruxelles%'
      LIMIT 1;
    `;

    const brusselsResult = await osmDb.query(brusselsQuery);

    if (brusselsResult.rows.length > 0) {
      const row = brusselsResult.rows[0];
      const alternateNames = [row.name_en, row.name_fr, row.name_nl].filter(Boolean);

      await prisma.boundary.upsert({
        where: {
          nameSlug_boundaryTypeId_country_code: {
            nameSlug: "brussels",
            boundaryTypeId: regionType.id,
            country_code: "BE",
          },
        },
        create: {
          name: row.name || "Brussels",
          nameSlug: "brussels",
          alternateNames: alternateNames,
          boundaryTypeId: regionType.id,
          country_code: "BE",
          geometry: row.geometry_wkb,
          minLat: parseFloat(row.min_lat),
          maxLat: parseFloat(row.max_lat),
          minLon: parseFloat(row.min_lon),
          maxLon: parseFloat(row.max_lon),
          centroidLat: parseFloat(
            row.centroid.match(/POINT\(([\d.]+) ([\d.]+)\)/)?.[2] || "50.8503",
          ),
          centroidLon: parseFloat(
            row.centroid.match(/POINT\(([\d.]+) ([\d.]+)\)/)?.[1] || "4.3517",
          ),
          population: parseInt(row.population) || 1218255,
          area_sqkm: parseFloat(row.area_sqkm) || 161.38,
          isPopular: true,
          searchRank: 100,
        },
        update: {
          geometry: row.geometry_wkb,
          minLat: parseFloat(row.min_lat),
          maxLat: parseFloat(row.max_lat),
          minLon: parseFloat(row.min_lon),
          maxLon: parseFloat(row.max_lon),
          centroidLat: parseFloat(
            row.centroid.match(/POINT\(([\d.]+) ([\d.]+)\)/)?.[2] || "50.8503",
          ),
          centroidLon: parseFloat(
            row.centroid.match(/POINT\(([\d.]+) ([\d.]+)\)/)?.[1] || "4.3517",
          ),
          population: parseInt(row.population) || 1218255,
          area_sqkm: parseFloat(row.area_sqkm) || 161.38,
        },
      });

      console.log(`  ✓ Brussels (Region) - ${row.area_sqkm?.toFixed(2)} km²`);
    }

    // Import Brussels municipalities (admin_level = 8)
    console.log("\n🏘️ Importing Brussels municipalities...");
    const municipalitiesQuery = `
      SELECT 
        osm_id,
        name,
        tags->'name:en' as name_en,
        tags->'name:fr' as name_fr,
        tags->'name:nl' as name_nl,
        admin_level,
        tags->'population' as population,
        tags->'postal_code' as postal_code,
        ST_AsBinary(way) as geometry_wkb,
        ST_AsText(ST_Centroid(way)) as centroid,
        ST_XMin(way) as min_lon,
        ST_XMax(way) as max_lon,
        ST_YMin(way) as min_lat,
        ST_YMax(way) as max_lat,
        ST_Area(way::geography) / 1000000 as area_sqkm
      FROM osm__polygon
      WHERE boundary = 'administrative'
        AND admin_level = '8'
        AND ST_Within(ST_Centroid(way), (
          SELECT way FROM osm__polygon 
          WHERE boundary = 'administrative' 
            AND admin_level = '4' 
            AND name ILIKE '%bruxelles%' 
          LIMIT 1
        ))
      ORDER BY name
      LIMIT 50;
    `;

    const municipalitiesResult = await osmDb.query(municipalitiesQuery);
    console.log(`Found ${municipalitiesResult.rows.length} municipalities\n`);

    const brusselsBoundary = await prisma.boundary.findFirst({
      where: { nameSlug: "brussels", boundaryTypeId: regionType.id },
    });

    for (const row of municipalitiesResult.rows) {
      if (!row.name) continue;

      const nameSlug = row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const alternateNames = [row.name_en, row.name_fr, row.name_nl].filter(Boolean);
      const centroidMatch = row.centroid.match(/POINT\(([\d.]+) ([\d.]+)\)/);

      await prisma.boundary.upsert({
        where: {
          nameSlug_boundaryTypeId_country_code: {
            nameSlug: nameSlug,
            boundaryTypeId: municipalityType.id,
            country_code: "BE",
          },
        },
        create: {
          name: row.name,
          nameSlug: nameSlug,
          alternateNames: alternateNames,
          boundaryTypeId: municipalityType.id,
          country_code: "BE",
          parentId: brusselsBoundary?.id,
          regionName: "Brussels",
          geometry: row.geometry_wkb,
          minLat: parseFloat(row.min_lat),
          maxLat: parseFloat(row.max_lat),
          minLon: parseFloat(row.min_lon),
          maxLon: parseFloat(row.max_lon),
          centroidLat: centroidMatch ? parseFloat(centroidMatch[2]) : null,
          centroidLon: centroidMatch ? parseFloat(centroidMatch[1]) : null,
          population: row.population ? parseInt(row.population) : null,
          area_sqkm: row.area_sqkm ? parseFloat(row.area_sqkm) : null,
          isPopular: false,
          searchRank: 50,
        },
        update: {
          geometry: row.geometry_wkb,
          minLat: parseFloat(row.min_lat),
          maxLat: parseFloat(row.max_lat),
          minLon: parseFloat(row.min_lon),
          maxLon: parseFloat(row.max_lon),
          centroidLat: centroidMatch ? parseFloat(centroidMatch[2]) : null,
          centroidLon: centroidMatch ? parseFloat(centroidMatch[1]) : null,
          population: row.population ? parseInt(row.population) : null,
          area_sqkm: row.area_sqkm ? parseFloat(row.area_sqkm) : null,
        },
      });

      console.log(`  ✓ ${row.name} - ${row.area_sqkm?.toFixed(2) || "?"} km²`);
    }

    console.log("\n✅ OSM boundaries imported successfully!");
  } catch (error) {
    console.error("❌ Error importing OSM boundaries:", error);
    throw error;
  } finally {
    await osmDb.end();
    await prisma.$disconnect();
  }
}

importOSMBoundaries().catch((error) => {
  console.error(error);
  process.exit(1);
});
