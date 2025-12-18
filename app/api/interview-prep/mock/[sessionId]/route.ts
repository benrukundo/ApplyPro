import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mockSession = await prisma.mockInterviewSession.findFirst({
      where: { id: sessionId },
      include: {
        prep: {
          select: {
            userId: true,
            jobTitle: true,
            company: true,
            interviewType: true,
          },
        },
      },
    });

    if (!mockSession || mockSession.prep.userId !== session.user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const answers = mockSession.answers as any[];

    // Calculate summary statistics
    const scores = answers.map((a) => a.feedback?.score || 0);
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    const allStrengths = answers.flatMap((a) => a.feedback?.strengths || []);
    const allImprovements = answers.flatMap((a) => a.feedback?.improvements || []);

    // Get unique strengths and improvements (top 5 each)
    const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
    const uniqueImprovements = [...new Set(allImprovements)].slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: mockSession.id,
        jobTitle: mockSession.prep.jobTitle,
        company: mockSession.prep.company,
        interviewType: mockSession.prep.interviewType,
        status: mockSession.status,
        totalQuestions: mockSession.totalQuestions,
        answeredQuestions: answers.length,
        overallScore: avgScore,
        answers,
        summary: {
          strengths: uniqueStrengths,
          improvements: uniqueImprovements,
        },
        startedAt: mockSession.startedAt,
        completedAt: mockSession.completedAt,
      },
    });
  } catch (error) {
    console.error('Get session summary error:', error);
    return NextResponse.json(
      { error: 'Failed to get session summary' },
      { status: 500 }
    );
  }
}
