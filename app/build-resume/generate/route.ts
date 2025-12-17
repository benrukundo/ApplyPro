import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Rate limiting for free users
const FREE_GENERATION_LIMIT = 1;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { builderId, formData } = await request.json();

    // Check if user has an active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
    });

    const hasActiveSubscription = !!subscription;

    // For free users, check generation limit
    if (!hasActiveSubscription) {
      const existingGenerations = await prisma.builderResume.count({
        where: {
          userId: session.user.id,
          generatedResume: { not: null },
        },
      });

      if (existingGenerations >= FREE_GENERATION_LIMIT) {
        return NextResponse.json(
          {
            error: 'Free generation limit reached. Please subscribe to generate more resumes.',
            requiresUpgrade: true,
          },
          { status: 403 }
        );
      }
    }

    // Validate required fields
    if (!formData.targetJobTitle || !formData.fullName || !formData.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build the prompt for Claude
    const prompt = buildResumePrompt(formData);

    // Call Anthropic API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the generated resume
    const generatedResume = (message.content[0] as { type: string; text: string }).text;

    // Save to database
    if (builderId) {
      await prisma.builderResume.update({
        where: {
          id: builderId,
          userId: session.user.id,
        },
        data: {
          generatedResume,
          generatedAt: new Date(),
          isComplete: true,
          currentStep: 7,
        },
      });
    } else {
      // Create new record with generated resume
      await prisma.builderResume.create({
        data: {
          userId: session.user.id,
          targetJobTitle: formData.targetJobTitle,
          targetIndustry: formData.targetIndustry,
          experienceLevel: formData.experienceLevel,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          education: JSON.stringify(formData.education),
          experience: JSON.stringify(formData.experience),
          skills: JSON.stringify(formData.skills),
          summary: formData.summary,
          generatedResume,
          generatedAt: new Date(),
          isComplete: true,
          currentStep: 7,
        },
      });
    }

    return NextResponse.json({
      resume: generatedResume,
      success: true,
    });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: 'Failed to generate resume. Please try again.' },
      { status: 500 }
    );
  }
}

function buildResumePrompt(formData: any): string {
  const {
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
  } = formData;

  // Parse JSON strings if needed
  const educationList = typeof education === 'string' ? JSON.parse(education) : education || [];
  const experienceList = typeof experience === 'string' ? JSON.parse(experience) : experience || [];
  const skillsObj = typeof skills === 'string' ? JSON.parse(skills) : skills || {};

  let prompt = `You are a professional resume writer. Create a polished, ATS-friendly resume for the following person.

TARGET ROLE: ${targetJobTitle}
${targetIndustry ? `INDUSTRY: ${targetIndustry}` : ''}
${experienceLevel ? `EXPERIENCE LEVEL: ${experienceLevel}` : ''}

PERSONAL INFORMATION:
Name: ${fullName}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${location ? `Location: ${location}` : ''}
${linkedin ? `LinkedIn: ${linkedin}` : ''}
${portfolio ? `Portfolio: ${portfolio}` : ''}

`;

  // Education
  if (educationList.length > 0) {
    prompt += `EDUCATION:\n`;
    educationList.forEach((edu: any) => {
      prompt += `- ${edu.degree || 'Degree'} ${edu.field ? `in ${edu.field}` : ''} from ${edu.school || 'School'}`;
      if (edu.startDate || edu.endDate) {
        prompt += ` (${edu.startDate || ''} - ${edu.current ? 'Present' : edu.endDate || ''})`;
      }
      if (edu.gpa) prompt += `, GPA: ${edu.gpa}`;
      prompt += `\n`;
      if (edu.highlights) prompt += `  Highlights: ${edu.highlights}\n`;
    });
    prompt += `\n`;
  }

  // Experience
  if (experienceList.length > 0) {
    prompt += `WORK EXPERIENCE:\n`;
    experienceList.forEach((exp: any) => {
      prompt += `- ${exp.title || 'Position'} at ${exp.company || 'Company'}`;
      if (exp.location) prompt += `, ${exp.location}`;
      if (exp.startDate || exp.endDate) {
        prompt += ` (${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''})`;
      }
      prompt += `\n`;
      if (exp.description) {
        prompt += `  Description (raw input from user, please polish): ${exp.description}\n`;
      }
    });
    prompt += `\n`;
  }

  // Skills
  const allSkills = [
    ...(skillsObj.technical || []),
    ...(skillsObj.soft || []),
  ];
  const languages = skillsObj.languages || [];
  const certifications = skillsObj.certifications || [];

  if (allSkills.length > 0) {
    prompt += `SKILLS: ${allSkills.join(', ')}\n\n`;
  }

  if (languages.length > 0) {
    prompt += `LANGUAGES: ${languages.join(', ')}\n\n`;
  }

  if (certifications.length > 0) {
    prompt += `CERTIFICATIONS: ${certifications.join(', ')}\n\n`;
  }

  // Custom summary or request AI to generate
  if (summary) {
    prompt += `USER-PROVIDED SUMMARY (use as guidance): ${summary}\n\n`;
  }

  prompt += `
INSTRUCTIONS:
1. Create a professional resume in clean, readable text format
2. Start with a compelling PROFESSIONAL SUMMARY (2-3 sentences) tailored to the target role
3. Format sections clearly: CONTACT, SUMMARY, EXPERIENCE, EDUCATION, SKILLS
4. For work experience, transform the user's raw descriptions into professional bullet points using action verbs and quantifiable achievements where possible
5. Ensure the resume is ATS-friendly (no tables, graphics, or complex formatting)
6. Keep it to 1 page worth of content (approximately 400-600 words)
7. Use consistent formatting throughout
8. Highlight skills and experiences most relevant to the target role: ${targetJobTitle}
${experienceLevel === 'entry' ? '9. Since this is entry-level, emphasize education, skills, internships, projects, and transferable skills' : ''}
${experienceList.length === 0 ? '9. Since there is no work experience, focus on education, skills, projects, volunteer work, or relevant coursework' : ''}

Generate the resume now:`;

  return prompt;
}
