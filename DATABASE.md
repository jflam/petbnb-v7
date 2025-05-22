# Database Setup Guide

## Prerequisites
- Docker and Docker Compose
- Node.js 20 or higher

## Setup Steps

### 1. Start PostgreSQL Container
```bash
docker-compose up -d postgres
```

### 2. Verify Database Connection
```bash
npm run check-db
```

### 3. Run Migrations
```bash
npm run migrate
```

### 4. Seed the Database
```bash
npm run seed
```

## Database Schema

### Users Table
Stores all users (pet owners, sitters, or both):
- `id` - Primary key
- `email` - Unique email address
- `password_hash` - Hashed password (bcrypt)
- `role` - 'owner', 'sitter', or 'both'
- `first_name`, `last_name` - User names
- `phone` - Contact number
- `created_at`, `updated_at` - Timestamps

### Sitters Table
Pet sitter profiles:
- `id` - Primary key
- `user_id` - Foreign key to users table
- `title` - Sitter profile title
- `description` - Bio/description
- `hourly_rate`, `daily_rate` - Pricing (optional)
- `location` - PostGIS Point geometry (SRID 4326)
- `address`, `city` - Location details
- `available` - Boolean availability status
- `rating`, `review_count` - Review metrics
- `created_at`, `updated_at` - Timestamps

### Pets Table
Pet profiles for owners:
- `id` - Primary key
- `owner_id` - Foreign key to users table
- `name` - Pet name
- `type` - 'dog', 'cat', 'bird', etc.
- `breed`, `age`, `size` - Pet characteristics
- `description`, `special_needs` - Additional info
- `created_at` - Timestamp

### Bookings Table
Booking records:
- `id` - Primary key
- `owner_id`, `sitter_id`, `pet_id` - Foreign keys
- `start_date`, `end_date` - Booking period
- `status` - 'pending', 'confirmed', 'completed', 'cancelled'
- `total_amount` - Booking cost
- `notes` - Additional notes
- `created_at`, `updated_at` - Timestamps

## Spatial Queries

The application uses PostGIS for location-based searches:

### Finding Nearby Sitters
```sql
SELECT s.*, 
  ST_Distance(s.location::geography, ST_MakePoint($1,$2)::geography) AS meters
FROM sitters s
WHERE s.available = true 
  AND ST_DWithin(s.location::geography, ST_MakePoint($1,$2)::geography, $3*1000)
ORDER BY meters;
```

## Troubleshooting

### Database Connection Issues
- Check logs: `docker-compose logs postgres`
- Verify port 5433 is available (changed from default 5432 to avoid conflicts)
- Connect directly: `docker exec -it <container> psql -U postgres -d app_db`

### Reset Database
```bash
docker-compose down
docker-compose up -d postgres
npm run migrate
npm run seed
```

### Common Commands
- View all containers: `docker-compose ps`
- Stop all services: `docker-compose down`
- View database logs: `docker-compose logs postgres`
- Check database status: `npm run check-db`

## Sample Data

The seed script creates:
- 6 sample users with different roles
- 4 pet sitters in the Seattle area
- 3 sample pets
- Proper password hashing with bcrypt

All coordinates use SRID 4326 (WGS84) for compatibility with web mapping libraries.