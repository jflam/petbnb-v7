// prisma/seeds/owners.ts

const seattleOwners = [
  {
    email: "jessica.parker@email.com",
    password: "password123", // Will be hashed in seed script
    firstName: "Jessica",
    lastName: "Parker",
    phone: "+1-206-555-1001",
    role: "OWNER"
  },
  {
    email: "tom.bradley@email.com",
    password: "password123", // Will be hashed in seed script
    firstName: "Tom",
    lastName: "Bradley",
    phone: "+1-206-555-1002",
    role: "OWNER"
  },
  {
    email: "lisa.chen@email.com",
    password: "password123", // Will be hashed in seed script
    firstName: "Lisa",
    lastName: "Chen",
    phone: "+1-206-555-1003",
    role: "OWNER"
  },
  {
    email: "david.wilson@email.com",
    password: "password123", // Will be hashed in seed script
    firstName: "David",
    lastName: "Wilson",
    phone: "+1-206-555-1004",
    role: "OWNER"
  },
  {
    email: "sarah.murphy@email.com",
    password: "password123", // Will be hashed in seed script
    firstName: "Sarah",
    lastName: "Murphy",
    phone: "+1-206-555-1005",
    role: "OWNER"
  }
];

const austinOwners = [
  {
    email: "carlos.rivera@email.com",
    password: "password123", // Will be hashed in seed script
    firstName: "Carlos",
    lastName: "Rivera",
    phone: "+1-512-555-2001",
    role: "OWNER"
  },
  {
    email: "amanda.jones@email.com",
    password: "password123", // Will be hashed in seed script
    firstName: "Amanda",
    lastName: "Jones",
    phone: "+1-512-555-2002",
    role: "OWNER"
  },
  {
    email: "jason.kim@email.com",
    password: "password123", // Will be hashed in seed script
    firstName: "Jason",
    lastName: "Kim",
    phone: "+1-512-555-2003",
    role: "OWNER"
  },
  {
    email: "michelle.garcia@email.com",
    password: "password123", // Will be hashed in seed script
    firstName: "Michelle",
    lastName: "Garcia",
    phone: "+1-512-555-2004",
    role: "OWNER"
  },
  {
    email: "ryan.taylor@email.com",
    password: "password123", // Will be hashed in seed script
    firstName: "Ryan",
    lastName: "Taylor",
    phone: "+1-512-555-2005",
    role: "OWNER"
  }
];

// Note: Pet information and search preferences will be stored as separate data
// for testing search scenarios. This can be implemented as test fixtures
// for frontend testing rather than database records in Phase 1.
const ownerPetProfiles = {
  "jessica.parker@email.com": {
    location: "Capitol Hill, Seattle, WA",
    preferredServices: ["boarding", "house-sitting"],
    pets: [
      {
        name: "Luna",
        type: "dog",
        breed: "Golden Retriever",
        age: 3,
        size: "large",
        specialNeeds: ["none"]
      }
    ]
  },
  "tom.bradley@email.com": {
    location: "Fremont, Seattle, WA",
    preferredServices: ["drop-in", "dog-walking"],
    pets: [
      {
        name: "Milo",
        type: "dog",
        breed: "French Bulldog",
        age: 5,
        size: "medium",
        specialNeeds: ["senior-care"]
      },
      {
        name: "Bella",
        type: "cat",
        breed: "Maine Coon",
        age: 7,
        size: "large",
        specialNeeds: ["medication-required"]
      }
    ]
  },
  "lisa.chen@email.com": {
    location: "Ballard, Seattle, WA",
    preferredServices: ["boarding", "day-care"],
    pets: [
      {
        name: "Rocky",
        type: "dog",
        breed: "German Shepherd Mix",
        age: 2,
        size: "large",
        specialNeeds: ["reactive"]
      }
    ]
  },
  "david.wilson@email.com": {
    location: "Queen Anne, Seattle, WA",
    preferredServices: ["house-sitting", "drop-in"],
    pets: [
      {
        name: "Whiskers",
        type: "cat",
        breed: "Siamese",
        age: 1,
        size: "small",
        specialNeeds: ["puppy"]
      },
      {
        name: "Shadow",
        type: "cat",
        breed: "Domestic Shorthair",
        age: 4,
        size: "medium",
        specialNeeds: ["none"]
      }
    ]
  },
  "sarah.murphy@email.com": {
    location: "Green Lake, Seattle, WA",
    preferredServices: ["dog-walking", "day-care"],
    pets: [
      {
        name: "Max",
        type: "dog",
        breed: "Border Collie",
        age: 4,
        size: "medium",
        specialNeeds: ["none"]
      }
    ]
  },
  "carlos.rivera@email.com": {
    location: "South Austin, TX",
    preferredServices: ["boarding", "house-sitting"],
    pets: [
      {
        name: "Coco",
        type: "dog",
        breed: "Chocolate Lab",
        age: 6,
        size: "large",
        specialNeeds: ["senior-care", "medication-required"]
      }
    ]
  },
  "amanda.jones@email.com": {
    location: "East Austin, TX",
    preferredServices: ["drop-in", "house-sitting"],
    pets: [
      {
        name: "Mittens",
        type: "cat",
        breed: "Persian",
        age: 8,
        size: "medium",
        specialNeeds: ["senior-care"]
      },
      {
        name: "Tiger",
        type: "cat",
        breed: "Tabby",
        age: 3,
        size: "medium",
        specialNeeds: ["none"]
      },
      {
        name: "Snowball",
        type: "cat",
        breed: "Ragdoll",
        age: 5,
        size: "large",
        specialNeeds: ["none"]
      }
    ]
  },
  "jason.kim@email.com": {
    location: "North Austin, TX",
    preferredServices: ["dog-walking", "day-care"],
    pets: [
      {
        name: "Zeus",
        type: "dog",
        breed: "Pit Bull Mix",
        age: 1,
        size: "medium",
        specialNeeds: ["puppy"]
      }
    ]
  },
  "michelle.garcia@email.com": {
    location: "West Austin, TX",
    preferredServices: ["boarding", "drop-in"],
    pets: [
      {
        name: "Buddy",
        type: "dog",
        breed: "Beagle",
        age: 9,
        size: "medium",
        specialNeeds: ["senior-care", "medication-required"]
      },
      {
        name: "Princess",
        type: "dog",
        breed: "Yorkie",
        age: 2,
        size: "small",
        specialNeeds: ["none"]
      }
    ]
  },
  "ryan.taylor@email.com": {
    location: "Central Austin, TX",
    preferredServices: ["house-sitting", "day-care"],
    pets: [
      {
        name: "Gizmo",
        type: "other",
        breed: "Rabbit",
        age: 2,
        size: "small",
        specialNeeds: ["none"]
      }
    ]
  }
};

export { seattleOwners, austinOwners, ownerPetProfiles };