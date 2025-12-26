import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import {
  generateTwoFactorSecret,
  generateQRCode,
  encryptSecret,
} from '@/lib/twoFactor';

type AdminUser = {
  id: string;
  email: string | null;
  isAdmin?: boolean | null;
  twoFactorEnabled?: boolean | null;
  twoFactorSecret?: string | null;
};

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = (await prisma.user.findUnique({
      where: { email: session.user.email },
    })) as AdminUser | null;

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled. Disable it first to set up again.' },
        { status: 400 }
      );
    }

    // Generate new secret
    const { secret, otpauthUrl } = generateTwoFactorSecret(user.email!);

    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl);

    // Store encrypted secret temporarily (not enabled yet)
    const encryptedSecret = encryptSecret(secret);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: encryptedSecret,
        // Don't enable yet - wait for verification
      } as any,
    });

    return NextResponse.json({
      success: true,
      qrCode,
      secret, // Also return secret for manual entry
      message: 'Scan the QR code with your authenticator app, then verify with a code.',
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to set up 2FA' },
      { status: 500 }
    );
  }
}
