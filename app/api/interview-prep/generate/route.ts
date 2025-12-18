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

    const { resumeContent, jobDescription, jobTitle, company, interviewType } = await req.json();

    // Validate inputs
    if (!resumeContent || !jobDescription || !jobTitle) {
      return NextResponse.json(
        { error: 'Resume, job description, and job title are required' },
        { status: 400 }
      );
    }

    // Check user subscription/credits
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Active subscription required for interview preparation' },
        { status: 403 }
      );
    }

    // Generate interview prep using Claude
    const systemPrompt = `You are an expert career coach and interview preparation specialist with 20+ years of experience helping candidates succeed in interviews across all industries.

Your task is to generate comprehensive interview preparation materials based on the candidate's resume and the target job description.

You must return a valid JSON object with this exact structure:
{
  "questions": [
    {
      "question": "The interview question",
      "suggestedAnswer": "A detailed suggested answer using the STAR method where applicable, incorporating specific examples from the candidate's resume",
      "category": "One of: introduction, experience, behavioral, technical, situational, motivation, culture_fit",
      "difficulty": "One of: easy, medium, hard",
      "tips": "Brief tips for answering this specific question"
    }
  ],
  "keyTalkingPoints": [
    {
      "point": "A key achievement or skill to emphasize",
      "evidence": "Specific example from resume that supports this",
      "relevance": "Why this matters for the target role"
    }
  ],
  "questionsToAsk": [
    {
      "question": "A thoughtful question to ask the interviewer",
      "purpose": "Why this question is valuable to ask",
      "category": "One of: role, team, company, growth, culture"
    }
  ],
  "companyInsights": "Brief insights about what the company likely values based on the job description, and how the candidate should position themselves"
}

IMPORTANT GUIDELINES:
1. Generate 12-15 questions appropriate for the interview type
2. Tailor all answers to use SPECIFIC examples from the candidate's resume
3. Use the STAR method (Situation, Task, Action, Result) for behavioral questions
4. Include metrics and achievements from the resume where possible
5. Questions should progress from easy to hard
6. Include a mix of categories appropriate for the interview type
7. Make suggested answers conversational, not robotic
8. Key talking points should highlight the candidate's strongest qualifications for THIS specific role
9. Questions to ask should show genuine interest and research`;

    const userPrompt = `INTERVIEW TYPE: ${interviewType.replace('_', ' ')}

TARGET POSITION: ${jobTitle}${company ? ` at ${company}` : ''}

CANDIDATE'S RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Generate comprehensive interview preparation materials. Remember to:
- Use specific examples from the resume in suggested answers
- Tailor questions to the ${interviewType.replace('_', ' ').toLowerCase()} format
- Include industry-specific questions relevant to the role
- Make answers authentic and personal to this candidate`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    // Extract the text content
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse the JSON response
    let prepData;
    try {
      // Extract JSON from the response (handle potential markdown code blocks)
      let jsonString = textContent.text;
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      prepData = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', textContent.text);
      throw new Error('Failed to parse interview prep data');
    }

    // Save to database
    const interviewPrep = await prisma.interviewPrep.create({
      data: {
        userId: session.user.id,
        resumeContent,
        jobDescription,
        jobTitle,
        company: company || null,
        interviewType: interviewType as any,
        questions: prepData.questions,
        keyTalkingPoints: prepData.keyTalkingPoints,
        questionsToAsk: prepData.questionsToAsk,
        companyInsights: prepData.companyInsights || null,
      },
    });

    return NextResponse.json({
      success: true,
      prepId: interviewPrep.id,
      data: {
        questions: prepData.questions,
        keyTalkingPoints: prepData.keyTalkingPoints,
        questionsToAsk: prepData.questionsToAsk,
        companyInsights: prepData.companyInsights,
      },
    });
  } catch (error) {
    console.error('Interview prep generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview preparation' },
      { status: 500 }
    );
  }
}
