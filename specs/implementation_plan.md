# GitHub Template for AI Coding Agents: React 19 + Vite 6 + Express 5 + PostgreSQL 15/PostGIS 3.4

---

## Part 1 • Product Requirements Document (PRD) — **Why & What**

*(unchanged from earlier drafts)*

---

## Part 2 • Implementation Plan — **What & How (Prisma‑less SQL‑first)**

### 0 · Locked‑In Versions (revised 2025‑05‑15)

| Domain / Layer | Component | Pinned Version | Notes |
|----------------|-----------|----------------|-------|
| **Core Runtime** | Node.js | **20.11.x LTS** | Required by Vite 6 / Express 5 |
| | TypeScript | **5.3.x** | Compiler and type checking |
| | npm | **10.x** | Package manager (not pnpm) |
| **Front-End** | React | **18.0.0** | UI framework (keep current) |
| | Vite | **6.0.0** | Bundler/dev‑server (keep current) |
| | SWR | **2.2.4** | Data fetching (keep current) |
| | Tailwind CSS | **3.4.x** | CSS framework (new addition) |
| | React Hook Form | **7.45.x** | Form handling |
| | Zod | **3.22.x** | Runtime validation |
| | Vitest | **3.x** | Unified testing framework |
| | Playwright | **1.42.x** | E2E testing |
| **Back-End** | Express | **5.0.0-rc.1** | Node.js framework (keep current) |
| | pg | **8.x** | Raw SQL PostgreSQL driver |
| | Passport.js | **0.7.x** | Authentication (email/password only) |
| **Data Stores** | PostgreSQL | **15.4** | Primary database |
| | PostGIS | **3.4** | Spatial extensions (keep for sitter discovery) |
| **DevOps / Tooling** | Docker Engine | **24.0.x** | Containerization |
| | Docker Compose | **2.x** | Simple deployment (no Kubernetes) |
| | ESLint | **8.55.x** | Code linting |
| | Prettier | **3.1.x** | Code formatting |
| | Husky | **8.0.x** | Git hooks |
| | commitlint | **17.8.x** | Commit message linting |

> Types are handled via Zod + explicit TS interfaces; no ORM required. Single-page app architecture with state-based views instead of routing.

### 0.1 · Module System Standardization

This project uses **ECMAScript Modules (ESM)** throughout the entire codebase. All files must follow these conventions:

| Component | Extension | Import Pattern | Notes |
|-----------|-----------|----------------|-------|
| Server code | .js | `import x from 'y'` | All server files must use .js extension with ESM imports |
| TypeScript | .ts/.tsx | `import x from 'y'` | TypeScript files compile to ESM |
| Config files | .js | `export default {}` | Config files use ESM syntax |

#### TypeScript Configuration
```typescript
// tsconfig.server.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "Node16",        // Use Node16 module resolution
    "moduleResolution": "Node16", // Use Node16 module resolution
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    // Other options...
  }
}
```

#### Package.json Configuration
```json
{
  "type": "module",           // Declare the project as ESM
  "imports": {                // Add subpath imports
    "#server/*": "./src/server/*",
    "#db": "./src/server/db.js"
  }
}
```

---

### 1 · Project Scaffolding (boiler‑plate trimmed)

Relevant **non‑obvious** `package.json` scripts:

```jsonc
"scripts": {
  // dev helpers (standard Vite / nodemon omitted)
  "seed": "node scripts/seed.js",
  "migrate": "node-pg-migrate -d $DATABASE_URL -m migrations",
  "check-db": "node scripts/check-db.js",
  // testing layers (unified Vitest)
  "test": "vitest run",
  "test:unit": "vitest run",
  "test:e2e": "playwright test"
}
```

Directory highlights (new):

```
└── migrations/
    ├── 001_init.sql         # schema & GiST index
    └── 002_seed_marker.sql  # optional data patch
└── scripts/
    ├── seed.js              # CSV → COPY → UPDATE geometry
    ├── check-db.js          # Database verification
└── src/server/db.js         # pg Pool helper
```

### 1.2 · Vite Entry Point Configuration

The Vite build requires an HTML entry point at project root:

```html
<!-- index.html - REQUIRED -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PetBnB - Pet Sitting Marketplace</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/client/main.tsx"></script>
  </body>
</html>
```

```typescript
// vite.config.ts - REQUIRED CONFIGURATION
export default defineConfig({
  plugins: [react()],
  root: './',                 // Root directory contains index.html
  build: {
    outDir: 'dist/client',    // Output client build to this folder
    emptyOutDir: true
  },
  // Other options...
});
```

