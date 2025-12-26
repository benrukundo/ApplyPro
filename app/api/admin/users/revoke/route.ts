import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const requester = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isAdmin: true, isSuperAdmin: true, twoFactorEnabled: true, twoFactorVerifiedAt: true },
    });

    if (!requester?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!requester.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only Super Admins can revoke admin access' },
        { status: 403 }
      );
    }

    if (requester.twoFactorEnabled) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (!requester.twoFactorVerifiedAt || requester.twoFactorVerifiedAt < twentyFourHoursAgo) {
        return NextResponse.json(
          { error: '2FA verification required for this action', require2FA: true },
          { status: 403 }
        );
      }
    }

    if (userId === requester.id) {
      return NextResponse.json(
        { error: 'You cannot revoke your own admin access' },
        { status: 400 }
      );
    }

    const userToRevoke = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isAdmin: true, isSuperAdmin: true },
    });

    if (!userToRevoke) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!userToRevoke.isAdmin) {
      return NextResponse.json(
        { error: 'User is not an admin' },
        { status: 400 }
      );
    }

    if (userToRevoke.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Super Admin access cannot be revoked. Contact the database administrator.' },
        { status: 403 }
      );
    }

    await prisma.user.update({
      where: { id: userToRevoke.id },
      data: {
        isAdmin: false,
        isSuperAdmin: false,
        adminCreatedAt: null,
        adminCreatedBy: null,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        twoFactorVerifiedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Admin access revoked for ${userToRevoke.name || userToRevoke.email}`,
    });
  } catch (error) {
    console.error('Error revoking admin:', error);
    return NextResponse.json(
      { error: 'Failed to revoke admin access' },
      { status: 500 }
    );
  }
}
