import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Free preview uses Haiku (cheapest model)
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

    // Validate required fields
    if (!formData.fullName || !formData.targetJobTitle) {
      return NextResponse.json(
        { error: 'Name and target job title are required' },
        { status: 400 }
      );
    }

    // Build the prompt from form data
    const prompt = buildEnhancedPreviewPrompt(formData);

    console.log('[PREVIEW] Generating enhanced preview with Haiku for:', session.user.email);

    // Use Haiku model for cost-effective preview
    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022', // Cheapest model
      max_tokens: 1500, // Limited tokens for preview
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

    console.log('[PREVIEW] Enhanced preview generated successfully');

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

  let prompt = `You are a professional resume writer. Create an enhanced, professional resume preview for this candidate.

CANDIDATE INFO:
Name: ${fullName}
Target Role: ${targetJobTitle}
${targetIndustry ? `Industry: ${targetIndustry}` : ''}
${experienceLevel ? `Experience Level: ${experienceLevel}` : ''}

`;

  // Add summary if provided
  if (summary) {
    prompt += `PROFESSIONAL SUMMARY PROVIDED:
${summary}

`;
  }

  // Add education
  if (education && education.length > 0) {
    prompt += `EDUCATION:
`;
    education.forEach((edu: any) => {
      prompt += `- ${edu.degree}${edu.field ? ` in ${edu.field}` : ''} from ${edu.school}`;
      if (edu.startDate) {
        prompt += ` (${edu.startDate} - ${edu.current ? 'Present' : edu.endDate || 'N/A'})`;
      }
      if (edu.gpa) {
        prompt += ` - GPA: ${edu.gpa}`;
      }
      if (edu.highlights) {
        prompt += `\n  Highlights: ${edu.highlights}`;
      }
      prompt += '\n';
    });
    prompt += '\n';
  }

  // Add experience
  if (experience && experience.length > 0) {
    prompt += `WORK EXPERIENCE:
`;
    experience.forEach((exp: any) => {
      prompt += `- ${exp.title} at ${exp.company}`;
      if (exp.location) prompt += `, ${exp.location}`;
      if (exp.startDate) {
        prompt += ` (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || 'N/A'})`;
      }
      if (exp.description) {
        prompt += `\n  ${exp.description}`;
      }
      prompt += '\n';
    });
    prompt += '\n';
  }

  // Add skills
  if (skills) {
    const allSkills = [
      ...(skills.technical || []),
      ...(skills.soft || []),
      ...(skills.languages || []),
      ...(skills.certifications || []),
    ];
    if (allSkills.length > 0) {
      prompt += `SKILLS & CERTIFICATIONS:
${allSkills.join(', ')}

`;
    }
  }

  prompt += `INSTRUCTIONS:
1. Create a polished, professional resume with proper sections
2. Enhance the professional summary to be compelling (2-3 sentences)
3. Rewrite experience descriptions with strong action verbs and quantifiable achievements
4. Format properly with clear section headers: PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS
5. Keep it concise but impactful - this is a PREVIEW
6. Use professional language appropriate for ${targetJobTitle} role
7. Make it ATS-friendly (no special characters, clear formatting)

Output ONLY the enhanced resume content. No explanations or meta-commentary.`;

  return prompt;
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
