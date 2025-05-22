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