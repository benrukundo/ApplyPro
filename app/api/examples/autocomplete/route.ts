// app/api/examples/autocomplete/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const examples = await prisma.resumeExample.findMany({
      where: {
        isActive: true,
        title: { contains: query, mode: 'insensitive' },
      },
      take: limit,
      orderBy: [{ viewCount: 'desc' }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        experienceLevel: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    const formatted = examples.map((ex) => ({
      id: ex.id,
      title: ex.title,
      slug: ex.slug,
      categorySlug: ex.category.slug,
      categoryName: ex.category.name,
      experienceLevel: ex.experienceLevel,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    return NextResponse.json(
      { success: false, error: 'Autocomplete failed' },
      { status: 500 }
    );
  }
}