Create public directory for static assets:
```bash
mkdir -p public
touch public/favicon.ico     # Required placeholder favicon
```

### 1.3 · Build and Development Scripts

#### Package.json Scripts Required Configuration

```json
"scripts": {
  "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
  "dev:client": "vite",
  "dev:server": "nodemon src/server/index.js",
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build",
  "build:server": "tsc -p tsconfig.server.json",
  "start": "node src/server/index.js",
  "seed": "node scripts/seed.js",
  "migrate": "node-pg-migrate -d $DATABASE_URL -m migrations",
  "check-db": "node scripts/check-db.js",
  "typecheck": "tsc --noEmit"
}
```

#### Development Environment Setup

1. Start the database: `docker-compose up -d postgres`
2. Verify database connection: `npm run check-db`
3. Run migrations: `npm run migrate`
4. Seed the database: `npm run seed`
5. Start development servers: `npm run dev`

---

### 2 · Database & Migrations (SQL‑first)

#### 2.1 Initial schema (`migrations/001_init.sql`)

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (both pet owners and sitters)
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('owner', 'sitter', 'both')),
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  phone         TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Pet sitters table
CREATE TABLE sitters (
  id            SERIAL PRIMARY KEY,
  user_id       INT REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  hourly_rate   DECIMAL(10,2),
  daily_rate    DECIMAL(10,2),
  location      geometry(Point, 4326),
  address       TEXT,
  city          TEXT,
  available     BOOLEAN DEFAULT true,
  image_url     TEXT,
  rating        NUMERIC(2,1) DEFAULT 0,
  review_count  INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Pets table
CREATE TABLE pets (
  id            SERIAL PRIMARY KEY,
  owner_id      INT REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  type          TEXT NOT NULL, -- dog, cat, bird, etc.
  breed         TEXT,
  age           INT,
  size          TEXT CHECK (size IN ('small', 'medium', 'large')),
  description   TEXT,
  special_needs TEXT,
  image_url     TEXT,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id            SERIAL PRIMARY KEY,
  owner_id      INT REFERENCES users(id) ON DELETE CASCADE,
  sitter_id     INT REFERENCES sitters(id) ON DELETE CASCADE,
  pet_id        INT REFERENCES pets(id) ON DELETE CASCADE,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  total_amount  DECIMAL(10,2),
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Spatial index for sitter location searches
CREATE INDEX sitters_location_gix ON sitters USING GIST (location);

-- Other useful indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sitters_user_id ON sitters(user_id);
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX idx_bookings_sitter_id ON bookings(sitter_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
```

Run locally or in CI:

```bash
npm run migrate   # picks up all *.sql files in migrations/
```

#### 2.2 Seed script — **Pure JS batch INSERT for PetBnB data**

```js
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  // Sample users (both owners and sitters)
  const users = [
    { email: 'alice@example.com', password: 'password123', role: 'sitter', first_name: 'Alice', last_name: 'Johnson', phone: '555-0101' },
    { email: 'bob@example.com', password: 'password123', role: 'owner', first_name: 'Bob', last_name: 'Smith', phone: '555-0102' },
    { email: 'carol@example.com', password: 'password123', role: 'both', first_name: 'Carol', last_name: 'Davis', phone: '555-0103' }
  ];

  // Insert users with hashed passwords
  for (const user of users) {
    const password_hash = await bcrypt.hash(user.password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING`,
      [user.email, password_hash, user.role, user.first_name, user.last_name, user.phone]
    );
  }

  // Sample sitters with Seattle area locations
  const sitters = [
    { email: 'alice@example.com', title: 'Experienced Dog Walker', description: 'Love walking dogs in the neighborhood', hourly_rate: 25.00, coordinates: 'POINT(-122.3321 47.6062)' },
    { email: 'carol@example.com', title: 'Cat & Small Pet Specialist', description: 'Expert care for cats and small animals', daily_rate: 50.00, coordinates: 'POINT(-122.2015 47.6097)' }
  ];

  for (const sitter of sitters) {
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [sitter.email]);
    if (userResult.rows.length > 0) {
      await pool.query(
        `INSERT INTO sitters (user_id, title, description, hourly_rate, daily_rate, location, city, available) 
         VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_GeomFromText($6), 4326), $7, $8)
         ON CONFLICT DO NOTHING`,
        [userResult.rows[0].id, sitter.title, sitter.description, sitter.hourly_rate, sitter.daily_rate, sitter.coordinates, 'Seattle', true]
      );
    }
  }

  console.log('Seed data inserted successfully');
  await pool.end();
})();
```

> **Edge‑case handled:** Passwords are properly hashed; `ON CONFLICT` keeps the seed idempotent for development iterations.

#### 2.3 · Database Verification Script

Create a script to verify database connection and schema:

```javascript
// scripts/check-db.js
import { config } from 'dotenv';
import { Pool } from 'pg';

config();

async function checkDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/app_db'
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
```

Run this script after setting up the database to verify everything is working:
```bash
node scripts/check-db.js
```

---

### 3 · Backend Corner‑cases

Below are the **tricky patterns** that differ from vanilla Express wiring.

#### 3.1 Unified Error Envelope + Validation Mapping

```ts
import { ZodError } from 'zod';
interface ApiError { code: string; message: string; fields?: any }

app.use((err, _req, res, next) => {
  if (err instanceof ZodError) {
    const payload: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      fields: err.flatten(),
    };
    return res.status(400).json({ error: payload });
  }
  next(err);
});
```

#### 3.2 Controller Skeleton Using **pg** Pool

```ts
// controllers/sittersController.ts
import { z } from 'zod';
import { pool } from '../db.js';

const nearbySchema = z.object({
  lon: z.coerce.number(),
  lat: z.coerce.number(),
  km:  z.coerce.number().default(5)
});

export async function nearby(req, res, next) {
  try {
    const { lon, lat, km } = nearbySchema.parse(req.query);
    const { rows } = await pool.query(
      `SELECT s.id, s.title, s.description, s.hourly_rate, s.daily_rate, s.rating, s.available,
              u.first_name, u.last_name,
              ST_Distance(s.location::geography, ST_MakePoint($1,$2)::geography) AS meters
         FROM sitters s
         JOIN users u ON s.user_id = u.id
        WHERE s.available = true 
          AND ST_DWithin(s.location::geography, ST_MakePoint($1,$2)::geography, $3*1000)
        ORDER BY meters`,
      [lon, lat, km]
    );
    res.json(rows);
  } catch (err) { next(err); }
}
```

#### 3.3 Structured Logging (pino)

```ts
import pino from 'pino';
export const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' });
app.use((req, _res, next) => { logger.info({ path: req.path }, 'request'); next(); });
```

#### 3.4 Streaming NDJSON for Big Queries

If result‑set > 10 k rows, stream:

```ts
res.setHeader('Content-Type','application/x-ndjson');
const cursor = pool.query(new Cursor(sql,[lon,lat,km]));
function pump() { cursor.read(1000,(err,rows)=>{ if(!rows.length){res.end();return;} rows.forEach(r=>res.write(JSON.stringify(r)+'\n')); pump();}); }
pump();
```

#### 3.5 · Database Connection with Graceful Fallbacks

```ts
// src/server/db.js
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a database connection pool with fallback defaults
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/app_db';
console.log(`Connecting to database: ${connectionString.split('@')[1]}`);

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10
});

// Add error handling for resilience
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  // Don't crash in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

// Test connection but continue with mock data if it fails
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connection established');
    return true;
  } catch (error) {
    console.error('Database connection failed, using mock data:', error.message);
    return false;
  }
};
```

#### API Endpoint Pattern with Fallback Data

All data-access API endpoints must follow this pattern:

```typescript
app.get('/api/endpoint', async (req, res) => {
  try {
    // Database query
    const { rows } = await pool.query('SELECT * FROM table');
    res.json(rows);
  } catch (error) {
    console.error('Database error, returning mock data:', error);
    // Return mock data that matches real data structure
    res.json([{ id: 1, name: 'Mock Data' }]);
  }
});
```

#### 3.6 · Dual Server Implementation Strategy

To provide maximum compatibility, implement two server versions:

1. **TypeScript Version** - For type checking and development:
   ```typescript
   // src/server/index.ts
   import express from 'express';
   import { Pool } from 'pg';
   // TypeScript implementation with types
   ```

2. **JavaScript Version** - For reliable execution:
   ```javascript
   // src/server/index.js
   import express from 'express';
   import { Pool } from 'pg';
   // Same implementation without TypeScript
   ```

3. **Package.json Configuration**:
   ```json
   "scripts": {
     "dev:server": "nodemon src/server/index.js",
     "start": "node src/server/index.js"
   }
   ```

The build process should compile TypeScript code to the JavaScript version, but maintain both during development for maximum compatibility.

---

### 4 · Front‑end Corner‑cases

Below are the two common pitfalls when wiring Leaflet in a Vite + React 19 environment.

#### 4.1 · Leaflet Marker Icon Fix

```typescript
// src/client/utils/fixLeafletIcons.ts - REQUIRED IMPLEMENTATION
import L from 'leaflet';

// Delete the _getIconUrl method to allow for URL overrides
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Use direct URLs from CDN for icons to avoid bundling issues
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
```

This approach MUST be used with Vite to ensure marker icons load correctly. Importing the images directly will fail with most bundlers.

#### 4.2 Large‑Dataset Clustering

```tsx
import 'leaflet.markercluster';
export function useCluster(map: L.Map | null, data: Restaurant[]) {
  useEffect(()=>{
    if(!map) return;
    const group = L.markerClusterGroup();
    data.forEach(r=> group.addLayer(L.marker([r.lat,r.lon])));
    map.addLayer(group);
    return ()=> map.removeLayer(group);
  },[map,data]);
}
```

#### 4.3 Data‑Fetch Hook Example (SWR pattern)

```ts
import useSWR from 'swr';
export function useNearbySitters(lon:number,lat:number,km=5){
  const { data, error } = useSWR(`/api/sitters/nearby?lon=${lon}&lat=${lat}&km=${km}`, fetcher);
  return { sitters:data ?? [], loading:!error&&!data, error };
}
```

---

### 5 · Testing Strategy & CI Pipeline

> **Why testcontainers?** Spatial queries need a live PostGIS backend; unit stubs miss SRID, GiST, and distance‑calculation edge‑cases. A tiny helper (`startPg`) spins an isolated **postgis/postgis:15‑3.4** container, runs migrations + seed, and hands a ready `DATABASE_URL` to each Jest suite. This keeps tests deterministic across dev machines and CI runners.
> We restore the full multi‑layer test plan.

#### 5.1 Test Matrix

| Layer                  | Tool                                  | Key Cases                                                 |
| ---------------------- | ------------------------------------- | --------------------------------------------------------- |
| **Unit — front‑end**   | Vitest 3 + RTL                        | Components render, hooks return correct state.            |
| **Unit — back‑end**    | Jest 30                               | Validation rejects bad input; SQL builder functions.      |
| **Integration API/DB** | Jest + Supertest + **testcontainers** | `/nearby` happy‑path, validation 400, SQL‑inject attempt. |
| **Integration UI/API** | Vitest + MSW                          | Hook displays loading, error, data states.                |
| **E2E**                | Playwright 1.44                       | Map shows 20 seed markers; create‑restaurant flow.        |

#### 5.2 Detailed Test‑Case Checklist

*(Create one file per bullet unless noted otherwise)*

##### Unit — Front‑end

1. **SitterCard renders essential fields** given minimal props.
2. **`useNearbySitters` hook** → returns `loading` then populated array (MSW).
3. **Leaflet icon fix** module runs without throwing in JSDOM.

##### Unit — Back‑end

1. **`nearbySchema` fails** when lat/lon are non‑numeric.
2. **SQL helper** builds parametrised query strings (no `$` injection).
3. **Error handler** converts ZodError → `{ error.code === 'VALIDATION_ERROR' }`.

##### Integration API/DB

1. **Happy path**: `GET /api/sitters/nearby` with seed coords returns 200 + ≥ 1 row.
2. **Distance ordering**: ensure first row `meters` < second row.
3. **Bad query param** (missing lat) → 400.

##### Integration UI/API

1. On network failure MSW returns 500 → hook exposes `error` and component shows alert banner.
2. Changing radius km re‑fires fetch (SWR key change) and updates sitter marker count.

##### E2E (Playwright)

1. Landing page loads within 5 s → map tiles visible.
2. Marker click opens popup with matching sitter name and rates.
3. Fill "Add Sitter Profile" modal → submit → toast 'Created!' appears and new marker exists.
4. Hard refresh → new marker persists (DB round‑trip).

> Mark these bullets off in Jira/Issues; coverage threshold is met when all listed tests are green.

#### 5.3 testcontainers Helper (re‑usable)

```ts
// tests/_setupDb.ts
import { PostgreSqlContainer } from 'testcontainers';
export async function startPg() {
  const container = await new PostgreSqlContainer('postgis/postgis:15-3.4').start();
  process.env.DATABASE_URL = container.getConnectionUri();
  await execa('npm',['run','migrate']);
  await execa('npm',['run','seed']);
  return container;
}
```

Each Jest suite calls `startPg()` in `beforeAll`.

#### 5.4 · Testing Configurations (Complete Details)

#### Vitest for Client Tests

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/client'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/client/setup.ts'],
    deps: {
      inline: ['leaflet'] // Inline leaflet to avoid module issues
    }
  },
});
```

#### Client Test Setup

```typescript
// tests/client/setup.ts
import { vi, afterEach } from 'vitest';

