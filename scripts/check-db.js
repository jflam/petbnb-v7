// Simple script to check the database connection and tables
import { config } from 'dotenv';
import { Pool } from 'pg';

config();

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/app_db'
  });

  try {
    // Check connection
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection successful');

    // Check PostGIS
    try {
      const postgisCheck = await pool.query('SELECT PostGIS_Version()');
      console.log('PostGIS version:', postgisCheck.rows[0].postgis_version);
    } catch (error) {
      console.error('PostGIS extension is not installed');
    }

    // Check PetBnB tables
    try {
      const tables = ['users', 'sitters', 'pets', 'bookings'];
      for (const tableName of tables) {
        const tableCheck = await pool.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema='public' AND table_name=$1
        `, [tableName]);
        
        if (tableCheck.rows.length > 0) {
          const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
          console.log(`${tableName} table has ${countResult.rows[0].count} rows`);
        } else {
          console.log(`${tableName} table does not exist - run migrations`);
        }
      }
      
      // Sample spatial data for sitters
      const spatialCheck = await pool.query(`
        SELECT s.id, s.title, ST_AsText(s.location) as wkt_geom
        FROM sitters s
        WHERE s.location IS NOT NULL
        LIMIT 3;
      `);
      if (spatialCheck.rows.length > 0) {
        console.log('Sample sitter locations:');
        spatialCheck.rows.forEach(row => {
          console.log(` - ${row.id}: ${row.title} at ${row.wkt_geom}`);
        });
      }
    } catch (error) {
      console.error('Error checking tables:', error.message);
    }
  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();