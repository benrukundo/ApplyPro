// app/api/builder/suggestions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobTitle, industry, experienceLevel } = body;

    if (!jobTitle) {
      return NextResponse.json(
        { success: false, error: 'Job title is required' },
        { status: 400 }
      );
    }

    // Find matching example
    const example = await prisma.resumeExample.findFirst({
      where: {
        isActive: true,
        OR: [
          { title: { contains: jobTitle, mode: 'insensitive' } },
          { slug: { contains: jobTitle.toLowerCase().replace(/\s+/g, '-') } },
        ],
        ...(experienceLevel && { experienceLevel }),
      },
      include: {
        category: true,
      },
    });

    // Get skills for the industry
    let skills: any[] = [];
    if (industry) {
      const category = await prisma.jobCategory.findFirst({
        where: {
          OR: [
            { slug: { contains: industry.toLowerCase() } },
            { name: { contains: industry, mode: 'insensitive' } },
          ],
        },
      });

      if (category) {
        skills = await prisma.skillSuggestion.findMany({
          where: {
            OR: [{ categoryId: category.id }, { categoryId: null }],
            isActive: true,
          },
          take: 20,
        });
      }
    }

    // If no exact match, get similar examples
    let similarExamples: any[] = [];
    if (!example) {
      similarExamples = await prisma.resumeExample.findMany({
        where: {
          isActive: true,
          ...(experienceLevel && { experienceLevel }),
        },
        take: 5,
        orderBy: { viewCount: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          bulletPoints: true,
          skills: true,
          category: {
            select: { name: true, slug: true },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        matchedExample: example
          ? {
              id: example.id,
              title: example.title,
              summary: example.summary,
              bulletPoints: example.bulletPoints,
              skills: example.skills,
              writingTips: example.writingTips,
              category: example.category,
            }
          : null,
        suggestedSkills: skills.map((s) => s.name),
        similarExamples: example ? [] : similarExamples,
        tips: example?.writingTips || [
          'Use action verbs to start bullet points',
          'Quantify achievements with numbers when possible',
          'Tailor your resume to the job description',
          'Keep your resume to 1-2 pages',
        ],
      },
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}
