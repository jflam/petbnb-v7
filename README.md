# PetBnB - Pet Sitting Marketplace

A modern pet sitting marketplace application with spatial search capabilities built with:

- React 18 with TypeScript for the frontend
- Vite 6 for fast development and optimized builds
- Express 5 (RC) for the backend API
- PostgreSQL 15 with PostGIS 3.4 for spatial data
- Docker setup for easy development and deployment

## Features

- **Location-based search**: Find pet sitters within a customizable radius
- **Interactive maps**: Leaflet with marker clustering for sitter locations
- **Lazy geocoding**: Real-time address-to-coordinate conversion using OpenStreetMap
- **Real-time data**: SWR for efficient data fetching and caching
- **Spatial queries with PostGIS**:
  - Find sitters within a specified distance
  - Calculate distances between locations
  - Store and query geographic coordinates
  - Distance calculations in meters using geography type
- **Comprehensive testing**: Vitest, Jest, and Playwright with spatial testing
- **Modern UI**: Responsive design with hover effects and gradients
- **Type safety**: Full TypeScript implementation

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers (automatically starts database, runs migrations, and seeds data)
npm run dev
```

> **Note:** The `npm run dev` command will automatically:
> - Start PostgreSQL and PostGIS with Docker on port 5433 (to avoid conflicts)
> - Wait for the database to be ready
> - Run migrations to create tables
> - Seed the database with sample users and sitters
> - Start frontend (port 5173) and backend (port 3001) development servers

## Database

The application uses PostgreSQL with PostGIS for spatial pet sitter searches:

- **Users**: Pet owners, sitters, or both with secure password hashing
- **Sitters**: Profiles with location, rates, ratings, and availability
- **Pets**: Owner's pet profiles with details and special needs
- **Bookings**: Reservation system with status tracking

Key spatial query for finding nearby sitters:

```sql
-- Find all available sitters within 5km of a location
SELECT s.*, u.first_name, u.last_name,
  ST_Distance(s.location::geography, ST_MakePoint($1,$2)::geography) AS meters
FROM sitters s
JOIN users u ON s.user_id = u.id
WHERE s.available = true 
  AND ST_DWithin(s.location::geography, ST_MakePoint($1,$2)::geography, 5000)
ORDER BY meters;
```

For detailed database setup and schema information, see [DATABASE.md](DATABASE.md).

## Geocoding and Spatial Features

The application features **lazy geocoding** that converts addresses to coordinates on-demand:

- **Free geocoding**: Uses OpenStreetMap Nominatim service (no API key required)
- **Lazy loading**: Coordinates are geocoded only when first requested
- **Database caching**: Geocoded coordinates are stored in PostGIS for fast subsequent queries
- **Real addresses**: Seed data includes real Seattle and Austin addresses

### Geocoding Process

1. Sitters are initially seeded with `null` coordinates
2. When `/api/sitters` or `/api/sitters/nearby` is called, addresses are geocoded
3. Coordinates are cached in the database using PostGIS
4. Subsequent requests use cached coordinates for fast spatial queries

### Spatial Queries

All spatial queries use PostGIS with proper geographic calculations:

```sql
-- Distance calculation (returns meters)
ST_Distance(location::geography, ST_MakePoint(lon, lat)::geography)

-- Proximity search (within radius in meters)  
ST_DWithin(location::geography, ST_MakePoint(lon, lat)::geography, radius_meters)

-- Store coordinates with proper SRID
ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
```

For detailed database setup and schema information, see [DATABASE.md](DATABASE.md).

## Directory Structure

```
project-root/
├── data/                      # Data files
│   ├── seeds/                 # Authoritative seed data
│   │   ├── sitters.js         # Sitter profiles (Seattle + Austin)
│   │   └── owners.js          # Pet owner profiles
│   └── table.csv              # Restaurant data (legacy)
├── migrations/                # SQL migration files
│   ├── 001_init.sql           # Schema & spatial indexes
│   └── 002_seed_marker.sql    # Marks seed completion
├── scripts/                   # Utility scripts
│   ├── seed-consolidated.ts   # Database seeding (uses data/)
│   ├── reset-db.ts            # Database reset script
│   ├── entrypoint.sh          # Docker entrypoint
│   └── wait-for-it.sh         # Service wait script
├── src/
│   ├── client/                # Frontend React application
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utility functions
│   └── server/                # Backend Express application
│       ├── geocoding.js       # Geocoding service (production)
│       ├── geocoding.test.js  # Mock geocoding (testing)
│       ├── simplified-server.js # Express server with APIs
│       └── db.js              # PostgreSQL connection pool
├── tests/                     # Test files
│   ├── client/                # Frontend tests (React Testing Library)
│   ├── server/                # Backend tests (API, geocoding, PostGIS)
│   ├── e2e/                   # End-to-end tests (Playwright)
│   ├── fixtures/              # Test data and mocks
│   └── README_GEOCODING.md    # Geocoding testing guide
├── .env.example               # Environment variables template
├── docker-compose.yml         # Docker services config
├── package.json               # Project dependencies
└── tsconfig*.json             # TypeScript configurations
```

## Available Commands

```bash
# Development
npm run dev          # Start Docker database, both client and server, and open browser
npm run dev:client   # Start Vite dev server only
npm run dev:server   # Start Express server only

