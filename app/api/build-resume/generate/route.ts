import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Rate limiting for free users
const FREE_GENERATION_LIMIT = 1;

export const maxDuration = 60; // Allow up to 60 seconds for Pro plans on Vercel

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { builderId, formData } = body;

    if (!formData) {
      return NextResponse.json({ error: 'Missing form data' }, { status: 400 });
    }

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
        { error: 'Missing required fields: target job title, full name, and email are required.' },
        { status: 400 }
      );
    }

    // Build the prompt for Claude
    const prompt = buildResumePrompt(formData);

    console.log('Calling Anthropic API for resume generation...');

    // Call Anthropic API with timeout handling
    let message;
    try {
      message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500, // Reduced for faster response
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
    } catch (aiError: any) {
      console.error('Anthropic API error:', aiError);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    // Extract the generated resume
    if (!message.content || message.content.length === 0) {
      console.error('Empty response from Anthropic');
      return NextResponse.json(
        { error: 'Failed to generate resume content. Please try again.' },
        { status: 500 }
      );
    }

    const generatedResume = (message.content[0] as { type: string; text: string }).text;

    if (!generatedResume || generatedResume.trim().length === 0) {
      console.error('Empty resume text from Anthropic');
      return NextResponse.json(
        { error: 'Generated resume was empty. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Resume generated successfully, saving to database...');

    // Save to database
    try {
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
            targetJobTitle: formData.targetJobTitle || null,
            targetIndustry: formData.targetIndustry || null,
            experienceLevel: formData.experienceLevel || null,
            fullName: formData.fullName || null,
            email: formData.email || null,
            phone: formData.phone || null,
            location: formData.location || null,
            linkedin: formData.linkedin || null,
            portfolio: formData.portfolio || null,
            education: typeof formData.education === 'string' 
              ? formData.education 
              : JSON.stringify(formData.education || []),
            experience: typeof formData.experience === 'string' 
              ? formData.experience 
              : JSON.stringify(formData.experience || []),
            skills: typeof formData.skills === 'string' 
              ? formData.skills 
              : JSON.stringify(formData.skills || {}),
            summary: formData.summary || null,
            generatedResume,
            generatedAt: new Date(),
            isComplete: true,
            currentStep: 7,
          },
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Still return the resume even if saving fails
      return NextResponse.json({
        resume: generatedResume,
        success: true,
        warning: 'Resume generated but could not be saved. Please copy the content.',
      });
    }

    console.log('Resume saved successfully');

    return NextResponse.json({
      resume: generatedResume,
      success: true,
    });
  } catch (error: any) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate resume. Please try again.' },
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
  let educationList: any[] = [];
  let experienceList: any[] = [];
  let skillsObj: any = {};

  try {
    educationList = typeof education === 'string' ? JSON.parse(education) : education || [];
  } catch (e) {
    educationList = [];
  }

  try {
    experienceList = typeof experience === 'string' ? JSON.parse(experience) : experience || [];
  } catch (e) {
    experienceList = [];
  }

  try {
    skillsObj = typeof skills === 'string' ? JSON.parse(skills) : skills || {};
  } catch (e) {
    skillsObj = {};
  }

  let prompt = `Create a professional, ATS-friendly resume for:

TARGET ROLE: ${targetJobTitle || 'Not specified'}
${targetIndustry ? `INDUSTRY: ${targetIndustry}` : ''}
${experienceLevel ? `EXPERIENCE LEVEL: ${experienceLevel}` : ''}

CONTACT INFORMATION:
Name: ${fullName}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${location ? `Location: ${location}` : ''}
${linkedin ? `LinkedIn: ${linkedin}` : ''}
${portfolio ? `Portfolio: ${portfolio}` : ''}

`;

  // Education
  if (educationList && educationList.length > 0) {
    prompt += `EDUCATION:\n`;
    educationList.forEach((edu: any) => {
      if (edu.school || edu.degree) {
        prompt += `- ${edu.degree || 'Degree'} ${edu.field ? `in ${edu.field}` : ''} from ${edu.school || 'School'}`;
        if (edu.startDate || edu.endDate) {
          prompt += ` (${edu.startDate || ''} - ${edu.current ? 'Present' : edu.endDate || ''})`;
        }
        if (edu.gpa) prompt += `, GPA: ${edu.gpa}`;
        prompt += `\n`;
        if (edu.highlights) prompt += `  Highlights: ${edu.highlights}\n`;
      }
    });
    prompt += `\n`;
  }

  // Experience
  if (experienceList && experienceList.length > 0) {
    prompt += `WORK EXPERIENCE:\n`;
    experienceList.forEach((exp: any) => {
      if (exp.company || exp.title) {
        prompt += `- ${exp.title || 'Position'} at ${exp.company || 'Company'}`;
        if (exp.location) prompt += `, ${exp.location}`;
        if (exp.startDate || exp.endDate) {
          prompt += ` (${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''})`;
        }
        prompt += `\n`;
        if (exp.description) {
          prompt += `  Responsibilities: ${exp.description}\n`;
        }
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

  if (summary) {
    prompt += `USER SUMMARY: ${summary}\n\n`;
  }

  prompt += `INSTRUCTIONS:
1. Create a professional resume in clean text format
2. Start with a compelling 2-3 sentence PROFESSIONAL SUMMARY for ${targetJobTitle}
3. Use clear section headers: CONTACT, PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS
4. Transform work descriptions into achievement-focused bullet points with action verbs
5. Keep it concise - approximately 400-500 words
6. Make it ATS-friendly with relevant keywords for ${targetJobTitle}
${experienceLevel === 'entry' || experienceList.length === 0 ? '7. Emphasize education, skills, and any projects or volunteer work since experience is limited' : ''}

Generate the resume now:`;

  return prompt;
}
