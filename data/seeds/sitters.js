// prisma/seeds/sitters.ts

const seattleSitters = [
  {
    user: {
      email: "sarah.johnson@email.com",
      password: "password123", // Will be hashed in seed script
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "+1-206-555-0101",
      role: "SITTER"
    },
    profile: {
      bio: "I've been caring for pets for over 8 years and absolutely love spending time with furry friends. My own dog, Max, is very social and loves meeting new playmates. I work from home which allows me to provide constant attention and care.",
      experience: "Former veterinary assistant with 3 years clinic experience. Certified in pet first aid and CPR. Experience with senior dogs, puppies, and special needs pets including medication administration.",
      hourlyRate: 35.00,
      serviceRadius: 12,
      address: "2045 15th Ave W, Seattle, WA 98119",
      city: "Seattle",
      state: "WA",
      zipCode: "98119",
      latitude: 47.6358,
      longitude: -122.3745,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: false,
      hasFencedYard: true,
      hasOtherPets: true,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "mike.chen@email.com",
      password: "password123",
      firstName: "Mike",
      lastName: "Chen",
      phone: "+1-206-555-0102",
      role: "SITTER"
    },
    profile: {
      bio: "Professional dog walker and pet sitter serving the Capitol Hill area. I believe every pet deserves individual attention and care. I send photo updates throughout the day so you know your pet is happy and safe.",
      experience: "5 years professional pet sitting experience. Insured and bonded. Experience with reactive dogs, separation anxiety, and crate training. Happy to maintain feeding schedules and medication routines.",
      hourlyRate: 28.00,
      serviceRadius: 8,
      address: "1234 E Pine St, Seattle, WA 98122",
      city: "Seattle",
      state: "WA",
      zipCode: "98122",
      latitude: 47.6149,
      longitude: -122.3194,
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
      email: "jennifer.martinez@email.com",
      password: "password123",
      firstName: "Jennifer",
      lastName: "Martinez",
      phone: "+1-206-555-0103",
      role: "SITTER"
    },
    profile: {
      bio: "Retired teacher who now dedicates my time to caring for pets. I have a quiet home perfect for senior pets or anxious animals. I provide a calm, structured environment with lots of love and patience.",
      experience: "Lifelong pet owner with experience caring for cats, dogs, and small animals. Comfortable with senior pet care, medication administration, and special dietary needs. Pet loss grief counselor volunteer.",
      hourlyRate: 25.00,
      serviceRadius: 15,
      address: "8765 Greenwood Ave N, Seattle, WA 98103",
      city: "Seattle",
      state: "WA",
      zipCode: "98103",
      latitude: 47.6934,
      longitude: -122.3550,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: true,
      hasFencedYard: false,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "david.thompson@email.com",
      password: "password123",
      firstName: "David",
      lastName: "Thompson",
      phone: "+1-206-555-0104",
      role: "SITTER"
    },
    profile: {
      bio: "Active outdoorsman who loves taking dogs on hiking adventures and long walks around Green Lake. I have a large backyard perfect for energetic dogs who need lots of exercise and stimulation.",
      experience: "Adventure dog specialist with experience in hiking, camping, and outdoor activities with pets. Trained in wilderness first aid. Great with high-energy breeds and working dogs.",
      hourlyRate: 40.00,
      serviceRadius: 20,
      address: "5432 Phinney Ave N, Seattle, WA 98103",
      city: "Seattle",
      state: "WA",
      zipCode: "98103",
      latitude: 47.6739,
      longitude: -122.3506,
      acceptsDogs: true,
      acceptsCats: false,
      acceptsOtherPets: false,
      hasFencedYard: true,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "lisa.wang@email.com",
      password: "password123",
      firstName: "Lisa",
      lastName: "Wang",
      phone: "+1-206-555-0105",
      role: "SITTER"
    },
    profile: {
      bio: "Cat specialist with a particular love for rescue cats and those with behavioral challenges. My home is set up specifically for cats with climbing trees, hiding spots, and separate spaces for multiple cats.",
      experience: "Volunteer at local cat rescue for 6 years. Experienced with feral cats, medical care, and behavioral rehabilitation. Foster parent for special needs cats. TNR volunteer.",
      hourlyRate: 30.00,
      serviceRadius: 10,
      address: "2211 NW 65th St, Seattle, WA 98117",
      city: "Seattle",
      state: "WA",
      zipCode: "98117",
      latitude: 47.6764,
      longitude: -122.3850,
      acceptsDogs: false,
      acceptsCats: true,
      acceptsOtherPets: true,
      hasFencedYard: false,
      hasOtherPets: true,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "robert.davis@email.com",
      password: "password123",
      firstName: "Robert",
      lastName: "Davis",
      phone: "+1-206-555-0106",
      role: "SITTER"
    },
    profile: {
      bio: "Freelance graphic designer working from home with flexible schedule. I enjoy the company of pets while I work and can provide constant supervision and interaction throughout the day.",
      experience: "3 years pet sitting experience with dogs of all sizes. Comfortable with puppies, house training, and basic obedience. Experience with separation anxiety and crate training.",
      hourlyRate: 32.00,
      serviceRadius: 7,
      address: "4567 California Ave SW, Seattle, WA 98116",
      city: "Seattle",
      state: "WA",
      zipCode: "98116",
      latitude: 47.5649,
      longitude: -122.3860,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: false,
      hasFencedYard: false,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "amanda.wilson@email.com",
      password: "password123",
      firstName: "Amanda",
      lastName: "Wilson",
      phone: "+1-206-555-0107",
      role: "SITTER"
    },
    profile: {
      bio: "Stay-at-home mom with two kids who absolutely love animals. Our home is bustling with activity and perfect for social pets who enjoy being part of a family environment.",
      experience: "Family has always had pets - currently have 2 dogs and a cat. Kids are well-trained in pet care and safety. Experience with multiple pets, feeding schedules, and medication.",
      hourlyRate: 26.00,
      serviceRadius: 12,
      address: "7890 35th Ave NE, Seattle, WA 98115",
      city: "Seattle",
      state: "WA",
      zipCode: "98115",
      latitude: 47.6816,
      longitude: -122.2953,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: true,
      hasFencedYard: true,
      hasOtherPets: true,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "carlos.rodriguez@email.com",
      password: "password123",
      firstName: "Carlos",
      lastName: "Rodriguez",
      phone: "+1-206-555-0108",
      role: "SITTER"
    },
    profile: {
      bio: "Bilingual pet sitter (English/Spanish) with experience caring for pets with special needs. I'm patient, reliable, and treat every pet like they're my own family member.",
      experience: "Former animal shelter volunteer with experience in animal behavior and basic medical care. Comfortable with senior pets, diabetic pets, and medication administration.",
      hourlyRate: 29.00,
      serviceRadius: 14,
      address: "1357 S Jackson St, Seattle, WA 98144",
      city: "Seattle",
      state: "WA",
      zipCode: "98144",
      latitude: 47.5985,
      longitude: -122.3094,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: false,
      hasFencedYard: false,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "stephanie.brown@email.com",
      password: "password123",
      firstName: "Stephanie",
      lastName: "Brown",
      phone: "+1-206-555-0109",
      role: "SITTER"
    },
    profile: {
      bio: "Veterinary student with hands-on experience in animal care and behavior. I'm detail-oriented, reliable, and passionate about ensuring pets feel safe and loved while their families are away.",
      experience: "Currently in veterinary school with clinical experience. Trained in animal first aid, medication administration, and recognizing signs of illness. Research experience in animal behavior.",
      hourlyRate: 38.00,
      serviceRadius: 16,
      address: "9876 Roosevelt Way NE, Seattle, WA 98115",
      city: "Seattle",
      state: "WA",
      zipCode: "98115",
      latitude: 47.6977,
      longitude: -122.3150,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: true,
      hasFencedYard: false,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "kevin.lee@email.com",
      password: "password123",
      firstName: "Kevin",
      lastName: "Lee",
      phone: "+1-206-555-0110",
      role: "SITTER"
    },
    profile: {
      bio: "Professional dog trainer specializing in positive reinforcement methods. I can provide basic training reinforcement during pet sitting visits and help maintain your pet's routine and good habits.",
      experience: "Certified professional dog trainer (CPDT-KA) with 4 years experience. Specializes in puppy training, basic obedience, and behavioral modification. Experience with reactive and fearful dogs.",
      hourlyRate: 45.00,
      serviceRadius: 18,
      address: "2468 NW 80th St, Seattle, WA 98117",
      city: "Seattle",
      state: "WA",
      zipCode: "98117",
      latitude: 47.6886,
      longitude: -122.3742,
      acceptsDogs: true,
      acceptsCats: false,
      acceptsOtherPets: false,
      hasFencedYard: true,
      hasOtherPets: true,
      isSmokeFree: true
    }
  }
];

