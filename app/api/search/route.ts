// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Search categories
    const categories = await prisma.jobCategory.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
      },
    });

    // Search examples
    const examples = await prisma.resumeExample.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
          { skills: { hasSome: [query] } },
        ],
      },
      take: limit,
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        experienceLevel: true,
        summary: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    // Combine and format results
    const results = [
      ...categories.map((cat) => ({
        type: 'category' as const,
        id: cat.id,
        title: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
      })),
      ...examples.map((ex) => ({
        type: 'example' as const,
        id: ex.id,
        title: ex.title,
        slug: ex.slug,
        categorySlug: ex.category.slug,
        categoryName: ex.category.name,
        description: ex.summary.substring(0, 100) + '...',
        experienceLevel: ex.experienceLevel,
      })),
    ];

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
