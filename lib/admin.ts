import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// Check if the current user is an admin (for server components)
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  });

  return user?.isAdmin === true;
}

// Get admin user data (for server components)
export async function getAdminUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isAdmin: true,
      twoFactorEnabled: true,
      twoFactorVerifiedAt: true,
      adminCreatedAt: true,
    },
  });

  if (!user?.isAdmin) {
    return null;
  }

  return user;
}

// Require admin access - redirects if not admin (for server components)
export async function requireAdmin() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect('/admin/login');
  }

  return admin;
}

// Check if 2FA is required and verified (for future use)
export async function requireAdmin2FA() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect('/admin/login');
  }

  // If 2FA is enabled, check if it's been verified recently (within 24 hours)
  if (admin.twoFactorEnabled) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (!admin.twoFactorVerifiedAt || admin.twoFactorVerifiedAt < twentyFourHoursAgo) {
      redirect('/admin/verify-2fa');
    }
  }

  return admin;
}
