import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's generation history
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const [generations, total] = await Promise.all([
      prisma.generatedResume.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
        select: {
          id: true,
          jobTitle: true,
          company: true,
          matchScore: true,
          createdAt: true,
          fullResume: true,
          atsResume: true,
          coverLetter: true,
        },
      }),
      prisma.generatedResume.count({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      generations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching generations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generation history' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific generation
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Generation ID required' }, { status: 400 });
    }

    // Verify ownership
    const generation = await prisma.generatedResume.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }

    await prisma.generatedResume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting generation:', error);
    return NextResponse.json(
      { error: 'Failed to delete generation' },
      { status: 500 }
    );
  }
}
