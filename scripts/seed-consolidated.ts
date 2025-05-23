import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
// Note: Restaurant seeding removed as it's not part of PetBnB application

// Import seed data from data directory
import { seattleSitters, austinSitters } from '../data/seeds/sitters.js';
import { seattleOwners, austinOwners } from '../data/seeds/owners.js';

dotenv.config();

// Use development database URL if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/app_db';
const pool = new Pool({ connectionString: databaseUrl });

async function seedUsers() {
  console.log('Inserting users...');
  
  // Combine all sitters and owners
  const allSitters = [...seattleSitters, ...austinSitters];
  const allOwners = [...seattleOwners, ...austinOwners];
  
  // Insert sitter users
  for (const sitterData of allSitters) {
    const user = sitterData.user;
    const password_hash = await bcrypt.hash(user.password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING`,
      [user.email, password_hash, user.role.toLowerCase(), user.firstName, user.lastName, user.phone]
    );
    console.log(`Inserted user: ${user.firstName} ${user.lastName} (${user.role})`);
  }
  
  // Insert owner users
  for (const owner of allOwners) {
    const password_hash = await bcrypt.hash(owner.password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING`,
      [owner.email, password_hash, owner.role.toLowerCase(), owner.firstName, owner.lastName, owner.phone]
    );
    console.log(`Inserted user: ${owner.firstName} ${owner.lastName} (${owner.role})`);
  }
}

async function seedSitters() {
  console.log('Inserting sitters...');
  
  const allSitters = [...seattleSitters, ...austinSitters];
  
  for (const sitterData of allSitters) {
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [sitterData.user.email]);
    if (userResult.rows.length > 0) {
      const profile = sitterData.profile;
      const coordinates = `POINT(${profile.longitude} ${profile.latitude})`;
      
      await pool.query(
        `INSERT INTO sitters (
          user_id, title, description, hourly_rate, daily_rate, location, 
          address, city, available
        ) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_GeomFromText($6), 4326), $7, $8, $9)
        ON CONFLICT DO NOTHING`,
        [
          userResult.rows[0].id,
          `${profile.bio.substring(0, 50)}...`, // Use first part of bio as title
          `${profile.bio}\n\nExperience: ${profile.experience}`,
          profile.hourlyRate,
          null, // No daily rate in the new data structure
          coordinates,
          profile.address,
          profile.city,
          true
        ]
      );
      console.log(`Inserted sitter: ${sitterData.user.firstName} ${sitterData.user.lastName}`);
    }
  }
}

// Restaurant seeding removed - not part of PetBnB application

(async () => {
  try {
    console.log('Starting consolidated PetBnB seed process...');
    
    await seedUsers();
    await seedSitters();
    
    console.log('Consolidated seed data inserted successfully');
  } catch (error) {
    console.error('Error during seed process:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();