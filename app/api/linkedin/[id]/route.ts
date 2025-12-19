import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const optimization = await prisma.linkedInOptimization.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!optimization) {
      return NextResponse.json({ error: 'Optimization not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: optimization,
    });
  } catch (error) {
    console.error('Get optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve optimization' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.linkedInOptimization.deleteMany({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to delete optimization' },
      { status: 500 }
    );
  }
}
