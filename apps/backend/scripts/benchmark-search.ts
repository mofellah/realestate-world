/**
 * Performance Benchmark: Phase 1 vs Phase 2
 *
 * Compares query performance between:
 * - Phase 1: Multi-query with GeoJSON parsing
 * - Phase 2: Single composite query with native geometry
 *
 * Run: npm run benchmark:search
 */

import { PrismaClient } from "@prisma/client";
import { performance } from "perf_hooks";

const prisma = new PrismaClient();

interface BenchmarkResult {
  phase: string;
  testName: string;
  executionTime: number;
  resultCount: number;
  queryCount: number;
  memoryUsed: number;
}

async function benchmark() {
  console.log("🚀 Property Search Benchmark: Phase 1 vs Phase 2\n");
  console.log("=".repeat(80));

  const results: BenchmarkResult[] = [];

  // Test coordinates (Brussels, Belgium)
  const testLat = 50.8503;
  const testLon = 4.3517;
  const testRadius = 5000; // 5km

  // ============================================================================
  // TEST 1: Simple Spatial Search (radius only)
  // ============================================================================
  console.log("\n📍 TEST 1: Spatial Search (5km radius)");
  console.log("-".repeat(80));

  // Phase 1: GeoJSON parsing
  const phase1Start1 = performance.now();
  const memBefore1 = process.memoryUsage().heapUsed;

  const phase1Results1 = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT DISTINCT p.id
    FROM "properties" p
    INNER JOIN "addresses" a ON p."addressId" = a.id
    INNER JOIN "geo_objects" g ON a."geoObjectId" = g.id
    WHERE g."geoJson" IS NOT NULL
      AND ST_DWithin(
        ST_GeomFromGeoJSON(g."geoJson"::text)::geography,
        ST_SetSRID(ST_MakePoint(${testLon}, ${testLat}), 4326)::geography,
        ${testRadius}
      )
  `;

  const memAfter1 = process.memoryUsage().heapUsed;
  const phase1Time1 = performance.now() - phase1Start1;

  results.push({
    phase: "Phase 1 (GeoJSON)",
    testName: "Spatial Search",
    executionTime: phase1Time1,
    resultCount: phase1Results1.length,
    queryCount: 1,
    memoryUsed: memAfter1 - memBefore1,
  });

  console.log(`Phase 1: ${phase1Time1.toFixed(2)}ms | ${phase1Results1.length} results`);

  // Phase 2: Native geometry
  const phase2Start1 = performance.now();
  const memBefore2 = process.memoryUsage().heapUsed;

  const phase2Results1 = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT DISTINCT p.id
    FROM "properties" p
    INNER JOIN "addresses" a ON p."addressId" = a.id
    INNER JOIN "geo_objects" g ON a."geoObjectId" = g.id
    WHERE g.geometry IS NOT NULL
      AND ST_DWithin(
        g.geometry::geography,
        ST_SetSRID(ST_MakePoint(${testLon}, ${testLat}), 4326)::geography,
        ${testRadius}
      )
  `;

  const memAfter2 = process.memoryUsage().heapUsed;
  const phase2Time1 = performance.now() - phase2Start1;

  results.push({
    phase: "Phase 2 (Native)",
    testName: "Spatial Search",
    executionTime: phase2Time1,
    resultCount: phase2Results1.length,
    queryCount: 1,
    memoryUsed: memAfter2 - memBefore2,
  });

  console.log(`Phase 2: ${phase2Time1.toFixed(2)}ms | ${phase2Results1.length} results`);
  console.log(`⚡ Speedup: ${(phase1Time1 / phase2Time1).toFixed(2)}x faster`);

  // ============================================================================
  // TEST 2: Combined Filters (spatial + price + amenities)
  // ============================================================================
  console.log("\n🔍 TEST 2: Combined Filters (spatial + price + amenities)");
  console.log("-".repeat(80));

  // Phase 1: Multiple queries with intersection
  const phase1Start2 = performance.now();
  const memBefore1_2 = process.memoryUsage().heapUsed;

  // Query 1: Spatial
  const spatialIds = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT DISTINCT p.id
    FROM "properties" p
    INNER JOIN "addresses" a ON p."addressId" = a.id
    INNER JOIN "geo_objects" g ON a."geoObjectId" = g.id
    WHERE g."geoJson" IS NOT NULL
      AND ST_DWithin(
        ST_GeomFromGeoJSON(g."geoJson"::text)::geography,
        ST_SetSRID(ST_MakePoint(${testLon}, ${testLat}), 4326)::geography,
        ${testRadius}
      )
  `;

  // Query 2: Price
  const priceIds = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT DISTINCT p.id
    FROM "properties" p
    INNER JOIN "listings" l ON p.id = l."propertyId" AND l.status = 'published'
    INNER JOIN "payment_terms" pt ON l.id = pt."listingId"
    LEFT JOIN "onetime_payment_terms" op ON pt.id = op."paymentTermsId"
    LEFT JOIN "periodic_payment_terms" pp ON pt.id = pp."paymentTermsId"
    WHERE (op.amount BETWEEN 100000 AND 500000)
       OR (pp."amountPerPeriod" BETWEEN 100000 AND 500000)
  `;

  // Query 3: Amenities
  const amenityIds = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT DISTINCT p.id
    FROM "properties" p
    INNER JOIN "addresses" a ON p."addressId" = a.id
    INNER JOIN "geo_objects" p_geo ON a."geoObjectId" = p_geo.id
    INNER JOIN "amenities" am ON am.type = ANY(ARRAY['hospital', 'school']::"AmenityTypeEnum"[])
    INNER JOIN "geo_objects" am_geo ON am."geoObjectId" = am_geo.id
    WHERE p_geo."geoJson" IS NOT NULL
      AND am_geo."geoJson" IS NOT NULL
      AND ST_DWithin(
        ST_GeomFromGeoJSON(am_geo."geoJson"::text)::geography,
        ST_GeomFromGeoJSON(p_geo."geoJson"::text)::geography,
        1000
      )
  `;

  // Intersection in application
  const spatialSet = new Set(spatialIds.map((p) => p.id));
  const priceSet = new Set(priceIds.map((p) => p.id));
  const amenitySet = new Set(amenityIds.map((p) => p.id));

  const intersected = spatialIds
    .filter((p) => priceSet.has(p.id) && amenitySet.has(p.id))
    .map((p) => p.id);

  const memAfter1_2 = process.memoryUsage().heapUsed;
  const phase1Time2 = performance.now() - phase1Start2;

  results.push({
    phase: "Phase 1 (Multi-query)",
    testName: "Combined Filters",
    executionTime: phase1Time2,
    resultCount: intersected.length,
    queryCount: 3,
    memoryUsed: memAfter1_2 - memBefore1_2,
  });

  console.log(`Phase 1: ${phase1Time2.toFixed(2)}ms | ${intersected.length} results | 3 queries`);

  // Phase 2: Single composite query
  const phase2Start2 = performance.now();
  const memBefore2_2 = process.memoryUsage().heapUsed;

  const phase2Results2 = await prisma.$queryRaw<Array<{ id: string }>>`
    WITH 
    spatial_properties AS (
      SELECT DISTINCT p.id
      FROM "properties" p
      INNER JOIN "addresses" a ON p."addressId" = a.id
      INNER JOIN "geo_objects" g ON a."geoObjectId" = g.id
      WHERE g.geometry IS NOT NULL
        AND ST_DWithin(
          g.geometry::geography,
          ST_SetSRID(ST_MakePoint(${testLon}, ${testLat}), 4326)::geography,
          ${testRadius}
        )
    ),
    price_properties AS (
      SELECT DISTINCT p.id
      FROM "properties" p
      INNER JOIN "listings" l ON p.id = l."propertyId" AND l.status = 'published'
      INNER JOIN "payment_terms" pt ON l.id = pt."listingId"
      LEFT JOIN "onetime_payment_terms" op ON pt.id = op."paymentTermsId"
      LEFT JOIN "periodic_payment_terms" pp ON pt.id = pp."paymentTermsId"
      WHERE (op.amount BETWEEN 100000 AND 500000)
         OR (pp."amountPerPeriod" BETWEEN 100000 AND 500000)
    ),
    amenity_properties AS (
      SELECT DISTINCT p.id
      FROM "properties" p
      INNER JOIN "addresses" a ON p."addressId" = a.id
      INNER JOIN "geo_objects" p_geo ON a."geoObjectId" = p_geo.id
      INNER JOIN "amenities" am ON am.type = ANY(ARRAY['hospital', 'school']::"AmenityTypeEnum"[])
      INNER JOIN "geo_objects" am_geo ON am."geoObjectId" = am_geo.id
      WHERE p_geo.geometry IS NOT NULL
        AND am_geo.geometry IS NOT NULL
        AND ST_DWithin(am_geo.geometry::geography, p_geo.geometry::geography, 1000)
    )
    SELECT p.id
    FROM "properties" p
    WHERE p.id IN (SELECT id FROM spatial_properties)
      AND p.id IN (SELECT id FROM price_properties)
      AND p.id IN (SELECT id FROM amenity_properties)
  `;

  const memAfter2_2 = process.memoryUsage().heapUsed;
  const phase2Time2 = performance.now() - phase2Start2;

  results.push({
    phase: "Phase 2 (CTE)",
    testName: "Combined Filters",
    executionTime: phase2Time2,
    resultCount: phase2Results2.length,
    queryCount: 1,
    memoryUsed: memAfter2_2 - memBefore2_2,
  });

  console.log(`Phase 2: ${phase2Time2.toFixed(2)}ms | ${phase2Results2.length} results | 1 query`);
  console.log(`⚡ Speedup: ${(phase1Time2 / phase2Time2).toFixed(2)}x faster`);

  // ============================================================================
  // SUMMARY TABLE
  // ============================================================================
  console.log("\n📊 BENCHMARK SUMMARY");
  console.log("=".repeat(80));
  console.log(
    "Test                    | Phase        | Time (ms) | Results | Queries | Memory (KB)",
  );
  console.log("-".repeat(80));

  results.forEach((r) => {
    const testName = r.testName.padEnd(23);
    const phase = r.phase.padEnd(12);
    const time = r.executionTime.toFixed(2).padStart(9);
    const count = r.resultCount.toString().padStart(7);
    const queries = r.queryCount.toString().padStart(7);
    const memory = (r.memoryUsed / 1024).toFixed(0).padStart(11);
    console.log(`${testName} | ${phase} | ${time} | ${count} | ${queries} | ${memory}`);
  });

  // Calculate average improvement
  const phase1Avg =
    results
      .filter((r) => r.phase.includes("Phase 1"))
      .reduce((sum, r) => sum + r.executionTime, 0) / 2;
  const phase2Avg =
    results
      .filter((r) => r.phase.includes("Phase 2"))
      .reduce((sum, r) => sum + r.executionTime, 0) / 2;

  console.log("=".repeat(80));
  console.log(`\n✨ OVERALL IMPROVEMENT: ${(phase1Avg / phase2Avg).toFixed(2)}x faster`);
  console.log(`   Phase 1 Average: ${phase1Avg.toFixed(2)}ms`);
  console.log(`   Phase 2 Average: ${phase2Avg.toFixed(2)}ms`);
  console.log(`   Time Saved: ${(phase1Avg - phase2Avg).toFixed(2)}ms per search`);

  await prisma.$disconnect();
}

// Run benchmark
benchmark()
  .then(() => {
    console.log("\n✅ Benchmark complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Benchmark failed:", error);
    process.exit(1);
  });
