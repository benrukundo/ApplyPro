// app/api/examples/[categorySlug]/[exampleSlug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categorySlug: string; exampleSlug: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { categorySlug, exampleSlug } = await params;

    // Find category first
    const category = await prisma.jobCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Find example
    const example = await prisma.resumeExample.findFirst({
      where: {
        slug: exampleSlug,
        categoryId: category.id,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    if (!example) {
      return NextResponse.json(
        { success: false, error: 'Example not found' },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    prisma.resumeExample
      .update({
        where: { id: example.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(console.error);

    // Get related examples from same category
    const relatedExamples = await prisma.resumeExample.findMany({
      where: {
        categoryId: category.id,
        isActive: true,
        id: { not: example.id },
      },
      take: 4,
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        experienceLevel: true,
        summary: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        example: {
          id: example.id,
          title: example.title,
          slug: example.slug,
          experienceLevel: example.experienceLevel,
          summary: example.summary,
          bulletPoints: example.bulletPoints,
          skills: example.skills,
          salaryRange: example.salaryRange,
          jobOutlook: example.jobOutlook,
          writingTips: example.writingTips,
          commonMistakes: example.commonMistakes,
          metaTitle: example.metaTitle,
          metaDescription: example.metaDescription,
          viewCount: example.viewCount,
          category: example.category,
        },
        relatedExamples,
      },
    });
  } catch (error) {
    console.error('Error fetching example:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch example' },
      { status: 500 }
    );
  }
}
