#!/usr/bin/env tsx

/**
 * Database reset script that:
 * 1. Starts the PostgreSQL database via Docker Compose
 * 2. Rolls back all migrations to clean state
 * 3. Runs all migrations from scratch
 * 4. Optionally seeds the database with sample data
 * 
 * Usage:
 *   npm run db:reset           # Start DB, reset and run migrations
 *   npm run db:reset -- --seed # Start DB, reset, run migrations, and seed data
 */

import { execSync } from 'child_process';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5433/app_db';

// Parse command line arguments
const shouldSeed = process.argv.includes('--seed');

console.log('🗂️  Starting database reset...');
console.log(`📊 Using database URL: ${databaseUrl}`);

function runCommand(command: string, description: string) {
  console.log(`\n📋 ${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: databaseUrl }
    });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error);
    process.exit(1);
  }
}

async function startDatabase() {
  console.log('\n🐳 Starting PostgreSQL database via Docker Compose...');
  try {
    execSync('docker-compose up -d postgres', { stdio: 'inherit', cwd: process.cwd() });
    console.log('✅ Database container started');
    
    // Wait for the database health check to pass
    console.log('⏳ Waiting for database health check to pass...');
    let healthCheckPassed = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    while (!healthCheckPassed && attempts < maxAttempts) {
      try {
        const result = execSync('docker-compose ps postgres --format json', { encoding: 'utf8', cwd: process.cwd() });
        const containerInfo = JSON.parse(result);
        if (containerInfo.State === 'running' && containerInfo.Health === 'healthy') {
          healthCheckPassed = true;
          console.log('✅ Database is healthy and ready');
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }
    
    if (!healthCheckPassed) {
      console.error('❌ Database health check failed after 30 seconds');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to start database:', error);
    console.log('\n💡 Make sure Docker is running and docker-compose.yml exists');
    process.exit(1);
  }
}

async function checkDatabaseConnection() {
  console.log('\n🔍 Checking database connection...');
  const pool = new Pool({ connectionString: databaseUrl });
  
  let retries = 5;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connection successful');
      await pool.end();
      return;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('❌ Database connection failed after multiple attempts:', error);
        await pool.end();
        process.exit(1);
      }
      console.log(`⏳ Database not ready yet, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function dropAllTables() {
  console.log('\n🧹 Dropping all tables and extensions...');
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    // Drop all tables in public schema
    await pool.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
    console.log('✅ All tables dropped');
    await pool.end();
  } catch (error) {
    console.error('❌ Failed to drop tables:', error);
    await pool.end();
    process.exit(1);
  }
}

async function main() {
  try {
    // Start the database first
    await startDatabase();
    
    // Check if database is accessible
    await checkDatabaseConnection();
    
    // Method 1: Try to rollback migrations first
    console.log('\n🔄 Attempting to rollback migrations...');
    let migrationRollbackSuccess = false;
    try {
      execSync('npx node-pg-migrate down 0 -m migrations', { 
        stdio: 'inherit', 
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: databaseUrl }
      });
      console.log('✅ Migration rollback completed');
      migrationRollbackSuccess = true;
    } catch (error) {
      console.log('⚠️  Migration rollback failed, falling back to manual table drop method');
      migrationRollbackSuccess = false;
    }
    
    // Method 2: If rollback fails, manually drop all tables
    if (!migrationRollbackSuccess) {
      await dropAllTables();
    }
    
    // Run migrations from scratch
    runCommand('npx node-pg-migrate up -m migrations', 'Running all migrations');
    
    // Optionally seed the database
    if (shouldSeed) {
      runCommand('npm run seed', 'Seeding database with sample data');
    }
    
    console.log('\n🎉 Database reset completed successfully!');
    
    if (!shouldSeed) {
      console.log('\n💡 To also seed the database with sample data, run:');
      console.log('   npm run db:reset -- --seed');
    }
    
  } catch (error) {
    console.error('\n❌ Database reset failed:', error);
    process.exit(1);
  }
}

main();