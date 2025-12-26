import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { email } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const requester = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isAdmin: true, twoFactorEnabled: true, twoFactorVerifiedAt: true },
    });

    if (!requester?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
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

    const normalizedEmail = email.toLowerCase().trim();
    const userToPromote = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, isAdmin: true },
    });

    if (!userToPromote) {
      return NextResponse.json(
        { error: 'User not found. They must have an account first.' },
        { status: 404 }
      );
    }

    if (userToPromote.isAdmin) {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userToPromote.id },
      data: {
        isAdmin: true,
        adminCreatedAt: new Date(),
        adminCreatedBy: requester.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${userToPromote.name || userToPromote.email} has been promoted to admin`,
      user: {
        id: userToPromote.id,
        name: userToPromote.name,
        email: userToPromote.email,
      },
    });
  } catch (error) {
    console.error('Error promoting user:', error);
    return NextResponse.json(
      { error: 'Failed to promote user' },
      { status: 500 }
    );
  }
}
