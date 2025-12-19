import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const optimizations = await prisma.linkedInOptimization.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        targetRole: true,
        currentHeadline: true,
        consistencyScore: true,
        keywordsMatch: true,
        experienceAlign: true,
        skillsCoverage: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: optimizations,
    });
  } catch (error) {
    console.error('List optimizations error:', error);
    return NextResponse.json(
      { error: 'Failed to list optimizations' },
      { status: 500 }
    );
  }
}