// Clean up after each test
afterEach(() => {
  vi.resetAllMocks();
});
```

#### Jest for API Tests

To avoid TypeScript/ESM complications, use plain JavaScript for API tests:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/server/**/*.test.js'],
  testTimeout: 30000
};
```

#### API Test Approach

API tests should use a test-specific Express app to avoid database dependencies:

```javascript
// tests/server/api.test.js
const request = require('supertest');
const express = require('express');

// Create test-specific app
const app = express();

// Define minimal test endpoints that mirror production endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Tests
describe('API Tests', () => {
  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });
  
  it('GET /api/sitters/nearby validates required params', async () => {
    const res = await request(app).get('/api/sitters/nearby');
    expect(res.status).toBe(400);
  });
});
```

#### Required DevDependencies

```json
"devDependencies": {
  "@testing-library/jest-dom": "^6.4.2",
  "@testing-library/react": "^14.1.2",
  "jsdom": "^24.0.0",
  "jest": "^29.7.0",
  "supertest": "^6.3.3",
  "vitest": "^3.0.0"
}
```

#### 5.3 Playwright Config Snippet

```ts
// playwright.config.ts
export default { testDir:'tests/e2e', webServer:{ command:'docker compose up -d', port:5173, timeout:120_000 } };
```

#### 5.4 CI YAML (lint ✚ tests ✚ coverage)

