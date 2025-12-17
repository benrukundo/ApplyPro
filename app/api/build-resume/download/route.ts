import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// This endpoint checks if user can download
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const builderId = searchParams.get('id');

    if (!builderId) {
      return NextResponse.json({ error: 'Missing builder ID' }, { status: 400 });
    }

    // Check subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
    });

    if (!subscription) {
      return NextResponse.json(
        {
          error: 'Active subscription required to download',
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    // Get the builder resume
    const builderResume = await prisma.builderResume.findFirst({
      where: {
        id: builderId,
        userId: session.user.id,
      },
    });

    if (!builderResume || !builderResume.generatedResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({
      canDownload: true,
      resume: builderResume.generatedResume,
    });
  } catch (error) {
    console.error('Error checking download permission:', error);
    return NextResponse.json(
      { error: 'Failed to check download permission' },
      { status: 500 }
    );
  }
}
