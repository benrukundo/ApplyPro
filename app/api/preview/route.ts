import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per window (more lenient for free preview)
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

// Sanitize user input
function sanitizeInput(text: string): string {
  return text
    .replace(/\b(ignore|disregard|forget)\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, '[REMOVED]')
    .replace(/\b(you\s+are|act\s+as|pretend\s+to\s+be|roleplay\s+as)\b/gi, '[REMOVED]')
    .replace(/<\/?[a-z]+>/gi, '')
    .trim();
}

// Type definitions
interface PreviewRequest {
  resumeText: string;
  jobDescription: string;
}

interface PreviewResponse {
  overallScore: number;
  atsScore: number;
  keywordScore: number;
  experienceScore: number;
  skillsScore: number;
  matchedKeywords: string[];
  missingKeywords: Array<{keyword: string; priority: string; context: string}>;
  improvements: Array<{issue: string; fix: string; impact: string}>;
  strengths: string[];
  insights: string[];
  previewText: string;
  keywordStats: {
    matched: number;
    total: number;
  };
}

// Input limits (reduced for cost optimization)
const MAX_RESUME_CHARS = 1500;
const MAX_JOB_DESC_CHARS = 1500;
const MAX_OUTPUT_TOKENS = 800;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please try again in ${rateCheck.retryAfter} seconds.` },
        { 
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfter) }
        }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Parse request body
    const body: PreviewRequest = await request.json();
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
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 500 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Optimized prompt with system message
    const systemPrompt = `You are a resume analyst. Analyze resumes against job descriptions concisely.

Return ONLY valid JSON:
{"overallScore":<0-100>,"atsScore":<0-100>,"keywordScore":<0-100>,"experienceScore":<0-100>,"skillsScore":<0-100>,"matchedKeywords":["kw1","kw2"],"missingKeywords":[{"keyword":"x","priority":"high","context":"why"}],"improvements":[{"issue":"x","fix":"y","impact":"high"}],"strengths":["s1","s2"],"insights":["i1"],"previewText":"Brief tailored opening...","keywordStats":{"matched":5,"total":10}}`;

    const userPrompt = `Resume:
${resumeText.substring(0, MAX_RESUME_CHARS)}

Job:
${jobDescription.substring(0, MAX_JOB_DESC_CHARS)}

Analyze and score. Be concise.`;

    // Call Claude API with Haiku 3.5
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: MAX_OUTPUT_TOKENS,
      temperature: 0.5, // Lower temperature for more consistent, shorter responses
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
    let parsedResponse: PreviewResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response
      parsedResponse = {
        overallScore: 50,
        atsScore: 50,
        keywordScore: 50,
        experienceScore: 50,
        skillsScore: 50,
        matchedKeywords: [],
        missingKeywords: [
          { keyword: "Analysis unavailable", priority: "low", context: "Please try again" }
        ],
        improvements: [
          { issue: "Unable to complete analysis", fix: "Please try again", impact: "low" }
        ],
        strengths: [],
        insights: [],
        previewText: "Analysis could not be completed. Please try again.",
        keywordStats: { matched: 0, total: 0 }
      };
    }

    // Validate and sanitize response
    if (typeof parsedResponse.overallScore !== "number") parsedResponse.overallScore = 50;
    if (typeof parsedResponse.atsScore !== "number") parsedResponse.atsScore = 50;
    if (typeof parsedResponse.keywordScore !== "number") parsedResponse.keywordScore = 50;
    if (typeof parsedResponse.experienceScore !== "number") parsedResponse.experienceScore = 50;
    if (typeof parsedResponse.skillsScore !== "number") parsedResponse.skillsScore = 50;
    if (!Array.isArray(parsedResponse.matchedKeywords)) parsedResponse.matchedKeywords = [];
    if (!Array.isArray(parsedResponse.missingKeywords)) parsedResponse.missingKeywords = [];
    if (!Array.isArray(parsedResponse.improvements)) parsedResponse.improvements = [];
    if (!Array.isArray(parsedResponse.strengths)) parsedResponse.strengths = [];
    if (!Array.isArray(parsedResponse.insights)) parsedResponse.insights = [];
    if (typeof parsedResponse.previewText !== "string") parsedResponse.previewText = "";
    if (typeof parsedResponse.keywordStats !== "object") parsedResponse.keywordStats = { matched: 0, total: 0 };

    // Clamp scores to valid range
    parsedResponse.overallScore = Math.max(0, Math.min(100, parsedResponse.overallScore));
    parsedResponse.atsScore = Math.max(0, Math.min(100, parsedResponse.atsScore));
    parsedResponse.keywordScore = Math.max(0, Math.min(100, parsedResponse.keywordScore));
    parsedResponse.experienceScore = Math.max(0, Math.min(100, parsedResponse.experienceScore));
    parsedResponse.skillsScore = Math.max(0, Math.min(100, parsedResponse.skillsScore));

    // Limit array sizes
    parsedResponse.matchedKeywords = parsedResponse.matchedKeywords.slice(0, 8);
    parsedResponse.missingKeywords = parsedResponse.missingKeywords.slice(0, 4);
    parsedResponse.improvements = parsedResponse.improvements.slice(0, 4);
    parsedResponse.strengths = parsedResponse.strengths.slice(0, 4);
    parsedResponse.insights = parsedResponse.insights.slice(0, 2);

    return NextResponse.json(parsedResponse, { status: 200 });
    
  } catch (error) {
    console.error("Error in preview API:", error);

    // Generic error response (don't leak internal details)
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API Error:", error.status, error.message);
      
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Service is busy. Please try again in a moment." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
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