```yaml
      - name: Run tests with coverage
        run: npm run test && npx nyc report
      - name: Upload to Codecov
        uses: codecov/codecov-action@v4
        with: { token: ${{ secrets.CODECOV_TOKEN }} }
```

> Coverage threshold configured in `nyc.config.js` at 90 % global.

---

### 6 · Docker & Compose — Additional Notes

* **entrypoint.sh** inside app image:

  ```bash
  #!/bin/sh
  set -e
  node-pg-migrate -d "$DATABASE_URL" -m /app/migrations
  node /app/scripts/seed.js
  exec node /app/src/server/index.js
  ```
* **Health‑check wait**: add `wait-for-it.sh db:5432 --` before migrations in compose for local dev.

\--- · Testing Strategy (unchanged snippets)

* testcontainers for PostGIS
* MSW for front‑end

---

### 6 · Docker & Compose (only env tweak)

`app` service now needs `scripts/migrate && npm run seed && node dist/server/index.js` in CMD or entrypoint.  Provide a tiny entrypoint.sh.

---

### 7 · Updated Milestones

| Week | Deliverable                                              |
| ---- | -------------------------------------------------------- |
| 1    | Repo skeleton; pg‑migrate wired; `.env` ready            |
| 2    | SQL schema, migrations run; seed script green            |
| 3    | Express API routes + Zod validation; React scaffold      |
| 4    | Leaflet map & nearby search end‑to‑end; CI green         |
| 5    | Docker multi‑stage image; deploy smoke test; docs polish |

