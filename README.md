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
- **Real-time data**: SWR for efficient data fetching and caching
- **Spatial queries with PostGIS**:
  - Find sitters within a specified distance
  - Calculate distances between locations
  - Store and query geographic coordinates
- **Comprehensive testing**: Vitest, Jest, and Playwright
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

## Directory Structure

```
project-root/
├── data/                      # Data files
│   └── table.csv              # Restaurant data
├── migrations/                # SQL migration files
│   ├── 001_init.sql           # Schema & GiST index
│   └── 002_seed_marker.sql    # Marks seed completion
├── scripts/                   # Utility scripts
│   ├── entrypoint.sh          # Docker entrypoint
│   ├── seed.ts                # CSV import script
│   └── wait-for-it.sh         # Service wait script
├── src/
│   ├── client/                # Frontend React application
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API clients
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Utility functions
│   └── server/                # Backend Express application
│       ├── controllers/       # Request handlers
│       ├── db/                # Database utilities
│       │   └── postgis/       # PostGIS specific functions
│       ├── middleware/        # Express middleware
│       ├── routes/            # API routes
│       ├── types/             # TypeScript definitions
│       └── utils/             # Utility functions
├── tests/                     # Test files
│   ├── client/                # Frontend tests
│   └── server/                # Backend tests
├── .env.example               # Environment variables template
├── docker-compose.yml         # Docker services config
├── Dockerfile                 # Multi-stage Docker build
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript config (client)
└── tsconfig.server.json       # TypeScript config (server)
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

# Building
npm run build        # Build both client and server
npm run build:client # Build client only
npm run build:server # Build server only

# Testing
npm run test         # Run all unit and API tests
npm run test:client  # Run client tests
npm run test:server  # Run server tests
npm run test:e2e     # Run end-to-end tests

# Quality
npm run typecheck    # Run TypeScript type checking
npm run lint         # Run ESLint
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
docker run -p 3001:3001 -e DATABASE_URL=******host:5432/db ai-starter-app-postgis:latest
```

For detailed Docker setup instructions, container configurations, and production deployment options, see the [Docker Guide](docs/docker.md).

## License

MIT