const austinSitters = [
  {
    user: {
      email: "maria.gonzalez@email.com",
      password: "password123",
      firstName: "Maria",
      lastName: "Gonzalez",
      phone: "+1-512-555-0201",
      role: "SITTER"
    },
    profile: {
      bio: "Bilingual pet sitter (English/Spanish) who treats every pet like family. I have a large backyard perfect for dogs to play and a quiet indoor space for cats. I work from home and can provide constant companionship.",
      experience: "8 years professional pet sitting experience. Former veterinary technician with medical training. Experience with senior pets, medication administration, and post-surgery care.",
      hourlyRate: 33.00,
      serviceRadius: 15,
      address: "1234 South Lamar Blvd, Austin, TX 78704",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      latitude: 30.2540,
      longitude: -97.7648,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: true,
      hasFencedYard: true,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "james.miller@email.com",
      password: "password123",
      firstName: "James",
      lastName: "Miller",
      phone: "+1-512-555-0202",
      role: "SITTER"
    },
    profile: {
      bio: "Musician with a flexible schedule who loves the company of pets while practicing and composing. My home studio is pet-friendly and I enjoy having furry companions during my creative process.",
      experience: "5 years pet sitting experience with focus on anxious and noise-sensitive pets. Experience with sound desensitization and creating calm environments. Comfortable with cats and small dogs.",
      hourlyRate: 27.00,
      serviceRadius: 10,
      address: "5678 E 6th St, Austin, TX 78702",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      latitude: 30.2669,
      longitude: -97.7234,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: false,
      hasFencedYard: false,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "rachel.taylor@email.com",
      password: "password123",
      firstName: "Rachel",
      lastName: "Taylor",
      phone: "+1-512-555-0203",
      role: "SITTER"
    },
    profile: {
      bio: "Outdoor enthusiast who loves taking dogs on adventures around Austin's many trails and parks. I'm active, reliable, and believe pets need mental stimulation and exercise to be truly happy.",
      experience: "Adventure pet specialist with experience hiking, camping, and outdoor activities. Trained in pet first aid and wilderness safety. Great with high-energy breeds and working dogs.",
      hourlyRate: 42.00,
      serviceRadius: 20,
      address: "9012 N Lamar Blvd, Austin, TX 78753",
      city: "Austin",
      state: "TX",
      zipCode: "78753",
      latitude: 30.3607,
      longitude: -97.6889,
      acceptsDogs: true,
      acceptsCats: false,
      acceptsOtherPets: false,
      hasFencedYard: true,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "daniel.anderson@email.com",
      password: "password123",
      firstName: "Daniel",
      lastName: "Anderson",
      phone: "+1-512-555-0204",
      role: "SITTER"
    },
    profile: {
      bio: "Tech professional working remotely with a passion for animal rescue. I foster dogs regularly and have experience with behavioral rehabilitation and socialization of rescued animals.",
      experience: "Volunteer with Austin animal rescue organizations for 6 years. Foster coordinator with experience in animal behavior, medical care, and rehabilitation. Comfortable with fearful and reactive pets.",
      hourlyRate: 36.00,
      serviceRadius: 12,
      address: "3456 Guadalupe St, Austin, TX 78705",
      city: "Austin",
      state: "TX",
      zipCode: "78705",
      latitude: 30.2968,
      longitude: -97.7420,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: false,
      hasFencedYard: false,
      hasOtherPets: true,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "sophie.williams@email.com",
      password: "password123",
      firstName: "Sophie",
      lastName: "Williams",
      phone: "+1-512-555-0205",
      role: "SITTER"
    },
    profile: {
      bio: "Cat specialist with a deep understanding of feline behavior and needs. My home is designed for cats with multiple levels, hiding spots, and enrichment activities. I specialize in shy and senior cats.",
      experience: "Feline behavior consultant with 7 years experience. Volunteer with cat rescue organizations. Experienced with medical care, behavioral issues, and multi-cat households.",
      hourlyRate: 31.00,
      serviceRadius: 8,
      address: "7890 W 35th St, Austin, TX 78703",
      city: "Austin",
      state: "TX",
      zipCode: "78703",
      latitude: 30.3079,
      longitude: -97.7584,
      acceptsDogs: false,
      acceptsCats: true,
      acceptsOtherPets: true,
      hasFencedYard: false,
      hasOtherPets: true,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "michael.johnson@email.com",
      password: "password123",
      firstName: "Michael",
      lastName: "Johnson",
      phone: "+1-512-555-0206",
      role: "SITTER"
    },
    profile: {
      bio: "Retired firefighter with a heart for helping animals. I have experience with emergency situations and can handle pets with medical needs or behavioral challenges. Safety and care are my top priorities.",
      experience: "Former firefighter/EMT with animal rescue training. Experienced in emergency care, medication administration, and handling stressed animals. Volunteer with animal disaster relief.",
      hourlyRate: 39.00,
      serviceRadius: 25,
      address: "2345 E Cesar Chavez St, Austin, TX 78702",
      city: "Austin",
      state: "TX",
      zipCode: "78702",
      latitude: 30.2591,
      longitude: -97.7189,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: true,
      hasFencedYard: true,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "emily.davis@email.com",
      password: "password123",
      firstName: "Emily",
      lastName: "Davis",
      phone: "+1-512-555-0207",
      role: "SITTER"
    },
    profile: {
      bio: "Graduate student in animal science with a flexible schedule perfect for pet sitting. I'm studying animal behavior and love applying my knowledge to provide enriching experiences for pets.",
      experience: "Graduate research in animal behavior with hands-on experience in enrichment activities. Trained in positive reinforcement training methods. Experience with exotic pets and small animals.",
      hourlyRate: 28.00,
      serviceRadius: 14,
      address: "6789 Airport Blvd, Austin, TX 78752",
      city: "Austin",
      state: "TX",
      zipCode: "78752",
      latitude: 30.2955,
      longitude: -97.7006,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: true,
      hasFencedYard: false,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "alex.martinez@email.com",
      password: "password123",
      firstName: "Alex",
      lastName: "Martinez",
      phone: "+1-512-555-0208",
      role: "SITTER"
    },
    profile: {
      bio: "Professional photographer who specializes in pet photography. I love capturing the personality of every animal I care for and can provide beautiful photos during pet sitting visits.",
      experience: "Professional pet photographer with 4 years experience. Skilled at reading animal body language and creating comfortable environments. Experience with all pet types and sizes.",
      hourlyRate: 34.00,
      serviceRadius: 16,
      address: "4567 S 1st St, Austin, TX 78704",
      city: "Austin",
      state: "TX",
      zipCode: "78704",
      latitude: 30.2409,
      longitude: -97.7677,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: true,
      hasFencedYard: false,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "natalie.white@email.com",
      password: "password123",
      firstName: "Natalie",
      lastName: "White",
      phone: "+1-512-555-0209",
      role: "SITTER"
    },
    profile: {
      bio: "Yoga instructor and wellness coach who brings a calm, mindful approach to pet care. I believe in creating peaceful environments where pets can feel secure and relaxed.",
      experience: "Certified in animal Reiki and massage therapy. Experience with anxious pets, senior animals, and those recovering from illness or surgery. Focus on holistic pet care approaches.",
      hourlyRate: 37.00,
      serviceRadius: 11,
      address: "8901 Burnet Rd, Austin, TX 78757",
      city: "Austin",
      state: "TX",
      zipCode: "78757",
      latitude: 30.3378,
      longitude: -97.7261,
      acceptsDogs: true,
      acceptsCats: true,
      acceptsOtherPets: true,
      hasFencedYard: false,
      hasOtherPets: false,
      isSmokeFree: true
    }
  },
  {
    user: {
      email: "chris.thompson@email.com",
      password: "password123",
      firstName: "Chris",
      lastName: "Thompson",
      phone: "+1-512-555-0210",
      role: "SITTER"
    },
    profile: {
      bio: "Small business owner with a home office who enjoys the company of pets while working. I can provide constant supervision and interaction, making it perfect for pets who need extra attention.",
      experience: "3 years professional pet sitting with focus on puppies and senior dogs. Experience with house training, medication schedules, and mobility assistance for older pets.",
      hourlyRate: 30.00,
      serviceRadius: 13,
      address: "1357 W 6th St, Austin, TX 78703",
      city: "Austin",
      state: "TX",
      zipCode: "78703",
      latitude: 30.2698,
      longitude: -97.7569,
      acceptsDogs: true,
      acceptsCats: false,
      acceptsOtherPets: false,
      hasFencedYard: true,
      hasOtherPets: false,
      isSmokeFree: true
    }
  }
];

export { seattleSitters, austinSitters };