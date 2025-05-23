#!/bin/sh
set -e

echo "Starting PetBnB application..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
./scripts/wait-for-it.sh postgres:5433 -- echo "Database is ready"

# Run migrations
echo "Running database migrations..."
npm run migrate

# Seed the database
echo "Seeding database..."
npm run seed

# Start the application
echo "Starting server..."
exec node src/server/simplified-server.js