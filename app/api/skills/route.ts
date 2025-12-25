// app/api/skills/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const searchQuery = searchParams.get('q');
    const skillCategory = searchParams.get('type'); // Technical, Soft Skills, Tools

    // Build filter
    const filter: any = { isActive: true };

    if (categorySlug) {
      const category = await prisma.jobCategory.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        // Get industry-specific skills + universal skills (null categoryId)
        filter.OR = [{ categoryId: category.id }, { categoryId: null }];
      }
    }

    if (skillCategory) {
      filter.category = skillCategory;
    }

    if (searchQuery) {
      filter.name = { contains: searchQuery, mode: 'insensitive' };
    }

    const skills = await prisma.skillSuggestion.findMany({
      where: filter,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    // Group by category
    const groupedSkills = skills.reduce(
      (acc, skill) => {
        if (!acc[skill.category]) {
          acc[skill.category] = [];
        }
        acc[skill.category].push({ id: skill.id, name: skill.name });
        return acc;
      },
      {} as Record<string, { id: string; name: string }[]>
    );

    return NextResponse.json({
      success: true,
      data: {
        skills,
        grouped: groupedSkills,
        total: skills.length,
      },
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