# Database
npm run migrate      # Run database migrations
npm run seed         # Seed the database with sample data
npm run db:reset     # Reset database: rollback all migrations and run them fresh
npm run db:reset:seed # Reset database and seed with sample data

# Building
npm run build        # Build both client and server
npm run build:client # Build client only
npm run build:server # Build server only

# Testing
npm run test         # Run all unit and API tests with coverage
npm run test:client  # Run client tests (React components)
npm run test:server  # Run server tests (API, geocoding, PostGIS)
npm run test:e2e     # Run end-to-end tests with Playwright
npm run test:all     # Run all tests (unit, API, and E2E)

# Quality
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
```

## Testing

The project includes comprehensive testing for all features including geocoding and PostGIS spatial functionality.

### Test Setup

All tests use the same PostgreSQL database as the application:
- **Database**: `postgres://postgres:postgres@localhost:5433/app_db`
- **Docker**: Start database with `docker-compose up -d postgres` 
- **Fixtures**: Automated test data creation and cleanup

### Test Types

#### 1. Server Tests (`npm run test:server`)

**API Tests** (`tests/server/api.test.ts`)
- ✅ Health check endpoint validation
- ✅ Sitters API with lazy geocoding
- ✅ Nearby sitters with distance calculations
- ✅ Parameter validation and error handling

**Geocoding Tests** (`tests/server/geocoding.test.ts`)
- ✅ Mock geocoding service for deterministic results
- ✅ Address lookup validation (known/unknown addresses)
- ✅ Database location updates with PostGIS
- ✅ Lazy loading behavior verification

**PostGIS Tests** (`tests/server/postgis.test.ts`)
- ✅ Point creation with `ST_SetSRID(ST_MakePoint(), 4326)`
- ✅ GeoJSON output with `ST_AsGeoJSON()`
- ✅ Distance calculations with `ST_Distance(::geography)`
- ✅ Proximity queries with `ST_DWithin(::geography)`
- ✅ Spatial index performance verification

#### 2. Client Tests (`npm run test:client`)
- React component tests using React Testing Library
- Custom hook testing with JSDOM environment

#### 3. End-to-End Tests (`npm run test:e2e`)
- Playwright tests for complete user workflows
- Map interaction and search functionality

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run specific test suites  
npm run test:server    # API, geocoding, PostGIS tests
npm run test:client    # React component tests
npm run test:e2e       # End-to-end Playwright tests

# Run individual test files
npx vitest tests/server/geocoding.test.ts
npx vitest tests/server/postgis.test.ts

# Run tests in watch mode
npx vitest --watch
```

### Mock Services

**Geocoding**: Tests use `src/server/geocoding.test.js` with pre-defined coordinates for deterministic results without external API calls.

**Expected Results**:
```
✓ tests/server/geocoding.test.ts (5 tests)
✓ tests/server/postgis.test.ts (7 tests)  
✓ tests/server/api.test.ts (7 tests)

Tests: 19 passed, Duration: ~1.6s
```

For detailed geocoding and PostGIS testing information, see [`tests/README_GEOCODING.md`](tests/README_GEOCODING.md).

```

## Technologies Used

### Backend
- Node.js 20 LTS
- Express 5.0.0-rc.1
- PostgreSQL 15.5
- PostGIS 3.4.2
- node-pg-migrate 7.x
- pg driver 8.x
- Zod for validation

### Frontend
- React 18
- Vite 6.0.0
- Leaflet for maps
- SWR for data fetching

### Testing
- Vitest 3.1.3 (unified test runner for client and server)
- Playwright 1.44.x (end-to-end tests)
- Testcontainers (database testing)

## Docker Support

The project includes Docker and Docker Compose configuration for both development and production environments.

### Development

```bash
# Start all services in development mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production

```bash
# Build production image
docker build -t ai-starter-app-postgis:latest .

# Run container
docker run -p 3001:3001 -e DATABASE_URL=******host:5433/db ai-starter-app-postgis:latest
```

For detailed Docker setup instructions, container configurations, and production deployment options, see the [Docker Guide](docs/docker.md).

## License

MIT
