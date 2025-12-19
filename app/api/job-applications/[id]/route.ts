import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
      include: {
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching job application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job application' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
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

    // Get current application to check for status change
    const currentApplication = await prisma.jobApplication.findFirst({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
    });

    if (!currentApplication) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      companyName,
      positionTitle,
      jobUrl,
      location,
      salary,
      isRemote,
      jobSource,
      status,
      appliedDate: appliedDate ? new Date(appliedDate) : null,
      notes,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      priority,
      contactPerson,
      contactEmail,
      updatedAt: new Date(),
    };

    // If status changed, add to history
    if (status && status !== currentApplication.status) {
      updateData.statusHistory = {
        create: {
          status,
          note: `Status changed from ${currentApplication.status} to ${status}`,
        },
      };
    }

    const application = await prisma.jobApplication.update({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
      data: updateData,
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error updating job application:', error);
    return NextResponse.json(
      { error: 'Failed to update job application' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    await prisma.jobApplication.delete({
      where: {
        id: resolvedParams.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting job application:', error);
    return NextResponse.json(
      { error: 'Failed to delete job application' },
      { status: 500 }
    );
  }
}
