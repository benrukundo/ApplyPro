// app/api/examples/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeExamples = searchParams.get('includeExamples') === 'true';
    const limit = parseInt(searchParams.get('limit') || '5');

    const categories = await prisma.jobCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { examples: true },
        },
        ...(includeExamples && {
          examples: {
            where: { isActive: true },
            take: limit,
            orderBy: { viewCount: 'desc' },
            select: {
              id: true,
              title: true,
              slug: true,
              experienceLevel: true,
              summary: true,
            },
          },
        }),
      },
    });

    // Transform data for frontend
    const transformedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      exampleCount: category._count.examples,
      ...(includeExamples && { examples: category.examples }),
    }));

    return NextResponse.json({
      success: true,
      data: transformedCategories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
