import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// Use development database URL if DATABASE_URL is not set
const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/app_db';
const pool = new Pool({ connectionString: databaseUrl });

(async () => {
  try {
    console.log('Starting PetBnB seed process...');

    // Sample users (both owners and sitters)
    const users = [
      { email: 'alice@example.com', password: 'password123', role: 'sitter', first_name: 'Alice', last_name: 'Johnson', phone: '555-0101' },
      { email: 'bob@example.com', password: 'password123', role: 'owner', first_name: 'Bob', last_name: 'Smith', phone: '555-0102' },
      { email: 'carol@example.com', password: 'password123', role: 'both', first_name: 'Carol', last_name: 'Davis', phone: '555-0103' },
      { email: 'david@example.com', password: 'password123', role: 'sitter', first_name: 'David', last_name: 'Wilson', phone: '555-0104' },
      { email: 'emma@example.com', password: 'password123', role: 'sitter', first_name: 'Emma', last_name: 'Brown', phone: '555-0105' },
      { email: 'frank@example.com', password: 'password123', role: 'owner', first_name: 'Frank', last_name: 'Garcia', phone: '555-0106' }
    ];

    // Insert users with hashed passwords
    console.log('Inserting users...');
    for (const user of users) {
      const password_hash = await bcrypt.hash(user.password, 10);
      await pool.query(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone) 
         VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING`,
        [user.email, password_hash, user.role, user.first_name, user.last_name, user.phone]
      );
      console.log(`Inserted user: ${user.first_name} ${user.last_name}`);
    }

    // Sample sitters with Seattle area locations
    const sitters = [
      { 
        email: 'alice@example.com', 
        title: 'Experienced Dog Walker', 
        description: 'Love walking dogs in the neighborhood. 5+ years experience with all breeds.', 
        hourly_rate: 25.00, 
        daily_rate: null,
        coordinates: 'POINT(-122.3321 47.6062)',
        address: '123 Pine St',
        city: 'Seattle'
      },
      { 
        email: 'carol@example.com', 
        title: 'Cat & Small Pet Specialist', 
        description: 'Expert care for cats and small animals. Your pets will feel at home!', 
        hourly_rate: null,
        daily_rate: 50.00, 
        coordinates: 'POINT(-122.2015 47.6097)',
        address: '456 Maple Ave',
        city: 'Bellevue'
      },
      { 
        email: 'david@example.com', 
        title: 'Pet Sitting Professional', 
        description: 'Full-time pet sitter with veterinary background. Available for overnight stays.', 
        hourly_rate: 30.00,
        daily_rate: 75.00, 
        coordinates: 'POINT(-122.3140 47.6205)',
        address: '789 Oak Dr',
        city: 'Seattle'
      },
      { 
        email: 'emma@example.com', 
        title: 'Active Dog Companion', 
        description: 'Perfect for energetic dogs who need lots of exercise and playtime.', 
        hourly_rate: 28.00,
        daily_rate: null, 
        coordinates: 'POINT(-122.3889 47.6131)',
        address: '321 Cedar St',
        city: 'Seattle'
      }
    ];

    console.log('Inserting sitters...');
    for (const sitter of sitters) {
      const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [sitter.email]);
      if (userResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO sitters (user_id, title, description, hourly_rate, daily_rate, location, address, city, available) 
           VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_GeomFromText($6), 4326), $7, $8, $9)
           ON CONFLICT DO NOTHING`,
          [userResult.rows[0].id, sitter.title, sitter.description, sitter.hourly_rate, sitter.daily_rate, sitter.coordinates, sitter.address, sitter.city, true]
        );
        console.log(`Inserted sitter: ${sitter.title}`);
      }
    }

    // Sample pets
    const pets = [
      { owner_email: 'bob@example.com', name: 'Max', type: 'dog', breed: 'Golden Retriever', age: 3, size: 'large', description: 'Friendly and energetic' },
      { owner_email: 'frank@example.com', name: 'Whiskers', type: 'cat', breed: 'Siamese', age: 2, size: 'small', description: 'Independent but loving' },
      { owner_email: 'carol@example.com', name: 'Buddy', type: 'dog', breed: 'Beagle', age: 5, size: 'medium', description: 'Good with kids' }
    ];

    console.log('Inserting pets...');
    for (const pet of pets) {
      const ownerResult = await pool.query('SELECT id FROM users WHERE email = $1', [pet.owner_email]);
      if (ownerResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO pets (owner_id, name, type, breed, age, size, description) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [ownerResult.rows[0].id, pet.name, pet.type, pet.breed, pet.age, pet.size, pet.description]
        );
        console.log(`Inserted pet: ${pet.name}`);
      }
    }

    console.log('PetBnB seed data inserted successfully');
  } catch (error) {
    console.error('Error during seed process:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();