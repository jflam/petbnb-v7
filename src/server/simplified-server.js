// PetBnB Express server
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { pool } from './db.js';
import { ensureSitterLocation } from './geocoding.js';
import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS and body parsing
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Validation schemas
const nearbySchema = z.object({
  lon: z.coerce.number(),
  lat: z.coerce.number(),
  km: z.coerce.number().default(5)
});

const sitterCreateSchema = z.object({
  user_id: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  hourly_rate: z.number().positive().optional(),
  daily_rate: z.number().positive().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  lon: z.number(),
  lat: z.number()
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        fields: err.flatten()
      }
    });
  }
  
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

// Health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      db_time: result.rows[0].now
    });
  } catch (error) {
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      db_status: 'not connected'
    });
  }
});

// Get all sitters (with lazy geocoding)
app.get('/api/sitters', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        s.id, s.title, s.description, s.hourly_rate, s.daily_rate, 
        s.address, s.city, s.available, s.image_url, s.rating, s.review_count,
        u.first_name, u.last_name, u.phone,
        ST_AsGeoJSON(s.location) as location_geojson
      FROM sitters s
      JOIN users u ON s.user_id = u.id
      WHERE s.available = true
      ORDER BY s.rating DESC, s.review_count DESC
    `);

    // Process each sitter to ensure they have coordinates
    const results = await Promise.all(
      rows.map(async (row) => await ensureSitterLocation(row))
    );
    
    res.json(results);
  } catch (error) {
    console.error('Error querying sitters:', error);
    res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch sitters'
      }
    });
  }
});

// Get nearby sitters
app.get('/api/sitters/nearby', async (req, res) => {
  try {
    const { lon, lat, km } = nearbySchema.parse(req.query);
    
    // First, get sitters that already have coordinates
    const { rows: locatedSitters } = await pool.query(`
      SELECT 
        s.id, s.title, s.description, s.hourly_rate, s.daily_rate,
        s.address, s.city, s.available, s.image_url, s.rating, s.review_count,
        u.first_name, u.last_name, u.phone,
        ST_AsGeoJSON(s.location) as location_geojson,
        ST_Distance(s.location::geography, ST_MakePoint($1,$2)::geography) AS meters
      FROM sitters s
      JOIN users u ON s.user_id = u.id
      WHERE s.available = true 
        AND s.location IS NOT NULL
        AND ST_DWithin(s.location::geography, ST_MakePoint($1,$2)::geography, $3*1000)
      ORDER BY meters
    `, [lon, lat, km]);
    
    // Also get sitters without coordinates for potential geocoding
    const { rows: unlocatedSitters } = await pool.query(`
      SELECT 
        s.id, s.title, s.description, s.hourly_rate, s.daily_rate,
        s.address, s.city, s.available, s.image_url, s.rating, s.review_count,
        u.first_name, u.last_name, u.phone,
        ST_AsGeoJSON(s.location) as location_geojson
      FROM sitters s
      JOIN users u ON s.user_id = u.id
      WHERE s.available = true 
        AND s.location IS NULL
        AND s.address IS NOT NULL
      LIMIT 5
    `);
    
    // Process located sitters
    const locatedResults = locatedSitters.map(row => ({
      ...row,
      meters: Math.round(row.meters),
      location: row.location_geojson ? JSON.parse(row.location_geojson) : null,
      location_geojson: undefined
    }));
    
    // Try to geocode up to 5 unlocated sitters and check if they're nearby
    const geocodedResults = [];
    for (const sitter of unlocatedSitters) {
      const sitterWithLocation = await ensureSitterLocation(sitter);
      if (sitterWithLocation.location) {
        // Calculate distance after geocoding
        const distanceQuery = await pool.query(`
          SELECT ST_Distance(ST_MakePoint($1,$2)::geography, ST_MakePoint($3,$4)::geography) AS meters
        `, [
          sitterWithLocation.location.coordinates[0], 
          sitterWithLocation.location.coordinates[1],
          lon, 
          lat
        ]);
        
        const meters = Math.round(distanceQuery.rows[0].meters);
        if (meters <= km * 1000) {
          geocodedResults.push({
            ...sitterWithLocation,
            meters
          });
        }
      }
    }
    
    // Combine and sort results
    const allResults = [...locatedResults, ...geocodedResults]
      .sort((a, b) => a.meters - b.meters);
    
    res.json(allResults);
  } catch (error) {
    console.error('Error querying nearby sitters:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          fields: error.flatten()
        }
      });
    }
    
    // Return mock data if database query fails
    res.json([
      {
        id: 1,
        title: 'Dog Walker (Mock)',
        first_name: 'Test',
        last_name: 'Sitter',
        city: 'Seattle',
        hourly_rate: 25.00,
        location: {
          type: 'Point',
          coordinates: [parseFloat(req.query.lon) || -122.3321, parseFloat(req.query.lat) || 47.6062]
        },
        meters: 500
      }
    ]);
  }
});

// Get sitter by ID
app.get('/api/sitters/:id', async (req, res) => {
  try {
    const sitterId = parseInt(req.params.id);
    if (isNaN(sitterId)) {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'Invalid sitter ID' }
      });
    }

    const { rows } = await pool.query(`
      SELECT 
        s.*, 
        u.first_name, u.last_name, u.email, u.phone,
        ST_AsGeoJSON(s.location) as location_geojson
      FROM sitters s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [sitterId]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Sitter not found' }
      });
    }

    const result = {
      ...rows[0],
      location: rows[0].location_geojson ? JSON.parse(rows[0].location_geojson) : null,
      location_geojson: undefined
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching sitter:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
    });
  }
});

// Create new sitter profile
app.post('/api/sitters', async (req, res) => {
  try {
    const data = sitterCreateSchema.parse(req.body);
    
    const { rows } = await pool.query(`
      INSERT INTO sitters (user_id, title, description, hourly_rate, daily_rate, location, address, city, available)
      VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9, true)
      RETURNING *
    `, [
      data.user_id, data.title, data.description, 
      data.hourly_rate, data.daily_rate, 
      data.lon, data.lat, data.address, data.city
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating sitter:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          fields: error.flatten()
        }
      });
    }
    
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create sitter profile' }
    });
  }
});

// Get users
app.get('/api/users', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, email, role, first_name, last_name, phone, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error querying users:', error);
    res.json([]);
  }
});

// Get pets for a user
app.get('/api/users/:userId/pets', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        error: { code: 'INVALID_ID', message: 'Invalid user ID' }
      });
    }

    const { rows } = await pool.query(`
      SELECT * FROM pets WHERE owner_id = $1 ORDER BY created_at DESC
    `, [userId]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
    });
  }
});

// Get bookings
app.get('/api/bookings', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        b.*,
        u_owner.first_name as owner_first_name,
        u_owner.last_name as owner_last_name,
        s.title as sitter_title,
        u_sitter.first_name as sitter_first_name,
        u_sitter.last_name as sitter_last_name,
        p.name as pet_name,
        p.type as pet_type
      FROM bookings b
      JOIN users u_owner ON b.owner_id = u_owner.id
      JOIN sitters s ON b.sitter_id = s.id
      JOIN users u_sitter ON s.user_id = u_sitter.id
      JOIN pets p ON b.pet_id = p.id
      ORDER BY b.created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error querying bookings:', error);
    res.json([]);
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' }
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`PetBnB server running on port ${PORT}`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

export default app;