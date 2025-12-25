import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'Query must be at least 2 characters',
      });
    }

    const where: any = {
      isActive: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { skills: { hasSome: [query] } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
      ],
    };

    if (category) {
      where.category = { slug: category };
    }
    if (level && ['ENTRY', 'MID', 'SENIOR'].includes(level)) {
      where.experienceLevel = level;
    }

    const total = await prisma.resumeExample.count({ where });

    const results = await prisma.resumeExample.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: [{ viewCount: 'desc' }, { title: 'asc' }],
      take: limit,
      skip: offset,
    });

    const formattedResults = results.map((example) => ({
      id: example.id,
      title: example.title,
      slug: example.slug,
      summary: example.summary,
      experienceLevel: example.experienceLevel,
      skills: example.skills?.slice(0, 5) || [],
      viewCount: example.viewCount,
      salaryRange: example.salaryRange,
      category: {
        name: example.category?.name || '',
        slug: example.category?.slug || '',
        icon: example.category?.icon || '',
        color: example.category?.color || '',
      },
      url: `/resume-examples/${example.category?.slug || 'all'}/${example.slug}`,
    }));

    return NextResponse.json({
      results: formattedResults,
      total,
      query,
      hasMore: offset + results.length < total,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [], total: 0 },
      { status: 500 }
    );
  }
}