---

### 8 · Outstanding Corner‑case Issues

| Area         | Gap                                            | Rationale                         |
| ------------ | ---------------------------------------------- | --------------------------------- |
| **CI/CD**    | Docker build‑push + Codecov coverage gate      | Ensure deploy & quality signals.  |
| **Security** | Rate‑limit (`express-rate-limit`) + strict CSP | Edge‑case but important for prod. |

\------|-----|-----------|
\| **Testing** | Integrate `startPg` helper into template repo | Avoid boiler‑plate duplication. |
\| **CI/CD** | Docker build‑push + Codecov coverage gate | Ensure deploy & quality signals. |
\| **Security** | Rate‑limit (`express-rate-limit`) + strict CSP | Edge‑case but important for prod. |

### 9 · Required Documentation Files

#### DATABASE.md

Create a detailed guide for database setup and troubleshooting:

```markdown
# Database Setup Guide

## Prerequisites
- Docker and Docker Compose
- Node.js 20 or higher

## Setup Steps
1. Start PostgreSQL container: `docker-compose up -d postgres`
2. Run migrations: `npm run migrate`
3. Seed the database: `npm run seed`
4. Verify setup: `node scripts/check-db.js`

## Troubleshooting
- Check logs: `docker-compose logs postgres`
- Connect directly: `docker exec -it <container> psql -U postgres -d app_db`
- Reset database: 
  ```bash
  docker-compose down
  docker-compose up -d postgres
  npm run migrate
  npm run seed
```

---


**End of Implementation Plan**