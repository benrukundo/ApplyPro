import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import {
  verifyTwoFactorToken,
  decryptSecret,
  verifyBackupCode,
} from '@/lib/twoFactor';
import { checkRateLimit, resetRateLimit } from '@/lib/rateLimit';

type AdminUser = {
  id: string;
  isAdmin?: boolean | null;
  twoFactorSecret?: string | null;
  twoFactorEnabled?: boolean | null;
  twoFactorBackupCodes?: string | null;
  twoFactorVerifiedAt?: Date | null;
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { token, isBackupCode } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const user = (await prisma.user.findUnique({
      where: { email: session.user.email },
    })) as AdminUser | null;

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    const rateLimitKey = `2fa-auth:${session.user.email}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many failed attempts. Please try again later.',
          resetIn: Math.ceil(rateLimit.resetIn / 1000 / 60),
        },
        { status: 429 }
      );
    }

    let isValid = false;

    if (isBackupCode) {
      // Verify backup code
      const storedHashes: string[] = user.twoFactorBackupCodes 
        ? JSON.parse(user.twoFactorBackupCodes)
        : [];
      
      const result = verifyBackupCode(token, storedHashes);
      isValid = result.valid;

      if (isValid) {
        // Update remaining backup codes
        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorBackupCodes: JSON.stringify(result.remainingHashes),
            twoFactorVerifiedAt: new Date(),
          } as any,
        });
      }
    } else {
      // Verify TOTP token
      const secret = decryptSecret(user.twoFactorSecret);
      isValid = verifyTwoFactorToken(token, secret);

      if (isValid) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            twoFactorVerifiedAt: new Date(),
          } as any,
        });
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid code. Please try again.' },
        { status: 400 }
      );
    }

    resetRateLimit(rateLimitKey);

    return NextResponse.json({
      success: true,
      message: '2FA verification successful',
    });
  } catch (error) {
    console.error('2FA authenticate error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}
