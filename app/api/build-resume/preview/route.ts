import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { formData } = body;

    if (!formData.fullName || !formData.targetJobTitle) {
      return NextResponse.json(
        { error: 'Name and target job title are required' },
        { status: 400 }
      );
    }

    const prompt = buildEnhancedPreviewPrompt(formData);

    console.log('[PREVIEW] Generating enhanced preview for:', session.user.email);

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const enhancedContent = message.content[0].type === 'text' ? message.content[0].text : '';

    if (!enhancedContent) {
      throw new Error('No content generated');
    }

    console.log('[PREVIEW] Generated successfully, length:', enhancedContent.length);

    return NextResponse.json({
      success: true,
      content: enhancedContent,
    });
  } catch (error) {
    console.error('[PREVIEW] Error generating preview:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate preview. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // Handle YYYY-MM format
  if (dateStr.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = dateStr.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }
  
  return dateStr;
}

function buildEnhancedPreviewPrompt(formData: any): string {
  const {
    fullName,
    targetJobTitle,
    targetIndustry,
    experienceLevel,
    education,
    experience,
    skills,
    summary,
  } = formData;

  // Calculate total years of experience
  let totalYears = 0;
  if (experience && experience.length > 0) {
    experience.forEach((exp: any) => {
      if (exp.startDate) {
        const startYear = parseInt(exp.startDate.split('-')[0]);
        const endYear = exp.current ? new Date().getFullYear() : (exp.endDate ? parseInt(exp.endDate.split('-')[0]) : startYear);
        totalYears += (endYear - startYear);
      }
    });
  }

  let prompt = `You are an expert resume writer. Generate ONLY a professional summary and enhanced experience bullet points.

CANDIDATE PROFILE:
- Name: ${fullName}
- Target Role: ${targetJobTitle}
- Industry: ${targetIndustry || 'General'}
- Experience Level: ${experienceLevel || 'Not specified'}
- Total Years of Experience: ${totalYears > 0 ? totalYears + '+ years' : 'Entry level'}

`;

  if (summary) {
    prompt += `CANDIDATE'S SUMMARY (enhance this):
${summary}

`;
  }

  // Add experience details for AI to enhance
  if (experience && experience.length > 0) {
    prompt += `WORK EXPERIENCE TO ENHANCE:
`;
    experience.forEach((exp: any, idx: number) => {
      const startFormatted = formatDate(exp.startDate);
      const endFormatted = exp.current ? 'Present' : formatDate(exp.endDate);
      
      prompt += `
Role ${idx + 1}:
- Job Title: ${exp.title}
- Company: ${exp.company}
- Location: ${exp.location || 'Not specified'}
- Period: ${startFormatted} - ${endFormatted}
- Description: ${exp.description || 'General responsibilities'}
`;
    });
  }

  prompt += `
=== OUTPUT INSTRUCTIONS ===

Generate EXACTLY this format (no deviations):

## PROFESSIONAL SUMMARY
[Write a compelling 2-3 sentence summary highlighting ${totalYears > 0 ? totalYears + '+ years of experience' : 'enthusiasm and potential'} in ${targetIndustry || 'the field'}. Mention key strengths relevant to ${targetJobTitle}. Include quantifiable achievements if possible.]

## PROFESSIONAL EXPERIENCE
`;

  // Generate exact format for each experience
  if (experience && experience.length > 0) {
    experience.forEach((exp: any) => {
      const startFormatted = formatDate(exp.startDate);
      const endFormatted = exp.current ? 'Present' : formatDate(exp.endDate);
      
      prompt += `
**${exp.title}**
${exp.company}${exp.location ? ', ' + exp.location : ''} | ${startFormatted} - ${endFormatted}
- [Achievement bullet with action verb and quantifiable result]
- [Achievement bullet with action verb and quantifiable result]
- [Achievement bullet with action verb and quantifiable result]
- [Achievement bullet with action verb and quantifiable result]
`;
    });
  }

  prompt += `
=== CRITICAL RULES ===
1. Use EXACTLY the job titles, company names, locations, and dates I provided above
2. DO NOT change or omit any dates - use the exact "Month YYYY - Month YYYY" format shown
3. DO NOT include the candidate's name anywhere
4. DO NOT include contact information, skills, education, or certifications
5. Start each bullet point with a strong action verb (Led, Developed, Managed, Implemented, Increased, etc.)
6. Include quantifiable metrics where possible (%, $, numbers)
7. Keep bullets concise but impactful (one line each)
8. Output ONLY the two sections: PROFESSIONAL SUMMARY and PROFESSIONAL EXPERIENCE

Begin output now:`;

  return prompt;
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
