import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get('template');
    const category = searchParams.get('category');

    if (!template || !category) {
      return NextResponse.json({ error: 'Missing template or category' }, { status: 400 });
    }

    const example = await prisma.resumeExample.findFirst({
      where: {
        slug: template,
        category: {
          slug: category,
        },
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    if (!example) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await prisma.resumeExample.update({
      where: { id: example.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      data: {
        title: example.title,
        industry: example.category.name,
        experienceLevel: example.experienceLevel,
        summary: example.summary,
        bulletPoints: example.bulletPoints,
        skills: example.skills,
        writingTips: example.writingTips,
        commonMistakes: example.commonMistakes,
        salaryRange: example.salaryRange,
        jobOutlook: example.jobOutlook,
      },
    });
  } catch (error) {
    console.error('Prefill API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
