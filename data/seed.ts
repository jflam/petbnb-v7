// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { seattleSitters, austinSitters } from './seeds/sitters';
import { seattleOwners, austinOwners } from './seeds/owners';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.sitterProfile.deleteMany();
  await prisma.user.deleteMany();

  // Seed Seattle sitters
  console.log('👨‍💼 Seeding Seattle sitters...');
  for (const sitterData of seattleSitters) {
    const hashedPassword = await hashPassword(sitterData.user.password);
    
    await prisma.user.create({
      data: {
        email: sitterData.user.email,
        password: hashedPassword,
        firstName: sitterData.user.firstName,
        lastName: sitterData.user.lastName,
        phone: sitterData.user.phone,
        role: sitterData.user.role,
        sitterProfile: {
          create: {
            bio: sitterData.profile.bio,
            experience: sitterData.profile.experience,
            hourlyRate: sitterData.profile.hourlyRate,
            serviceRadius: sitterData.profile.serviceRadius,
            address: sitterData.profile.address,
            city: sitterData.profile.city,
            state: sitterData.profile.state,
            zipCode: sitterData.profile.zipCode,
            latitude: sitterData.profile.latitude,
            longitude: sitterData.profile.longitude,
            acceptsDogs: sitterData.profile.acceptsDogs,
            acceptsCats: sitterData.profile.acceptsCats,
            acceptsOtherPets: sitterData.profile.acceptsOtherPets,
            hasFencedYard: sitterData.profile.hasFencedYard,
            hasOtherPets: sitterData.profile.hasOtherPets,
            isSmokeFree: sitterData.profile.isSmokeFree,
            isActive: true
          }
        }
      }
    });
  }

  // Seed Austin sitters
  console.log('👨‍💼 Seeding Austin sitters...');
  for (const sitterData of austinSitters) {
    const hashedPassword = await hashPassword(sitterData.user.password);
    
    await prisma.user.create({
      data: {
        email: sitterData.user.email,
        password: hashedPassword,
        firstName: sitterData.user.firstName,
        lastName: sitterData.user.lastName,
        phone: sitterData.user.phone,
        role: sitterData.user.role,
        sitterProfile: {
          create: {
            bio: sitterData.profile.bio,
            experience: sitterData.profile.experience,
            hourlyRate: sitterData.profile.hourlyRate,
            serviceRadius: sitterData.profile.serviceRadius,
            address: sitterData.profile.address,
            city: sitterData.profile.city,
            state: sitterData.profile.state,
            zipCode: sitterData.profile.zipCode,
            latitude: sitterData.profile.latitude,
            longitude: sitterData.profile.longitude,
            acceptsDogs: sitterData.profile.acceptsDogs,
            acceptsCats: sitterData.profile.acceptsCats,
            acceptsOtherPets: sitterData.profile.acceptsOtherPets,
            hasFencedYard: sitterData.profile.hasFencedYard,
            hasOtherPets: sitterData.profile.hasOtherPets,
            isSmokeFree: sitterData.profile.isSmokeFree,
            isActive: true
          }
        }
      }
    });
  }

  // Seed pet owners
  console.log('👥 Seeding pet owners...');
  const allOwners = [...seattleOwners, ...austinOwners];
  for (const ownerData of allOwners) {
    const hashedPassword = await hashPassword(ownerData.password);
    
    await prisma.user.create({
      data: {
        email: ownerData.email,
        password: hashedPassword,
        firstName: ownerData.firstName,
        lastName: ownerData.lastName,
        phone: ownerData.phone,
        role: ownerData.role
      }
    });
  }

  console.log('✅ Database seeding completed!');
  console.log(`📊 Created ${seattleSitters.length + austinSitters.length} sitters`);
  console.log(`📊 Created ${allOwners.length} pet owners`);
  console.log('🔑 All users have password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });