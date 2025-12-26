import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET - List all examples with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const categoryId = searchParams.get('category');
    const experienceLevel = searchParams.get('level');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // 'active', 'inactive', 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Build where clause
    const where: any = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (experienceLevel && ['ENTRY', 'MID', 'SENIOR'].includes(experienceLevel)) {
      where.experienceLevel = experienceLevel;
    }
    
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    // 'all' shows everything
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.resumeExample.count({ where });

    // Get examples
    const examples = await prisma.resumeExample.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: [
        { category: { name: 'asc' } },
        { title: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    // Get categories for filter
    const categories = await prisma.jobCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { examples: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Get stats
    const stats = {
      total: await prisma.resumeExample.count(),
      active: await prisma.resumeExample.count({ where: { isActive: true } }),
      inactive: await prisma.resumeExample.count({ where: { isActive: false } }),
      byLevel: {
        entry: await prisma.resumeExample.count({ where: { experienceLevel: 'ENTRY' } }),
        mid: await prisma.resumeExample.count({ where: { experienceLevel: 'MID' } }),
        senior: await prisma.resumeExample.count({ where: { experienceLevel: 'SENIOR' } }),
      },
    };

    return NextResponse.json({
      examples,
      categories,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching examples:', error);
    return NextResponse.json(
      { error: 'Failed to fetch examples' },
      { status: 500 }
    );
  }
}

// POST - Create new example
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const {
      title,
      slug,
      categoryId,
      experienceLevel,
      summary,
      bulletPoints,
      skills,
      metaTitle,
      metaDescription,
      salaryRange,
      jobOutlook,
      writingTips,
      commonMistakes,
      isActive,
    } = body;

    // Validate required fields
    if (!title || !slug || !categoryId || !experienceLevel || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, categoryId, experienceLevel, summary' },
        { status: 400 }
      );
    }

    // Check if slug already exists in this category
    const existingExample = await prisma.resumeExample.findUnique({
      where: {
        categoryId_slug: {
          categoryId,
          slug: slug.toLowerCase().replace(/\s+/g, '-'),
        },
      },
    });

    if (existingExample) {
      return NextResponse.json(
        { error: 'An example with this slug already exists in this category' },
        { status: 400 }
      );
    }

    // Create example
    const example = await prisma.resumeExample.create({
      data: {
        title,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        categoryId,
        experienceLevel,
        summary,
        bulletPoints: bulletPoints || [],
        skills: skills || [],
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || summary.substring(0, 160),
        salaryRange: salaryRange || null,
        jobOutlook: jobOutlook || null,
        writingTips: writingTips || [],
        commonMistakes: commonMistakes || [],
        isActive: isActive !== false,
      },
      include: {
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      example,
      message: `Resume example "${title}" created successfully`,
    });
  } catch (error) {
    console.error('Error creating example:', error);
    return NextResponse.json(
      { error: 'Failed to create example' },
      { status: 500 }
    );
  }
}
