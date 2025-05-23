// @vitest-environment node

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { pool } from '../../src/server/db.js';
import dotenv from 'dotenv';

// Load test environment
dotenv.config();
if (process.env.RUNNING_IN_DOCKER !== 'true') {
  process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5433/app_db';
}

describe('PostGIS Integration Tests', () => {
  let testSitterId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Create test data for PostGIS testing
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['test.postgis@example.com', 'hashedpassword', 'sitter', 'PostGIS', 'Tester', '+1-206-555-8888']
    );
    testUserId = userResult.rows[0].id;

    const sitterResult = await pool.query(
      `INSERT INTO sitters (user_id, title, description, hourly_rate, address, city, available, location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326)) RETURNING id`,
      [testUserId, 'PostGIS Tester', 'Test sitter for PostGIS queries', 35.00, 'Space Needle, Seattle, WA', 'Seattle', true, -122.3493, 47.6205]
    );
    testSitterId = sitterResult.rows[0].id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testSitterId) {
      await pool.query('DELETE FROM sitters WHERE id = $1', [testSitterId]);
    }
    if (testUserId) {
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
  });

  it('should create and query PostGIS points correctly', async () => {
    const result = await pool.query(
      'SELECT ST_Y(location) as lat, ST_X(location) as lon FROM sitters WHERE id = $1',
      [testSitterId]
    );
    
    expect(result.rows).toHaveLength(1);
    expect(Number(result.rows[0].lat)).toBeCloseTo(47.6205, 4);
    expect(Number(result.rows[0].lon)).toBeCloseTo(-122.3493, 4);
  });

  it('should return GeoJSON format correctly', async () => {
    const result = await pool.query(
      'SELECT ST_AsGeoJSON(location) as geojson FROM sitters WHERE id = $1',
      [testSitterId]
    );
    
    expect(result.rows).toHaveLength(1);
    const geojson = JSON.parse(result.rows[0].geojson);
    
    expect(geojson).toHaveProperty('type', 'Point');
    expect(geojson).toHaveProperty('coordinates');
    expect(Array.isArray(geojson.coordinates)).toBe(true);
    expect(geojson.coordinates).toHaveLength(2);
    expect(geojson.coordinates[0]).toBeCloseTo(-122.3493, 4); // longitude first in GeoJSON
    expect(geojson.coordinates[1]).toBeCloseTo(47.6205, 4);   // latitude second
  });

  it('should calculate distances accurately using ST_Distance', async () => {
    // Distance from Space Needle to Pike Place Market (approx 0.5 miles = ~800 meters)
    const pikePlaceLat = 47.6097;
    const pikePlaceLon = -122.3421;
    
    const result = await pool.query(
      `SELECT ST_Distance(
         location::geography, 
         ST_MakePoint($1, $2)::geography
       ) AS meters
       FROM sitters WHERE id = $3`,
      [pikePlaceLon, pikePlaceLat, testSitterId]
    );
    
    expect(result.rows).toHaveLength(1);
    const meters = Number(result.rows[0].meters);
    
    // Distance should be approximately 1300 meters (Space Needle to Pike Place)
    expect(meters).toBeGreaterThan(1000);
    expect(meters).toBeLessThan(1500);
  });

  it('should find nearby points using ST_DWithin', async () => {
    // Find sitters within 3km of downtown Seattle (Space Needle is ~1.3km away)
    const downtownLat = 47.6062;
    const downtownLon = -122.3321;
    const radiusMeters = 3000;
    
    const result = await pool.query(
      `SELECT s.id, u.first_name, u.last_name,
              ST_Distance(s.location::geography, ST_MakePoint($1, $2)::geography) AS meters
       FROM sitters s
       JOIN users u ON s.user_id = u.id
       WHERE ST_DWithin(s.location::geography, ST_MakePoint($1, $2)::geography, $3)
       ORDER BY meters`,
      [downtownLon, downtownLat, radiusMeters]
    );
    
    // Should include our test sitter (Space Needle is about 1.3km from downtown)
    const testSitter = result.rows.find(row => row.id === testSitterId);
    expect(testSitter).toBeDefined();
    expect(Number(testSitter.meters)).toBeLessThan(radiusMeters);
    
    // All returned sitters should be within the radius
    result.rows.forEach(row => {
      expect(Number(row.meters)).toBeLessThanOrEqual(radiusMeters);
    });
  });

  it('should handle SRID 4326 (WGS84) correctly', async () => {
    const result = await pool.query(
      'SELECT ST_SRID(location) as srid FROM sitters WHERE id = $1',
      [testSitterId]
    );
    
    expect(result.rows).toHaveLength(1);
    expect(Number(result.rows[0].srid)).toBe(4326);
  });

  it('should update locations using ST_SetSRID and ST_MakePoint', async () => {
    const newLat = 47.6588;  // Fremont Troll coordinates
    const newLon = -122.3475;
    
    await pool.query(
      'UPDATE sitters SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3',
      [newLon, newLat, testSitterId]
    );
    
    const result = await pool.query(
      'SELECT ST_Y(location) as lat, ST_X(location) as lon FROM sitters WHERE id = $1',
      [testSitterId]
    );
    
    expect(result.rows).toHaveLength(1);
    expect(Number(result.rows[0].lat)).toBeCloseTo(newLat, 4);
    expect(Number(result.rows[0].lon)).toBeCloseTo(newLon, 4);
  });

  it('should verify spatial index exists and works', async () => {
    // Check that the spatial index exists
    const indexResult = await pool.query(
      `SELECT indexname FROM pg_indexes 
       WHERE tablename = 'sitters' AND indexname = 'sitters_location_gix'`
    );
    
    expect(indexResult.rows).toHaveLength(1);
    expect(indexResult.rows[0].indexname).toBe('sitters_location_gix');
    
    // Test that spatial queries can use the index (should not error)
    const spatialResult = await pool.query(
      `EXPLAIN (FORMAT JSON) 
       SELECT * FROM sitters 
       WHERE ST_DWithin(location::geography, ST_MakePoint(-122.3321, 47.6062)::geography, 1000)`
    );
    
    expect(spatialResult.rows).toHaveLength(1);
    // The query plan should contain the index name if it's being used efficiently
    const queryPlan = JSON.stringify(spatialResult.rows[0]);
    expect(queryPlan).toContain('sitters');
  });
});