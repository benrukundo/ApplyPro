// scripts/set-admin.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        isAdmin: true,
        adminCreatedAt: new Date(),
      },
    });

    console.log(`✅ Successfully set ${user.email} as admin`);
  } catch (error) {
    console.error('❌ Error setting admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const adminEmail = process.argv[2];

if (!adminEmail) {
  console.log('Usage: npx ts-node scripts/set-admin.ts your-email@example.com');
  process.exit(1);
}

setAdmin(adminEmail);
