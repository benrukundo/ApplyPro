import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET - Get single example
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const example = await prisma.resumeExample.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!example) {
      return NextResponse.json({ error: 'Example not found' }, { status: 404 });
    }

    return NextResponse.json({ example });
  } catch (error) {
    console.error('Error fetching example:', error);
    return NextResponse.json(
      { error: 'Failed to fetch example' },
      { status: 500 }
    );
  }
}

// PUT - Update example
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const body = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if example exists
    const existingExample = await prisma.resumeExample.findUnique({
      where: { id },
    });

    if (!existingExample) {
      return NextResponse.json({ error: 'Example not found' }, { status: 404 });
    }

    const {
      title,
      slug,
      categoryId,
      experienceLevel,
      summary,
      bulletPoints,
      skills,
      metaTitle,
      metaDescription,
      salaryRange,
      jobOutlook,
      writingTips,
      commonMistakes,
      isActive,
    } = body;

    // If slug or category changed, check for duplicates
    if (slug && categoryId && (slug !== existingExample.slug || categoryId !== existingExample.categoryId)) {
      const duplicate = await prisma.resumeExample.findFirst({
        where: {
          categoryId,
          slug: slug.toLowerCase().replace(/\s+/g, '-'),
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'An example with this slug already exists in this category' },
          { status: 400 }
        );
      }
    }

    // Update example
    const example = await prisma.resumeExample.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug: slug.toLowerCase().replace(/\s+/g, '-') }),
        ...(categoryId && { categoryId }),
        ...(experienceLevel && { experienceLevel }),
        ...(summary && { summary }),
        ...(bulletPoints !== undefined && { bulletPoints }),
        ...(skills !== undefined && { skills }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(salaryRange !== undefined && { salaryRange }),
        ...(jobOutlook !== undefined && { jobOutlook }),
        ...(writingTips !== undefined && { writingTips }),
        ...(commonMistakes !== undefined && { commonMistakes }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      example,
      message: `Resume example "${example.title}" updated successfully`,
    });
  } catch (error) {
    console.error('Error updating example:', error);
    return NextResponse.json(
      { error: 'Failed to update example' },
      { status: 500 }
    );
  }
}

// DELETE - Delete example
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, isSuperAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Only Super Admins can permanently delete
    // Regular admins can only deactivate (handled in UI)
    if (!user.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Only Super Admins can permanently delete examples. Use deactivate instead.' },
        { status: 403 }
      );
    }

    const example = await prisma.resumeExample.findUnique({
      where: { id },
      select: { title: true },
    });

    if (!example) {
      return NextResponse.json({ error: 'Example not found' }, { status: 404 });
    }

    await prisma.resumeExample.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Resume example "${example.title}" deleted permanently`,
    });
  } catch (error) {
    console.error('Error deleting example:', error);
    return NextResponse.json(
      { error: 'Failed to delete example' },
      { status: 500 }
    );
  }
}
