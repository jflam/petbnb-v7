# Geocoding and PostGIS Testing Setup

## Overview

This project now includes comprehensive testing for the lazy geocoding functionality and PostGIS spatial queries.

## Test Files

### 1. `tests/server/geocoding.test.ts`
Tests the geocoding service functionality:
- ✅ Mock geocoding for deterministic tests
- ✅ Address lookup with known/unknown addresses  
- ✅ Database location updates with PostGIS
- ✅ Lazy loading behavior (geocode only when needed)
- ✅ Existing location preservation

### 2. `tests/server/postgis.test.ts`
Tests PostGIS spatial functionality:
- ✅ Point creation with `ST_SetSRID(ST_MakePoint(), 4326)`
- ✅ GeoJSON format output with `ST_AsGeoJSON()`
- ✅ Distance calculations with `ST_Distance(::geography)`
- ✅ Proximity queries with `ST_DWithin(::geography)`
- ✅ SRID 4326 (WGS84) coordinate system validation
- ✅ Spatial index verification and performance

### 3. `tests/server/api.test.ts` (Updated)
Tests API endpoints with lazy geocoding:
- ✅ `GET /api/sitters` - Returns sitters with geocoded locations
- ✅ `GET /api/sitters/nearby` - Distance-based queries with sorting
- ✅ Parameter validation and error handling
- ✅ Real-time geocoding during API calls

### 4. `tests/fixtures/testSitters.js`
Test data fixtures:
- ✅ Mock sitter data with null coordinates
- ✅ Expected geocoding responses
- ✅ Structured test data for deterministic results

## Testing Features

### 🔧 **Mock Geocoding Service**
- Uses `src/server/geocoding.test.js` for deterministic testing
- Pre-defined coordinate responses for test addresses
- No external API calls during tests
- Fast and reliable test execution

### 🗺️ **PostGIS Integration**
- Real PostgreSQL with PostGIS extensions
- Spatial index testing and performance validation
- Geographic distance calculations in meters
- Proper SRID 4326 (WGS84) handling

### ⚡ **Lazy Loading Tests**
- Verifies coordinates are geocoded only when needed
- Tests database updates after geocoding
- Validates existing location preservation
- Performance considerations for API calls

## Running Tests

```bash
# Run all server tests (includes geocoding + PostGIS)
npm run test:server

# Run specific test files
npx vitest tests/server/geocoding.test.ts
npx vitest tests/server/postgis.test.ts

# Run with coverage
npm test
```

## Test Database Setup

Tests use the same PostgreSQL database as the application:
- **Local**: `postgres://postgres:postgres@localhost:5433/app_db`
- **Docker**: Connects to containerized PostgreSQL
- **Fixtures**: Creates/cleans test data automatically
- **Isolation**: Each test manages its own test records

## Expected Test Results

```
✓ tests/server/geocoding.test.ts (5 tests)
✓ tests/server/postgis.test.ts (7 tests)  
✓ tests/server/api.test.ts (7 tests)

Tests: 19 passed
```

## Key Testing Validations

1. **Geocoding Accuracy**: Addresses resolve to expected coordinates
2. **PostGIS Functions**: All spatial operations work correctly
3. **API Performance**: Lazy loading doesn't significantly impact response times
4. **Data Integrity**: Database updates are atomic and consistent
5. **Error Handling**: Invalid addresses and missing data handled gracefully

This testing setup ensures the lazy geocoding feature works reliably with real geographic data and PostGIS spatial operations.