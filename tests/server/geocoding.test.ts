// @vitest-environment node

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { pool } from '../../src/server/db.js';
import { geocodeAddress, updateSitterLocation, ensureSitterLocation } from '../../src/server/geocoding.test.js';
import dotenv from 'dotenv';

// Load test environment
dotenv.config();
if (process.env.RUNNING_IN_DOCKER !== 'true') {
  process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5433/app_db';
}

describe('Geocoding Service Tests', () => {
  let testSitterId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Create test user and sitter for geocoding tests
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['test.geocoding@example.com', 'hashedpassword', 'sitter', 'Test', 'Geocoder', '+1-206-555-9999']
    );
    testUserId = userResult.rows[0].id;

    const sitterResult = await pool.query(
      `INSERT INTO sitters (user_id, title, description, hourly_rate, address, city, available) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [testUserId, 'Test Geocoder', 'Test sitter for geocoding', 25.00, '2045 15th Ave W, Seattle, WA 98119', 'Seattle', true]
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

  it('should geocode a known address', async () => {
    const address = '2045 15th Ave W, Seattle, WA 98119, Seattle';
    const result = await geocodeAddress(address);
    
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('lat');
    expect(result).toHaveProperty('lon');
    expect(typeof result.lat).toBe('number');
    expect(typeof result.lon).toBe('number');
    
    // Seattle coordinates should be roughly in this range
    expect(result.lat).toBeGreaterThan(47.0);
    expect(result.lat).toBeLessThan(48.0);
    expect(result.lon).toBeGreaterThan(-123.0);
    expect(result.lon).toBeLessThan(-122.0);
  });

  it('should return null for unknown address', async () => {
    const address = 'Unknown Street 12345, Nonexistent City';
    const result = await geocodeAddress(address);
    
    expect(result).toBeNull();
  });

  it('should update sitter location in database', async () => {
    const lat = 47.6062;
    const lon = -122.3321;
    
    await updateSitterLocation(testSitterId, lat, lon);
    
    // Verify the location was updated
    const result = await pool.query(
      'SELECT ST_Y(location) as lat, ST_X(location) as lon FROM sitters WHERE id = $1',
      [testSitterId]
    );
    
    expect(result.rows).toHaveLength(1);
    expect(Number(result.rows[0].lat)).toBeCloseTo(lat, 4);
    expect(Number(result.rows[0].lon)).toBeCloseTo(lon, 4);
  });

  it('should ensure sitter location with lazy geocoding', async () => {
    // First, clear the location to test lazy loading
    await pool.query('UPDATE sitters SET location = NULL WHERE id = $1', [testSitterId]);
    
    // Get sitter data without location
    const sitterResult = await pool.query(
      `SELECT s.id, s.title, s.description, s.address, s.city,
              u.first_name, u.last_name,
              ST_AsGeoJSON(s.location) as location_geojson
       FROM sitters s
       JOIN users u ON s.user_id = u.id  
       WHERE s.id = $1`,
      [testSitterId]
    );
    
    const sitter = sitterResult.rows[0];
    expect(sitter.location_geojson).toBeNull();
    
    // Test lazy geocoding
    const geocodedSitter = await ensureSitterLocation(sitter);
    
    expect(geocodedSitter.location).not.toBeNull();
    expect(geocodedSitter.location).toHaveProperty('type', 'Point');
    expect(geocodedSitter.location).toHaveProperty('coordinates');
    expect(Array.isArray(geocodedSitter.location.coordinates)).toBe(true);
    expect(geocodedSitter.location.coordinates).toHaveLength(2);
    
    // Verify coordinates are reasonable for Seattle
    const [lon, lat] = geocodedSitter.location.coordinates;
    expect(lat).toBeGreaterThan(47.0);
    expect(lat).toBeLessThan(48.0);
    expect(lon).toBeGreaterThan(-123.0);
    expect(lon).toBeLessThan(-122.0);
  });

  it('should return existing location if already geocoded', async () => {
    // Ensure sitter has a location
    const lat = 47.6200;
    const lon = -122.3500;
    await updateSitterLocation(testSitterId, lat, lon);
    
    // Get sitter data with location
    const sitterResult = await pool.query(
      `SELECT s.id, s.title, s.description, s.address, s.city,
              u.first_name, u.last_name,
              ST_AsGeoJSON(s.location) as location_geojson
       FROM sitters s
       JOIN users u ON s.user_id = u.id  
       WHERE s.id = $1`,
      [testSitterId]
    );
    
    const sitter = sitterResult.rows[0];
    expect(sitter.location_geojson).not.toBeNull();
    
    // Should return existing location without re-geocoding
    const result = await ensureSitterLocation(sitter);
    
    expect(result.location).not.toBeNull();
    expect(result.location.coordinates[1]).toBeCloseTo(lat, 4);
    expect(result.location.coordinates[0]).toBeCloseTo(lon, 4);
  });
});