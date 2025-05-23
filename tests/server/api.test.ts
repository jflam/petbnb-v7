// @vitest-environment node

import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';

// Load environment variables 
dotenv.config();

// For local testing, always use localhost instead of Docker service names
if (process.env.RUNNING_IN_DOCKER !== 'true') {
  dotenv.config({ path: '.env.test' });
  // Force localhost for the PostgreSQL connection
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('@postgres:')) {
    process.env.DATABASE_URL = process.env.DATABASE_URL.replace('@postgres:', '@localhost:');
  } else {
    // Fallback to a standard local connection
    process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5433/app_db';
  }
}

let app = null;

// Set up test connection
beforeAll(async () => {
  console.log('Using database URL:', process.env.DATABASE_URL);
  
  // Import the app AFTER setting environment variables
  const appModule = await import('../../src/server/simplified-server.js');
  app = appModule.default;
  
  // Wait a moment for the server to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
}, 5000);

// Clean up 
afterAll(async () => {
  // No cleanup needed - we're using the existing database
});

// Test the PetBnB API endpoints
describe('PetBnB API Tests', () => {
  it('GET /api/health should return a 200 status code', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('time');
    
    // If DB is connected, it will have db_time, otherwise it might have db_status
    if (response.body.db_time) {
      expect(response.body).toHaveProperty('db_time');
    } else {
      expect(response.body).toHaveProperty('db_status', 'not connected');
    }
  });

  it('GET /api/sitters should return an array of sitters with lazy geocoding', async () => {
    const response = await request(app).get('/api/sitters');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Should have sitters from the seed data
    expect(response.body.length).toBeGreaterThan(0);
    
    // Check the first sitter structure
    const sitter = response.body[0];
    expect(sitter).toHaveProperty('id');
    expect(sitter).toHaveProperty('title');
    expect(sitter).toHaveProperty('first_name');
    expect(sitter).toHaveProperty('last_name');
    expect(sitter).toHaveProperty('city');
    expect(sitter).toHaveProperty('address');
    expect(sitter).toHaveProperty('available', true);
    
    // After lazy geocoding, sitter should have location
    if (sitter.location) {
      expect(sitter.location).toHaveProperty('type', 'Point');
      expect(sitter.location).toHaveProperty('coordinates');
      expect(Array.isArray(sitter.location.coordinates)).toBe(true);
      expect(sitter.location.coordinates).toHaveLength(2);
      
      // Coordinates should be valid numbers
      const [lon, lat] = sitter.location.coordinates;
      expect(typeof lon).toBe('number');
      expect(typeof lat).toBe('number');
    }
  }, 10000); // Increase timeout for geocoding
  
  it('GET /api/sitters/nearby should return nearby sitters with distances', async () => {
    // Use coordinates near downtown Seattle 
    const response = await request(app).get('/api/sitters/nearby?lon=-122.3321&lat=47.6062&km=10');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Should return at least one sitter within 10km of downtown Seattle
    expect(response.body.length).toBeGreaterThan(0);
    
    // Check that each sitter has the required properties including distance
    response.body.forEach(sitter => {
      expect(sitter).toHaveProperty('id');
      expect(sitter).toHaveProperty('title');
      expect(sitter).toHaveProperty('first_name');
      expect(sitter).toHaveProperty('last_name');
      expect(sitter).toHaveProperty('city');
      expect(sitter).toHaveProperty('location');
      expect(sitter).toHaveProperty('meters');
      
      // Distance should be a number within the requested radius
      expect(typeof sitter.meters).toBe('number');
      expect(sitter.meters).toBeLessThanOrEqual(10000); // 10km in meters
      expect(sitter.meters).toBeGreaterThanOrEqual(0);
      
      // Location should be valid GeoJSON Point
      expect(sitter.location).toHaveProperty('type', 'Point');
      expect(sitter.location).toHaveProperty('coordinates');
      expect(Array.isArray(sitter.location.coordinates)).toBe(true);
      expect(sitter.location.coordinates).toHaveLength(2);
    });
    
    // Verify results are sorted by distance (closest first)
    const distances = response.body.map(s => s.meters);
    const sortedDistances = [...distances].sort((a, b) => a - b);
    expect(distances).toEqual(sortedDistances);
  }, 15000); // Increase timeout for geocoding multiple sitters

  it('GET /api/sitters/nearby should validate query parameters', async () => {
    // Test missing parameters
    const response = await request(app).get('/api/sitters/nearby');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('GET /api/users should return an array of users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // Should have seed users if database is connected
    if (response.body.length > 0) {
      const user = response.body[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('first_name');
      expect(user).toHaveProperty('last_name');
      // Should not expose password_hash
      expect(user).not.toHaveProperty('password_hash');
    }
  });

  it('GET /api/bookings should return an array of bookings', async () => {
    const response = await request(app).get('/api/bookings');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // Bookings array may be empty in seed data, that's ok
  });

  it('GET /nonexistent should return 404', async () => {
    const response = await request(app).get('/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});