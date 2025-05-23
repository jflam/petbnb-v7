// Mock geocoding service for deterministic testing
import { pool } from './db.js';

// Mock geocoding responses for test addresses
const mockGeocodingData = {
  '2045 15th Ave W, Seattle, WA 98119, Seattle': { lat: 47.6358, lon: -122.3745 },
  '425 15th Ave E, Seattle, WA 98112, Seattle': { lat: 47.6223, lon: -122.3129 },
  '8765 Greenwood Ave N, Seattle, WA 98103, Seattle': { lat: 47.6934, lon: -122.3550 },
  '432 NE 85th St, Seattle, WA 98115, Seattle': { lat: 47.6913, lon: -122.3232 },
  '612 N 85th St, Seattle, WA 98103, Seattle': { lat: 47.6913, lon: -122.3472 },
  '315 Main St, Kirkland, WA 98033, Kirkland': { lat: 47.6768, lon: -122.2059 },
  '16625 Redmond Way, Redmond, WA 98052, Redmond': { lat: 47.6740, lon: -122.1215 },
  '1055 Bellevue Way NE, Bellevue, WA 98004, Bellevue': { lat: 47.6101, lon: -122.2015 },
  '710 Bellevue Way NE, Bellevue, WA 98004, Bellevue': { lat: 47.6142, lon: -122.2001 },
  '12620 SE 41st Pl, Bellevue, WA 98006, Bellevue': { lat: 47.5814, lon: -122.1696 },
  '1503 S Lamar Blvd, Austin, TX 78704, Austin': { lat: 30.2540, lon: -97.7648 },
  '1715 E 6th St, Austin, TX 78702, Austin': { lat: 30.2669, lon: -97.7234 },
  '8500 N Lamar Blvd, Austin, TX 78753, Austin': { lat: 30.3607, lon: -97.6889 },
  '2600 Guadalupe St, Austin, TX 78705, Austin': { lat: 30.2968, lon: -97.7420 },
  '4208 W 35th St, Austin, TX 78703, Austin': { lat: 30.3079, lon: -97.7584 },
  '1823 E Cesar Chavez St, Austin, TX 78702, Austin': { lat: 30.2591, lon: -97.7189 },
  '3825 Airport Blvd, Austin, TX 78722, Austin': { lat: 30.2955, lon: -97.7006 },
  '2800 S 1st St, Austin, TX 78704, Austin': { lat: 30.2409, lon: -97.7677 },
  '6500 Burnet Rd, Austin, TX 78757, Austin': { lat: 30.3378, lon: -97.7261 },
  '1200 W 6th St, Austin, TX 78703, Austin': { lat: 30.2698, lon: -97.7569 }
};

/**
 * Mock geocode function for testing - returns deterministic coordinates
 * @param {string} address - Full address to geocode
 * @returns {Promise<{lat: number, lon: number} | null>} - Coordinates or null if not found
 */
async function mockGeocodeAddress(address) {
  console.log(`🧪 Mock geocoding address: ${address}`);
  
  // Add slight delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 10));
  
  const coordinates = mockGeocodingData[address];
  
  if (coordinates) {
    console.log(`✅ Mock geocoded "${address}" to (${coordinates.lat}, ${coordinates.lon})`);
    return coordinates;
  }
  
  console.log(`❌ No mock coordinates found for address: ${address}`);
  return null;
}

/**
 * Update sitter location in database with geocoded coordinates
 * @param {number} sitterId - Sitter ID to update
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
async function updateSitterLocation(sitterId, lat, lon) {
  try {
    await pool.query(
      `UPDATE sitters 
       SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326) 
       WHERE id = $3`,
      [lon, lat, sitterId]
    );
    console.log(`✅ Updated location for sitter ${sitterId}: (${lat}, ${lon})`);
  } catch (error) {
    console.error(`❌ Error updating sitter ${sitterId} location:`, error);
    throw error;
  }
}

/**
 * Get or geocode sitter locations lazily (test version with mock geocoding)
 * @param {object} sitter - Sitter object from database
 * @returns {Promise<object>} - Sitter with location populated
 */
async function ensureSitterLocation(sitter) {
  // If sitter already has location, return as-is
  if (sitter.location_geojson) {
    return {
      ...sitter,
      location: JSON.parse(sitter.location_geojson),
      location_geojson: undefined
    };
  }
  
  // If sitter has address but no coordinates, try to geocode
  if (sitter.address && sitter.city) {
    const fullAddress = `${sitter.address}, ${sitter.city}`;
    const coordinates = await mockGeocodeAddress(fullAddress);
    
    if (coordinates) {
      // Update database with new coordinates
      await updateSitterLocation(sitter.id, coordinates.lat, coordinates.lon);
      
      // Return sitter with location populated
      return {
        ...sitter,
        location: {
          type: 'Point',
          coordinates: [coordinates.lon, coordinates.lat]
        },
        location_geojson: undefined
      };
    }
  }
  
  // Return sitter without location if geocoding failed
  console.log(`⚠️  Could not mock geocode sitter ${sitter.id}: ${sitter.first_name} ${sitter.last_name}`);
  return {
    ...sitter,
    location: null,
    location_geojson: undefined
  };
}

export { mockGeocodeAddress as geocodeAddress, updateSitterLocation, ensureSitterLocation };