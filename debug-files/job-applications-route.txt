import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    let where: any = {
      userId: session.user.id,
    };

    // Add filters
    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { positionTitle: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const applications = await prisma.jobApplication.findMany({
      where,
      include: {
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      companyName,
      positionTitle,
      jobUrl,
      location,
      salary,
      isRemote,
      jobSource,
      status,
      appliedDate,
      notes,
      followUpDate,
      priority,
      contactPerson,
      contactEmail,
    } = body;

    // Check user limit (100 applications)
    const currentCount = await prisma.jobApplication.count({
      where: { userId: session.user.id },
    });

    if (currentCount >= 100) {
      return NextResponse.json(
        { error: 'Application limit reached (100). Upgrade for unlimited applications.' },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        userId: session.user.id,
        companyName,
        positionTitle,
        jobUrl,
        location,
        salary,
        isRemote: isRemote || false,
        jobSource: jobSource || 'other',
        status: status || 'saved',
        appliedDate: appliedDate ? new Date(appliedDate) : null,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        priority: priority || 'medium',
        contactPerson,
        contactEmail,
        statusHistory: {
          create: {
            status: status || 'saved',
            note: 'Application created',
          },
        },
      },
      include: {
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json(
      { error: 'Failed to create job application' },
      { status: 500 }
    );
  }
}
