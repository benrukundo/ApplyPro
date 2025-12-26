import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { verifyTwoFactorToken, decryptSecret } from '@/lib/twoFactor';

type AdminUser = {
  id: string;
  isAdmin?: boolean | null;
  twoFactorSecret?: string | null;
  twoFactorEnabled?: boolean | null;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { token } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Verification code required' }, { status: 400 });
    }

    const user = (await prisma.user.findUnique({
      where: { email: session.user.email },
    })) as AdminUser | null;

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
    }

    // Verify token before disabling
    const secret = decryptSecret(user.twoFactorSecret);
    const isValid = verifyTwoFactorToken(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        twoFactorVerifiedAt: null,
      } as any,
    });

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
