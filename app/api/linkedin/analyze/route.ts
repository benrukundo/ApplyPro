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

    const {
      resumeContent,
      linkedinUrl,
      currentHeadline,
      currentAbout,
      targetRole
    } = await req.json();

    // Validate inputs
    if (!resumeContent) {
      return NextResponse.json(
        { error: 'Resume content is required' },
        { status: 400 }
      );
    }

    if (!currentHeadline && !currentAbout) {
      return NextResponse.json(
        { error: 'Please provide your current LinkedIn headline or about section' },
        { status: 400 }
      );
    }

    // Check user subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Active subscription required for LinkedIn optimization' },
        { status: 403 }
      );
    }

    // Generate LinkedIn optimization using Claude
    const systemPrompt = `You are an expert LinkedIn profile optimizer and personal branding specialist with 15+ years of experience helping professionals maximize their LinkedIn presence.

Your task is to analyze a user's LinkedIn profile against their resume and provide comprehensive optimization recommendations.

You must return a valid JSON object with this exact structure:
{
  "consistencyScore": <number 0-100>,
  "keywordsMatch": <number 0-100>,
  "experienceAlign": <number 0-100>,
  "skillsCoverage": <number 0-100>,
  "analysis": {
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  },
  "suggestedHeadlines": [
    {
      "headline": "Full headline text (max 220 characters)",
      "strategy": "visibility|job_search|thought_leadership",
      "explanation": "Why this headline works"
    },
    {
      "headline": "Second option...",
      "strategy": "...",
      "explanation": "..."
    },
    {
      "headline": "Third option...",
      "strategy": "...",
      "explanation": "..."
    }
  ],
  "optimizedAbout": "Full optimized About section (1500-2000 characters) with emojis, bullet points, and call-to-action",
  "missingKeywords": [
    {
      "keyword": "keyword",
      "priority": "high|medium|low",
      "context": "Where/how to use this keyword"
    }
  ],
  "skillsToAdd": [
    {
      "skill": "Skill name",
      "category": "technical|soft|industry",
      "reason": "Why add this skill"
    }
  ],
  "experienceTips": [
    {
      "section": "Which experience entry",
      "currentIssue": "What's wrong",
      "suggestion": "How to improve",
      "example": "Example improved text"
    }
  ]
}

OPTIMIZATION GUIDELINES:

1. HEADLINE (220 chars max):
   - Include target role/title
   - Add 2-3 key skills or specializations
   - Use | or • to separate elements
   - Include industry keywords for searchability
   - Consider adding value proposition or achievement

2. ABOUT SECTION (2600 chars max, aim for 1500-2000):
   - Start with a hook (emoji + compelling statement)
   - Use first person, conversational tone
   - Include 3-4 key achievements with metrics
   - Add bullet points for scanability
   - Include relevant keywords naturally
   - End with call-to-action
   - Use strategic emojis (🎯 💡 🚀 📊 etc.)

3. KEYWORDS:
   - Identify industry-specific terms
   - Include job title variations
   - Add technical skills and tools
   - Consider certification names
   - Include soft skills that are searchable

4. SKILLS:
   - Prioritize skills that appear in target job descriptions
   - Include both technical and soft skills
   - Add industry-specific tools and technologies
   - Consider emerging skills in the field

5. EXPERIENCE TIPS:
   - Each bullet should start with action verb
   - Include metrics and achievements
   - Use keywords from target industry
   - Show progression and impact`;

    const userPrompt = `ANALYZE AND OPTIMIZE THIS LINKEDIN PROFILE:

${targetRole ? `TARGET ROLE: ${targetRole}` : ''}

CURRENT LINKEDIN HEADLINE:
${currentHeadline || 'Not provided'}

CURRENT LINKEDIN ABOUT SECTION:
${currentAbout || 'Not provided'}

LINKEDIN URL: ${linkedinUrl || 'Not provided'}

RESUME CONTENT:
${resumeContent}

Please analyze the LinkedIn profile against the resume and provide comprehensive optimization recommendations. Focus on:
1. Consistency between LinkedIn and resume
2. Missing keywords that should be added
3. Three headline options (for visibility, job search, and thought leadership)
4. A fully rewritten, optimized About section
5. Skills to add
6. Specific tips for improving experience descriptions`;

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
    let optimizationData;
    try {
      let jsonString = textContent.text;
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      optimizationData = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', textContent.text);
      throw new Error('Failed to parse optimization data');
    }

    // Save to database
    const linkedinOptimization = await prisma.linkedInOptimization.create({
      data: {
        userId: session.user.id,
        resumeContent,
        linkedinUrl: linkedinUrl || null,
        currentHeadline: currentHeadline || null,
        currentAbout: currentAbout || null,
        targetRole: targetRole || null,
        consistencyScore: optimizationData.consistencyScore || 0,
        keywordsMatch: optimizationData.keywordsMatch || 0,
        experienceAlign: optimizationData.experienceAlign || 0,
        skillsCoverage: optimizationData.skillsCoverage || 0,
        suggestedHeadlines: optimizationData.suggestedHeadlines || [],
        optimizedAbout: optimizationData.optimizedAbout || null,
        missingKeywords: optimizationData.missingKeywords || [],
        skillsToAdd: optimizationData.skillsToAdd || [],
        experienceTips: optimizationData.experienceTips || [],
      },
    });

    return NextResponse.json({
      success: true,
      optimizationId: linkedinOptimization.id,
      data: {
        scores: {
          consistency: optimizationData.consistencyScore,
          keywords: optimizationData.keywordsMatch,
          experience: optimizationData.experienceAlign,
          skills: optimizationData.skillsCoverage,
          overall: Math.round(
            (optimizationData.consistencyScore +
              optimizationData.keywordsMatch +
              optimizationData.experienceAlign +
              optimizationData.skillsCoverage) / 4
          ),
        },
        analysis: optimizationData.analysis,
        suggestedHeadlines: optimizationData.suggestedHeadlines,
        optimizedAbout: optimizationData.optimizedAbout,
        missingKeywords: optimizationData.missingKeywords,
        skillsToAdd: optimizationData.skillsToAdd,
        experienceTips: optimizationData.experienceTips,
      },
    });
  } catch (error) {
    console.error('LinkedIn optimization error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze LinkedIn profile' },
      { status: 500 }
    );
  }
}
