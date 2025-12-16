import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

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
    const systemPrompt = `You are an expert resume writer with 15+ years of experience. Create tailored resumes that maximize interview chances.

RULES:
- Keep ALL truthful information - never fabricate experience
- Incorporate keywords from job description naturally
- Quantify achievements with specific numbers/metrics
- Use strong action verbs (Led, Increased, Implemented, Optimized)
- Professional formatting with clear sections

Return ONLY valid JSON with no markdown, no code blocks, no extra text:
{"fullResume":"...","atsOptimizedResume":"...","coverLetter":"...","matchScore":85}`;

    const userPrompt = `RESUME:
${resumeText.substring(0, 4000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 3000)}

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

    // Save generated resume to history (optional - uncomment if GeneratedResume model exists)
    /*
    await prisma.generatedResume.create({
      data: {
        userId: session.user.id,
        fullResume: parsedResponse.fullResume,
        atsResume: parsedResponse.atsOptimizedResume,
        coverLetter: parsedResponse.coverLetter,
        matchScore: parsedResponse.matchScore,
      },
    });
    */

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
