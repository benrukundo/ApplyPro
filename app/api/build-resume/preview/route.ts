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

    // Post-process: Remove sections that should only appear in sidebar
    const filteredContent = filterSidebarSections(enhancedContent);

    console.log('[PREVIEW] Enhanced preview generated successfully');

    return NextResponse.json({
      success: true,
      content: filteredContent,
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
1. Create ONLY these sections (contact, skills, education already displayed separately):
   - PROFESSIONAL SUMMARY (2-3 compelling sentences highlighting key strengths)
   - EXPERIENCE (enhance work history with strong action verbs and quantifiable achievements)

2. DO NOT include these sections (they are already displayed in the sidebar):
   - Contact information
   - Skills
   - Education
   - Certifications
   - Languages

3. For the PROFESSIONAL SUMMARY:
   - Write 2-3 powerful sentences
   - Highlight key qualifications for ${targetJobTitle}
   - Include years of experience if applicable
   - Mention key achievements or expertise areas

4. For EXPERIENCE section:
   - Use the exact company names and job titles provided
   - Enhance descriptions with action verbs (Led, Managed, Developed, Increased, etc.)
   - Add quantifiable achievements where possible (e.g., "Increased sales by 30%")
   - Use bullet points for achievements
   - Keep each role concise but impactful

5. Formatting rules:
   - Use ## for section headers (e.g., ## PROFESSIONAL SUMMARY)
   - Use - or • for bullet points
   - Keep it ATS-friendly (no special characters)
   - Professional language throughout

Output ONLY the enhanced content with these two sections. No explanations or meta-commentary.`;

  return prompt;
}

/**
 * Filter out sections that should only appear in sidebar
 * Keeps only: PROFESSIONAL SUMMARY, EXPERIENCE, and any other narrative sections
 */
function filterSidebarSections(content: string): string {
  const lines = content.split('\n');
  const sectionsToSkip = ['SKILLS', 'SKILL', 'EDUCATION', 'CERTIFICATIONS', 'CERTIFICATION', 'LANGUAGES', 'LANGUAGE', 'CONTACT'];

  let skipSection = false;
  const filteredLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if this is a section header
    const isHeader =
      trimmedLine.startsWith('##') ||
      trimmedLine.startsWith('**') ||
      (trimmedLine === trimmedLine.toUpperCase() &&
       trimmedLine.length > 5 &&
       trimmedLine.length < 60);

    if (isHeader) {
      const cleanHeader = trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, '').toUpperCase();

      // Check if this is a section we should skip
      if (sectionsToSkip.some(s => cleanHeader.includes(s))) {
        skipSection = true;
        continue; // Skip this header
      } else {
        // This is a valid section (SUMMARY or EXPERIENCE)
        skipSection = false;
        filteredLines.push(line);
      }
    } else if (!skipSection) {
      // Only add content if we're not in a skipped section
      filteredLines.push(line);
    }
  }

  return filteredLines.join('\n');
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
