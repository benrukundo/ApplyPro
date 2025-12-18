import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const interviewPrep = await prisma.interviewPrep.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        mockSessions: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!interviewPrep) {
      return NextResponse.json({ error: 'Interview prep not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: interviewPrep,
    });
  } catch (error) {
    console.error('Get interview prep error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve interview preparation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.interviewPrep.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete interview prep error:', error);
    return NextResponse.json(
      { error: 'Failed to delete interview preparation' },
      { status: 500 }
    );
  }
}
