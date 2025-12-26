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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    }) as any;

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
    }

    // Verify current token
    const secret = decryptSecret(user.twoFactorSecret);
    const isValid = verifyTwoFactorToken(token, secret);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes(10);
    const hashedBackupCodes = backupCodes.map(hashBackupCode);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorBackupCodes: JSON.stringify(hashedBackupCodes),
      } as any,
    });

    return NextResponse.json({
      success: true,
      backupCodes,
      message: 'New backup codes generated',
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate backup codes' },
      { status: 500 }
    );
  }
}
