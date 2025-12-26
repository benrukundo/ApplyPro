import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isAdmin: true,
        twoFactorEnabled: true,
        twoFactorVerifiedAt: true,
      },
    });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 });
    }

    // Check if 2FA verification is recent (within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const needs2FAVerification = user.twoFactorEnabled && 
      (!user.twoFactorVerifiedAt || user.twoFactorVerifiedAt < twentyFourHoursAgo);

    return NextResponse.json({
      isAdmin: true,
      twoFactorEnabled: user.twoFactorEnabled,
      needs2FAVerification,
    });
  } catch (error) {
    console.error('Admin auth status error:', error);
    return NextResponse.json(
      { error: 'Failed to get auth status' },
      { status: 500 }
    );
  }
}
