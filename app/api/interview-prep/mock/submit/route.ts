import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, questionIndex, userAnswer } = await req.json();

    // Get session with prep data
    const mockSession = await prisma.mockInterviewSession.findFirst({
      where: { id: sessionId },
      include: {
        prep: {
          select: {
            userId: true,
            questions: true,
            jobTitle: true,
            company: true,
          },
        },
      },
    });

    if (!mockSession || mockSession.prep.userId !== session.user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const questions = mockSession.prep.questions as any[];
    const currentQuestion = questions[questionIndex];

    if (!currentQuestion) {
      return NextResponse.json({ error: 'Invalid question index' }, { status: 400 });
    }

    // Get AI feedback on the answer
    const feedbackPrompt = `You are an expert interview coach evaluating a candidate's answer.

POSITION: ${mockSession.prep.jobTitle}${mockSession.prep.company ? ` at ${mockSession.prep.company}` : ''}

QUESTION: ${currentQuestion.question}

IDEAL ANSWER GUIDANCE: ${currentQuestion.suggestedAnswer}

CANDIDATE'S ANSWER: ${userAnswer}

Evaluate the answer and return a JSON object:
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "enhancedAnswer": "A better version of their answer, keeping their style but improving content",
  "briefFeedback": "2-3 sentence summary of feedback"
}

Be encouraging but honest. Focus on:
1. Use of specific examples (STAR method)
2. Relevance to the role
3. Confidence and clarity
4. Metrics and achievements mentioned`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: feedbackPrompt,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No feedback from AI');
    }

    let feedback;
    try {
      let jsonString = textContent.text;
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      feedback = JSON.parse(jsonString.trim());
    } catch {
      feedback = {
        score: 70,
        strengths: ['Answer provided'],
        improvements: ['Could add more specific examples'],
        enhancedAnswer: userAnswer,
        briefFeedback: 'Good effort. Try to include more specific examples from your experience.',
      };
    }

    // Update session with this answer
    const currentAnswers = mockSession.answers as any[];
    currentAnswers.push({
      questionIndex,
      question: currentQuestion.question,
      userAnswer,
      feedback,
    });

    const nextQuestionIndex = questionIndex + 1;
    const isComplete = nextQuestionIndex >= mockSession.totalQuestions;

    await prisma.mockInterviewSession.update({
      where: { id: sessionId },
      data: {
        answers: currentAnswers,
        currentQuestion: nextQuestionIndex,
        status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: isComplete ? new Date() : null,
        overallScore: isComplete
          ? Math.round(
              currentAnswers.reduce((sum, a) => sum + (a.feedback?.score || 0), 0) /
                currentAnswers.length
            )
          : null,
      },
    });

    return NextResponse.json({
      success: true,
      feedback,
      isComplete,
      nextQuestion: isComplete ? null : questions[nextQuestionIndex],
      nextQuestionIndex: isComplete ? null : nextQuestionIndex,
      progress: {
        current: questionIndex + 1,
        total: mockSession.totalQuestions,
      },
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
