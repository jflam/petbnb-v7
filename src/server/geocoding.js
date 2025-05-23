// Geocoding service for address lookups
import { pool } from './db.js';

/**
 * Geocode an address using a free geocoding service (Nominatim - OpenStreetMap)
 * @param {string} address - Full address to geocode
 * @returns {Promise<{lat: number, lon: number} | null>} - Coordinates or null if not found
 */
async function geocodeAddress(address) {
  try {
    // Use Nominatim (OpenStreetMap's geocoding service) - free and no API key required
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
    
    console.log(`🔍 Geocoding address: ${address}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PetBnB-App/1.0 (contact@petbnb.com)' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      console.error(`Geocoding API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const coordinates = {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
      };
      
      console.log(`✅ Geocoded "${address}" to (${coordinates.lat}, ${coordinates.lon})`);
      return coordinates;
    }
    
    console.log(`❌ No coordinates found for address: ${address}`);
    return null;
    
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
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
 * Get or geocode sitter locations lazily
 * This function checks if a sitter has coordinates, and if not, geocodes their address
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
    const coordinates = await geocodeAddress(fullAddress);
    
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
  console.log(`⚠️  Could not geocode sitter ${sitter.id}: ${sitter.first_name} ${sitter.last_name}`);
  return {
    ...sitter,
    location: null,
    location_geojson: undefined
  };
}

export { geocodeAddress, updateSitterLocation, ensureSitterLocation };