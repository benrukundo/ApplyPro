import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { sendUsageAlertEmail, sendLimitReachedEmail } from '@/lib/emailTemplates';

/**
 * PAID GENERATION ENDPOINT
 * - Requires active subscription
 * - NO character limits on resume or job description (sends full content to AI)
 * - Uses Claude Sonnet 4 for highest quality output
 * - Saves generation history to database
 * - Free preview at /api/preview has 1500 char limits
 */

// Simple in-memory rate limiter (for production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

// Sanitize user input to prevent prompt injection
function sanitizeInput(text: string): string {
  return text
    .replace(/\b(ignore|disregard|forget)\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, '[REMOVED]')
    .replace(/\b(you\s+are|act\s+as|pretend\s+to\s+be|roleplay\s+as)\b/gi, '[REMOVED]')
    .replace(/<\/?[a-z]+>/gi, '')
    .trim();
}

// Extract job title and company from job description
function extractJobInfo(jobDescription: string): { jobTitle: string | null; company: string | null } {
  let jobTitle: string | null = null;
  let company: string | null = null;

  // Common patterns for job titles
  const titlePatterns = [
    /(?:job\s*title|position|role)\s*[:\-]?\s*([^\n,]+)/i,
    /(?:we(?:'re| are)\s+(?:looking|hiring|seeking)\s+(?:for\s+)?(?:a|an)\s+)([^\n,\.]+)/i,
    /^([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Manager|Designer|Analyst|Specialist|Coordinator|Director|Lead|Senior|Junior|Associate))/m,
  ];

  for (const pattern of titlePatterns) {
    const match = jobDescription.match(pattern);
    if (match && match[1]) {
      jobTitle = match[1].trim().substring(0, 100);
      break;
    }
  }

  // Common patterns for company names
  const companyPatterns = [
    /(?:company|organization|employer)\s*[:\-]?\s*([^\n,]+)/i,
    /(?:at|@)\s+([A-Z][a-zA-Z0-9\s&]+(?:Inc|LLC|Ltd|Corp|Company|Co)?\.?)/,
    /(?:about\s+)([A-Z][a-zA-Z0-9\s&]+)(?:\s+is\s+)/,
    /^([A-Z][a-zA-Z0-9\s&]+)(?:\s+is\s+(?:looking|hiring|seeking))/m,
  ];

  for (const pattern of companyPatterns) {
    const match = jobDescription.match(pattern);
    if (match && match[1]) {
      company = match[1].trim().substring(0, 100);
      break;
    }
  }

  return { jobTitle, company };
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateRequest {
  resumeText: string;
  jobDescription: string;
}

interface GenerateResponse {
  fullResume: string;
  atsOptimizedResume: string;
  coverLetter: string;
  matchScore: number;
}

// Track which users have already received usage alerts this billing period
// to avoid sending multiple emails
const usageAlertsSent = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate limiting by user ID
    const rateCheck = checkRateLimit(session.user.id);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please try again in ${rateCheck.retryAfter} seconds.` },
        { 
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfter) }
        }
      );
    }

    // Check if user can generate (has active subscription/credits)
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription. Please purchase a plan to generate resumes." },
        { status: 403 }
      );
    }

    // Check usage limits for subscription plans
    if (subscription.plan === 'monthly' || subscription.plan === 'yearly') {
      const MONTHLY_LIMIT = 100;
      
      // Reset monthly count if needed
      const now = new Date();
      const lastReset = new Date(subscription.lastResetDate);
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { monthlyUsageCount: 0, lastResetDate: now },
        });
        subscription.monthlyUsageCount = 0;
        
        // Clear usage alerts tracking for this user's new billing period
        usageAlertsSent.delete(session.user.id);
      }

      if (subscription.monthlyUsageCount >= MONTHLY_LIMIT) {
        return NextResponse.json(
          { error: `Monthly limit of ${MONTHLY_LIMIT} resumes reached. Resets on the 1st of next month.` },
          { status: 403 }
        );
      }
    }

    if (subscription.plan === 'pay-per-use') {
      if (subscription.monthlyUsageCount >= 3) {
        return NextResponse.json(
          { error: "All 3 resume credits used. Please purchase another pack." },
          { status: 403 }
        );
      }
    }

    // Parse request body
    const body: GenerateRequest = await request.json();
    let { resumeText, jobDescription } = body;

    // Store original inputs for history (before sanitization)
    const originalResumeSnippet = resumeText.substring(0, 500);
    const originalJobDescSnippet = jobDescription.substring(0, 500);

    // Validate inputs
    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "Resume text is required" },
        { status: 400 }
      );
    }

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    // Extract job info before sanitization
    const { jobTitle, company } = extractJobInfo(jobDescription);

    // Sanitize inputs
    resumeText = sanitizeInput(resumeText);
    jobDescription = sanitizeInput(jobDescription);

    if (resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Resume text is too short (minimum 50 characters)" },
        { status: 400 }
      );
    }

    if (jobDescription.trim().length < 100) {
      return NextResponse.json(
        { error: "Job description is too short (minimum 100 characters)" },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "Service configuration error. Please try again later." },
        { status: 500 }
      );
    }

    // Optimized prompt using system message (reduces tokens by ~40%)
const systemPrompt = `You are an expert resume writer. Create tailored resumes that maximize interview chances.

RULES:
- Keep ALL truthful information from the original resume
- Incorporate keywords from job description naturally
- Quantify achievements with specific numbers/metrics
- Use strong action verbs (Led, Increased, Implemented, Optimized)
- Never fabricate experience or skills

STRICT FORMAT FOR fullResume - Follow this EXACTLY:

[Full Name]
[email] | [phone] | [linkedin if provided]

PROFESSIONAL SUMMARY
[2-4 sentence compelling summary tailored to the target job]

PROFESSIONAL EXPERIENCE

[Job Title]
[Company Name], [City] | [Month Year] - [Month Year or Present]
• [Achievement bullet with specific metrics/results]
• [Achievement bullet with specific metrics/results]
• [Achievement bullet with specific metrics/results]

[Previous Job Title]
[Company Name], [City] | [Month Year] - [Month Year]
• [Achievement bullet]
• [Achievement bullet]

EDUCATION

[Degree Name in Field]
[University/School Name] | [Year] - [Year]

SKILLS
Technical: [comma-separated technical skills]
Professional: [comma-separated soft skills]

LANGUAGES
• [Language] ([Proficiency Level])

CERTIFICATIONS
• [Certification Name] ([Year])

IMPORTANT:
- Each job must have Job Title on its own line, then Company | Date on next line
- Use bullet points (•) not dashes for achievements
- Only include each date range ONCE per job
- Keep sections clearly separated
- Education should only contain degrees, not work experience

Return ONLY valid JSON with no markdown:
{"fullResume":"...","atsOptimizedResume":"...","coverLetter":"...","matchScore":85}`;
    // Paid users get much higher limits - no substring restriction needed
    const userPrompt = `RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Create:
1. fullResume: Comprehensive tailored resume (prioritize relevant experience, add keywords, quantify achievements)
2. atsOptimizedResume: Simple ATS version (no tables/columns/graphics, standard headings, exact keyword matches)
3. coverLetter: 250-350 word personalized cover letter
4. matchScore: Realistic 0-100 score based on skills/experience alignment`;

    // Call Claude API with Sonnet 4
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract text from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";
// DEBUG: Log raw AI response to see the format
console.log("=== RAW AI RESPONSE START ===");
console.log(responseText.substring(0, 2000)); // First 2000 chars
console.log("=== RAW AI RESPONSE END ===");

    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    // Parse JSON from response
    let parsedResponse: GenerateResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      
      // Fallback extraction
      const fullResumeMatch = responseText.match(/"fullResume":\s*"([\s\S]*?)",?\s*"atsOptimizedResume"/);
      const atsResumeMatch = responseText.match(/"atsOptimizedResume":\s*"([\s\S]*?)",?\s*"coverLetter"/);
      const coverLetterMatch = responseText.match(/"coverLetter":\s*"([\s\S]*?)",?\s*"matchScore"/);
      const scoreMatch = responseText.match(/"matchScore":\s*(\d+)/);

      if (fullResumeMatch && atsResumeMatch && coverLetterMatch) {
        parsedResponse = {
          fullResume: fullResumeMatch[1].replace(/\\n/g, "\n"),
          atsOptimizedResume: atsResumeMatch[1].replace(/\\n/g, "\n"),
          coverLetter: coverLetterMatch[1].replace(/\\n/g, "\n"),
          matchScore: scoreMatch ? parseInt(scoreMatch[1]) : 85,
        };
      } else {
        return NextResponse.json(
          { error: "Failed to generate resume. Please try again." },
          { status: 500 }
        );
      }
    }

    // Validate response
    if (!parsedResponse.fullResume || !parsedResponse.atsOptimizedResume || 
        !parsedResponse.coverLetter || typeof parsedResponse.matchScore !== "number") {
      return NextResponse.json(
        { error: "Failed to generate resume. Please try again." },
        { status: 500 }
      );
    }

    // Clamp match score
    parsedResponse.matchScore = Math.max(0, Math.min(100, parsedResponse.matchScore));

    // Validate content quality
    if (parsedResponse.fullResume.length < 200 || 
        parsedResponse.atsOptimizedResume.length < 200 ||
        parsedResponse.coverLetter.length < 100) {
      return NextResponse.json(
        { error: "Generated content too short. Please try again with more details." },
        { status: 500 }
      );
    }

    // Save generation to history
    try {
      await prisma.generatedResume.create({
        data: {
          userId: session.user.id,
          jobTitle: jobTitle,
          company: company,
          fullResume: parsedResponse.fullResume,
          atsResume: parsedResponse.atsOptimizedResume,
          coverLetter: parsedResponse.coverLetter,
          matchScore: parsedResponse.matchScore,
          originalResumeSnippet: originalResumeSnippet,
          jobDescriptionSnippet: originalJobDescSnippet,
        },
      });
      console.log(`Generation saved to history for user ${session.user.id}`);
    } catch (historyError) {
      // Log error but don't fail the request - user still gets their resume
      console.error('Failed to save generation to history:', historyError);
    }

    // Update usage count in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { monthlyUsageCount: { increment: 1 } },
    });

    // Log the generation
    await prisma.usageLog.create({
      data: {
        userId: session.user.id,
        generationCount: 1,
      },
    });

    // Check usage and send email alerts (async, don't wait)
    const newUsageCount = subscription.monthlyUsageCount + 1;
    const usagePercentage = (newUsageCount / subscription.monthlyLimit) * 100;
    const lastAlertSent = usageAlertsSent.get(session.user.id) || 0;

    // Send usage alerts asynchronously
    (async () => {
      try {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!user?.email) return;

        // Send alert at 80% usage (only once per billing period)
        if (usagePercentage >= 80 && usagePercentage < 100 && lastAlertSent < 80) {
          await sendUsageAlertEmail(
            user.email,
            user.name || '',
            newUsageCount,
            subscription.monthlyLimit,
            subscription.plan
          );
          usageAlertsSent.set(session.user.id, 80);
          console.log(`Usage alert (80%) email sent to ${user.email}`);
        }

        // Send limit reached email when hitting 100%
        if (newUsageCount >= subscription.monthlyLimit && lastAlertSent < 100) {
          await sendLimitReachedEmail(user.email, user.name || '', subscription.plan);
          usageAlertsSent.set(session.user.id, 100);
          console.log(`Limit reached email sent to ${user.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send usage alert email:', emailError);
      }
    })();

    return NextResponse.json(parsedResponse, { status: 200 });
    
  } catch (error) {
    console.error("Error in generate API:", error);

    // Handle Anthropic API errors without leaking internal details
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API Error:", error.status, error.message);
      
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Service configuration error. Please contact support." },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Service is busy. Please try again in a moment." },
          { status: 429 }
        );
      }
      if (error.status === 529) {
        return NextResponse.json(
          { error: "Service temporarily unavailable. Please try again in a few minutes." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate resume. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
