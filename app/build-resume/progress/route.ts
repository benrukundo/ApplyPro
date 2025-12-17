import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// GET - Load saved progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the most recent incomplete builder resume, or the most recent one
    const builderResume = await prisma.builderResume.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isComplete: 'asc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json({ builderResume });
  } catch (error) {
    console.error('Error loading builder progress:', error);
    return NextResponse.json(
      { error: 'Failed to load progress' },
      { status: 500 }
    );
  }
}

// POST - Save progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      currentStep,
      targetJobTitle,
      targetIndustry,
      experienceLevel,
      fullName,
      email,
      phone,
      location,
      linkedin,
      portfolio,
      education,
      experience,
      skills,
      summary,
    } = body;

    let builderResume;

    if (id) {
      // Update existing
      builderResume = await prisma.builderResume.update({
        where: {
          id,
          userId: session.user.id,
        },
        data: {
          currentStep,
          targetJobTitle,
          targetIndustry,
          experienceLevel,
          fullName,
          email,
          phone,
          location,
          linkedin,
          portfolio,
          education,
          experience,
          skills,
          summary,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new
      builderResume = await prisma.builderResume.create({
        data: {
          userId: session.user.id,
          currentStep: currentStep || 1,
          targetJobTitle,
          targetIndustry,
          experienceLevel,
          fullName,
          email,
          phone,
          location,
          linkedin,
          portfolio,
          education,
          experience,
          skills,
          summary,
        },
      });
    }

    return NextResponse.json({ id: builderResume.id, success: true });
  } catch (error) {
    console.error('Error saving builder progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a builder resume
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    await prisma.builderResume.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting builder resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    );
  }
}
