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

    console.log('[PREVIEW] Raw AI output (first 500 chars):', enhancedContent.substring(0, 500));

    // Post-process: Remove sections that should only appear in sidebar
    const filteredContent = filterSidebarSections(enhancedContent, formData.fullName, formData.targetJobTitle);

    console.log('[PREVIEW] Filtered content (first 500 chars):', filteredContent.substring(0, 500));
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

  prompt += `CRITICAL INSTRUCTIONS - DO NOT INCLUDE:
- DO NOT write the candidate's name "${fullName}" anywhere in your output
- DO NOT write the job title "${targetJobTitle}" as a standalone line
- DO NOT include contact information (email, phone, address)
- DO NOT include SKILLS section (already in sidebar)
- DO NOT include EDUCATION section (already in sidebar)
- DO NOT include CERTIFICATIONS section (already in sidebar)
- DO NOT include LANGUAGES section (already in sidebar)

WHAT TO GENERATE - ONLY 2 SECTIONS:

1. PROFESSIONAL SUMMARY section:
   - Header: ## PROFESSIONAL SUMMARY
   - 2-3 compelling sentences highlighting key strengths for ${targetJobTitle} role
   - Include years of experience if applicable
   - Mention key achievements or expertise areas

2. EXPERIENCE section:
   - Header: ## PROFESSIONAL EXPERIENCE
   - For EACH work experience, use this EXACT format:

   Job Title
   Company Name | Start Date - End Date
   • Achievement 1 with action verbs and impact
   • Achievement 2 with quantifiable results
   • Achievement 3 highlighting key responsibilities

   - Use the EXACT company names, job titles, and dates provided in the input
   - Enhance the description with strong action verbs (Led, Managed, Developed, Increased, Implemented, Architected, etc.)
   - Add quantifiable achievements where possible (e.g., "Increased efficiency by 40%", "Managed team of 12+")
   - 3-5 bullet points per role
   - Keep achievements concise but impactful

FORMATTING RULES:
- Start directly with ## PROFESSIONAL SUMMARY (no name, no title above it)
- Use ## for section headers
- Use - for bullet points
- Keep it ATS-friendly
- Professional language throughout

OUTPUT FORMAT EXAMPLE:
## PROFESSIONAL SUMMARY
[2-3 sentences about the candidate]

## PROFESSIONAL EXPERIENCE
[Enhanced work experience with bullet points]

Output ONLY these two sections. Do NOT include any header with the name or title. Start immediately with ## PROFESSIONAL SUMMARY.`;

  return prompt;
}

/**
 * Filter out sections that should only appear in sidebar
 * Also removes name, title, and contact info from AI output
 * Keeps only: PROFESSIONAL SUMMARY, EXPERIENCE, and any other narrative sections
 */
function filterSidebarSections(content: string, fullName: string, targetJobTitle: string): string {
  const lines = content.split('\n');
  const sectionsToSkip = ['SKILLS', 'SKILL', 'EDUCATION', 'CERTIFICATIONS', 'CERTIFICATION', 'LANGUAGES', 'LANGUAGE', 'CONTACT'];

  let skipSection = false;
  const filteredLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      filteredLines.push(line);
      continue;
    }

    const cleanLine = trimmedLine.replace(/^#+\s*/, '').replace(/\*\*/g, '');

    // Always skip lines containing the person's name (anywhere in the content)
    const lineUpper = cleanLine.toUpperCase();
    const nameUpper = fullName.toUpperCase();
    const titleUpper = targetJobTitle.toUpperCase();

    // Skip if line contains full name
    if (lineUpper.includes(nameUpper) && cleanLine.length < 100) {
      console.log('[FILTER] Skipping name line:', cleanLine);
      continue;
    }

    // Skip if line is exactly the job title
    if (lineUpper === titleUpper) {
      console.log('[FILTER] Skipping title line:', cleanLine);
      continue;
    }

    // Skip contact info
    if (cleanLine.includes('@') || cleanLine.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
      continue;
    }

    // Check if this is a section header
    const isHeader =
      trimmedLine.startsWith('##') ||
      trimmedLine.startsWith('**') ||
      (trimmedLine === trimmedLine.toUpperCase() &&
       trimmedLine.length > 5 &&
       trimmedLine.length < 60 &&
       !trimmedLine.includes('@'));

    if (isHeader) {
      const cleanHeader = cleanLine.toUpperCase();

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
