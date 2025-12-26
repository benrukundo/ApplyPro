// scripts/check-admin.ts
// Run with: npx ts-node scripts/check-admin.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAdmins() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, isAdmin: true, adminCreatedAt: true },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    if (users.length === 0) {
      console.log('No users found in the database.');
      return;
    }

    console.log('\nUsers (email — isAdmin):\n');
    users.forEach(u => {
      console.log(`${u.email ?? '[no-email]'} — isAdmin: ${u.isAdmin}`);
    });
  } catch (error) {
    console.error('Error querying users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
