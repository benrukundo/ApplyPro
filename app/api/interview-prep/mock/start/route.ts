import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prepId, questionCount = 10 } = await req.json();

    // Verify prep belongs to user
    const prep = await prisma.interviewPrep.findFirst({
      where: {
        id: prepId,
        userId: session.user.id,
      },
    });

    if (!prep) {
      return NextResponse.json({ error: 'Interview prep not found' }, { status: 404 });
    }

    const questions = prep.questions as any[];
    const totalQuestions = Math.min(questionCount, questions.length);

    // Create mock session
    const mockSession = await prisma.mockInterviewSession.create({
      data: {
        prepId,
        totalQuestions,
        answers: [],
        currentQuestion: 0,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: mockSession.id,
      totalQuestions,
      firstQuestion: questions[0],
    });
  } catch (error) {
    console.error('Start mock interview error:', error);
    return NextResponse.json(
      { error: 'Failed to start mock interview' },
      { status: 500 }
    );
  }
}
