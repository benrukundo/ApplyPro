import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    let where: any = {
      userId: user.id,  // Use database user ID
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

    // Detailed debug logging
    console.log('=== Job Application Debug ===');
    console.log('Full session:', JSON.stringify(session, null, 2));
    console.log('session.user:', JSON.stringify(session?.user, null, 2));
    console.log('session.user.id:', session?.user?.id);
    console.log('session.user.email:', session?.user?.email);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    // Try to find user by ID first, then by email as fallback
    let user = null;

    if (session.user.id) {
      console.log('Looking up user by ID:', session.user.id);
      user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      console.log('User found by ID:', user ? 'YES' : 'NO');
    }

    // Fallback: find by email if ID lookup failed
    if (!user && session.user.email) {
      console.log('Looking up user by email:', session.user.email);
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      console.log('User found by email:', user ? 'YES' : 'NO');
      if (user) {
        console.log('Actual user ID in database:', user.id);
      }
    }

    if (!user) {
      console.error('User not found by ID or email');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use the actual database user ID
    const userId = user.id;
    console.log('Using userId:', userId);

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
      where: { userId: userId },
    });

    if (currentCount >= 100) {
      return NextResponse.json(
        { error: 'Application limit reached (100). Upgrade for unlimited applications.' },
        { status: 400 }
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        userId: userId,
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
