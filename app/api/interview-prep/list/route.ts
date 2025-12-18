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

    const preps = await prisma.interviewPrep.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        jobTitle: true,
        company: true,
        interviewType: true,
        createdAt: true,
        _count: {
          select: { mockSessions: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: preps,
    });
  } catch (error) {
    console.error('List interview preps error:', error);
    return NextResponse.json(
      { error: 'Failed to list interview preparations' },
      { status: 500 }
    );
  }
}
