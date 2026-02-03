/**
 * Import OSM Amenities to Application Database
 * Reads amenities from realestate_osm and imports to realestate
 */

import { PrismaClient, AmenityType } from "@prisma/client";
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

// Map OSM amenity types to our AmenityType enum (singular forms)
const amenityTypeMap: Record<string, AmenityType> = {
  school: "school",
  kindergarten: "school",
  university: "school",
  college: "school",
  hospital: "hospital",
  clinic: "hospital",
  doctors: "hospital",
  pharmacy: "pharmacy",
  restaurant: "restaurant",
  cafe: "cafe",
  fast_food: "restaurant",
  bar: "cafe",
  pub: "cafe",
  supermarket: "supermarket",
  marketplace: "shopping",
  mall: "shopping",
  bus_station: "public_transport",
  subway_entrance: "public_transport",
  train_station: "public_transport",
  tram_stop: "public_transport",
  park: "park",
  playground: "park",
  sports_centre: "gym",
  gym: "gym",
  swimming_pool: "gym",
  library: "library",
  police: "police",
  fire_station: "fire_station",
  bank: "bank",
  atm: "bank",
  fuel: "gas_station",
};

async function importOSMAmenities() {
  console.log("🏫 Importing OSM amenities to application database...\n");

  try {
    await osmDb.connect();
    console.log("✓ Connected to OSM database\n");

    // Get Brussels boundary to limit imports
    const brusselsBbox = await osmDb.query(`
      SELECT 
        ST_XMin(way) as min_lon,
        ST_XMax(way) as max_lon,
        ST_YMin(way) as min_lat,
        ST_YMax(way) as max_lat
      FROM osm__polygon
      WHERE boundary = 'administrative'
        AND admin_level = '4'
        AND name ILIKE '%brussels%'
      LIMIT 1;
    `);

    if (brusselsBbox.rows.length === 0) {
      throw new Error("Brussels boundary not found in OSM data");
    }

    const bbox = brusselsBbox.rows[0];
    console.log(
      `Brussels bounding box: ${bbox.min_lat},${bbox.min_lon} to ${bbox.max_lat},${bbox.max_lon}\n`,
    );

    // Import points (schools, hospitals, pharmacies, restaurants, etc.)
    console.log("📍 Importing point amenities...");
    const pointQuery = `
      SELECT 
        osm_id,
        name,
        tags->'amenity' as amenity,
        ST_X(way) as lon,
        ST_Y(way) as lat,
        ST_AsBinary(way) as geometry_wkb
      FROM osm__point
      WHERE tags ? 'amenity'
        AND name IS NOT NULL
        AND ST_Within(way, ST_MakeEnvelope(
          ${bbox.min_lon}, ${bbox.min_lat},
          ${bbox.max_lon}, ${bbox.max_lat},
          4326
        ))
      LIMIT 500;
    `;

    const pointsResult = await osmDb.query(pointQuery);
    console.log(`Found ${pointsResult.rows.length} point amenities\n`);

    let imported = 0;
    for (const row of pointsResult.rows) {
      const amenityType = amenityTypeMap[row.amenity];
      if (!amenityType) continue;

      try {
        // Create geo_object
        const geoObject = await prisma.geoObject.create({
          data: {
            type: "point",
            geoJson: {
              type: "Point",
              coordinates: [parseFloat(row.lon), parseFloat(row.lat)],
            },
            metadata: {
              osm_id: row.osm_id,
              osm_type: row.amenity,
            },
          },
        });

        // Create amenity
        await prisma.amenity.create({
          data: {
            type: amenityType,
            name: row.name,
            geoObjectId: geoObject.id,
            country_code: "BE",
            metadata: {
              osm_id: row.osm_id,
              osm_amenity: row.amenity,
              source: "OpenStreetMap",
            },
          },
        });

        imported++;
        if (imported % 50 === 0) {
          console.log(`  Imported ${imported} amenities...`);
        }
      } catch (error: any) {
        // Skip duplicates or errors
        if (!error.message?.includes("Unique constraint")) {
          console.error(`  Error importing ${row.name}:`, error.message);
        }
      }
    }

    // Import polygons (parks, hospitals, schools)
    console.log("\n🏞️  Importing polygon amenities (parks, large facilities)...");
    const polygonQuery = `
      SELECT 
        osm_id,
        name,
        tags->'amenity' as amenity,
        tags->'leisure' as leisure,
        ST_AsText(ST_Centroid(way)) as centroid,
        ST_AsBinary(way) as geometry_wkb,
        ST_Area(way::geography) / 10000 as area_hectares
      FROM osm__polygon
      WHERE (tags ? 'amenity' OR tags->'leisure' IN ('park', 'playground', 'sports_centre'))
        AND name IS NOT NULL
        AND ST_Within(ST_Centroid(way), ST_MakeEnvelope(
          ${bbox.min_lon}, ${bbox.min_lat},
          ${bbox.max_lon}, ${bbox.max_lat},
          4326
        ))
      LIMIT 200;
    `;

    const polygonsResult = await osmDb.query(polygonQuery);
    console.log(`Found ${polygonsResult.rows.length} polygon amenities\n`);

    for (const row of polygonsResult.rows) {
      const osmType = row.amenity || row.leisure;
      const amenityType = amenityTypeMap[osmType];
      if (!amenityType) continue;

      try {
        const centroidMatch = row.centroid.match(/POINT\(([\d.]+) ([\d.]+)\)/);
        if (!centroidMatch) continue;

        const lon = parseFloat(centroidMatch[1]);
        const lat = parseFloat(centroidMatch[2]);

        // Create geo_object
        const geoObject = await prisma.geoObject.create({
          data: {
            type: "polygon",
            geoJson: {
              type: "Point", // Use centroid as point for simplicity
              coordinates: [lon, lat],
            },
            metadata: {
              osm_id: row.osm_id,
              osm_type: osmType,
              area_hectares: parseFloat(row.area_hectares),
            },
          },
        });

        // Create amenity
        await prisma.amenity.create({
          data: {
            type: amenityType,
            name: row.name,
            geoObjectId: geoObject.id,
            country_code: "BE",
            metadata: {
              osm_id: row.osm_id,
              osm_amenity: osmType,
              area_hectares: parseFloat(row.area_hectares),
              source: "OpenStreetMap",
            },
          },
        });

        imported++;
        if (imported % 50 === 0) {
          console.log(`  Imported ${imported} amenities...`);
        }
      } catch (error: any) {
        if (!error.message?.includes("Unique constraint")) {
          console.error(`  Error importing ${row.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Imported ${imported} amenities successfully!`);

    // Show summary
    const summary = await prisma.amenity.groupBy({
      by: ["type"],
      _count: true,
    });

    console.log("\n📊 Amenities by type:");
    summary.forEach(({ type, _count }) => {
      console.log(`  ${type}: ${_count}`);
    });
  } catch (error) {
    console.error("❌ Error importing OSM amenities:", error);
    throw error;
  } finally {
    await osmDb.end();
    await prisma.$disconnect();
  }
}

importOSMAmenities().catch((error) => {
  console.error(error);
  process.exit(1);
});
