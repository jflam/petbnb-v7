// Test fixtures for sitter data
export const testSitters = [
  {
    user: {
      email: "test.sitter1@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "Sitter1",
      phone: "+1-206-555-0001",
      role: "SITTER"
    },
    profile: {
      bio: "Test sitter for automated testing",
      experience: "Mock experience for testing",
      hourlyRate: 25.00,
      serviceRadius: 10,
      address: "1st Ave, Seattle, WA 98101",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      latitude: null,
      longitude: null,
      acceptsDogs: true,
      acceptsCats: false,
      acceptsOtherPets: false,
      hasFencedYard: false,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "test.sitter2@example.com", 
      password: "password123",
      firstName: "Test",
      lastName: "Sitter2",
      phone: "+1-206-555-0002",
      role: "SITTER"
    },
    profile: {
      bio: "Another test sitter for automated testing",
      experience: "More mock experience for testing",
      hourlyRate: 30.00,
      serviceRadius: 15,
      address: "Pike St, Seattle, WA 98101",
      city: "Seattle", 
      state: "WA",
      zipCode: "98101",
      latitude: null,
      longitude: null,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: false,
      hasFencedYard: true,
      hasOtherPets: false,
      isSmokeFree: true
    }
  }
];

// Mock geocoding data for test addresses
export const mockGeocodingResponses = {
  '1st Ave, Seattle, WA 98101, Seattle': { lat: 47.6062, lon: -122.3321 },
  'Pike St, Seattle, WA 98101, Seattle': { lat: 47.6089, lon: -122.3356 }
};

// Expected sitter results after geocoding
export const expectedGeocodedSitters = [
  {
    first_name: "Test",
    last_name: "Sitter1", 
    city: "Seattle",
    address: "1st Ave, Seattle, WA 98101",
    hourly_rate: 25.00,
    location: {
      type: "Point",
      coordinates: [-122.3321, 47.6062]
    }
  },
  {
    first_name: "Test",
    last_name: "Sitter2",
    city: "Seattle", 
    address: "Pike St, Seattle, WA 98101",
    hourly_rate: 30.00,
    location: {
      type: "Point", 
      coordinates: [-122.3356, 47.6089]
    }
  }
];