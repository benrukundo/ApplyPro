// app/api/examples/[categorySlug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categorySlug: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { categorySlug } = await params;
    const { searchParams } = new URL(request.url);
    const experienceLevel = searchParams.get('level'); // ENTRY, MID, SENIOR
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build filter
    const exampleFilter: any = { isActive: true };
    if (experienceLevel) {
      exampleFilter.experienceLevel = experienceLevel;
    }

    const category = await prisma.jobCategory.findUnique({
      where: { slug: categorySlug },
      include: {
        examples: {
          where: exampleFilter,
          skip,
          take: limit,
          orderBy: [{ viewCount: 'desc' }, { title: 'asc' }],
          select: {
            id: true,
            title: true,
            slug: true,
            experienceLevel: true,
            summary: true,
            skills: true,
            salaryRange: true,
            jobOutlook: true,
            viewCount: true,
          },
        },
        _count: {
          select: { examples: exampleFilter },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get experience level counts for filtering
    const levelCounts = await prisma.resumeExample.groupBy({
      by: ['experienceLevel'],
      where: {
        categoryId: category.id,
        isActive: true,
      },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon,
          color: category.color,
          metaTitle: category.metaTitle,
          metaDescription: category.metaDescription,
        },
        examples: category.examples,
        pagination: {
          page,
          limit,
          total: category._count.examples,
          totalPages: Math.ceil(category._count.examples / limit),
        },
        filters: {
          experienceLevels: levelCounts.map((l) => ({
            level: l.experienceLevel,
            count: l._count,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}
