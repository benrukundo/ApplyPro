// app/api/builder/prefill/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const categorySlug = searchParams.get('category');

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Build query
    let example;

    if (categorySlug) {
      // Find by category and slug
      const category = await prisma.jobCategory.findUnique({
        where: { slug: categorySlug },
      });

      if (category) {
        example = await prisma.resumeExample.findFirst({
          where: {
            slug,
            categoryId: category.id,
            isActive: true,
          },
          include: {
            category: {
              select: { name: true, slug: true },
            },
          },
        });
      }
    }

    // Fallback: search by slug only
    if (!example) {
      example = await prisma.resumeExample.findFirst({
        where: {
          slug,
          isActive: true,
        },
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
      });
    }

    // Still not found? Try fuzzy match on title
    if (!example) {
      example = await prisma.resumeExample.findFirst({
        where: {
          isActive: true,
          OR: [
            { title: { contains: slug.replace(/-/g, ' '), mode: 'insensitive' } },
            { slug: { contains: slug } },
          ],
        },
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
      });
    }

    if (!example) {
      return NextResponse.json(
        { success: false, error: 'Example not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: example.id,
        title: example.title,
        slug: example.slug,
        experienceLevel: example.experienceLevel,
        summary: example.summary,
        bulletPoints: example.bulletPoints,
        skills: example.skills,
        writingTips: example.writingTips,
        category: example.category,
      },
    });
  } catch (error) {
    console.error('Error fetching prefill data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch example' },
      { status: 500 }
    );
  }
}
