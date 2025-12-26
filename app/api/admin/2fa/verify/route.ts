import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import {
  verifyTwoFactorToken,
  decryptSecret,
  generateBackupCodes,
  hashBackupCode,
} from '@/lib/twoFactor';

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

    if (!token || token.length !== 6) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const user = (await prisma.user.findUnique({
      where: { email: session.user.email },
    })) as AdminUser | null;

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Please set up 2FA first' },
        { status: 400 }
      );
    }

    // Decrypt and verify
    const secret = decryptSecret(user.twoFactorSecret);
    const isValid = verifyTwoFactorToken(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: JSON.stringify(hashedBackupCodes),
        twoFactorVerifiedAt: new Date(),
      } as any,
    });

    return NextResponse.json({
      success: true,
      backupCodes, // Return plain backup codes (show once only!)
      message: '2FA has been enabled successfully. Save your backup codes!',
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
