import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Parse request body
    const body: PreviewRequest = await request.json();
    const { resumeText, jobDescription } = body;

    // Validate inputs
    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "Resume text is required and must be a string" },
        { status: 400 }
      );
    }

    if (!jobDescription || typeof jobDescription !== "string") {
      return NextResponse.json(
        { error: "Job description is required and must be a string" },
        { status: 400 }
      );
    }

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
        { error: "API configuration error - API key is missing" },
        { status: 500 }
      );
    }

    // Initialize Anthropic client with the API key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Create comprehensive scoring prompt
    const prompt = `Analyze this resume against this job description. Provide detailed scoring and insights.

Resume:
${resumeText.substring(0, 2000)}

Job Description:
${jobDescription.substring(0, 2000)}

Respond in this exact JSON format:
{
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "keywordScore": <number 0-100>,
  "experienceScore": <number 0-100>,
  "skillsScore": <number 0-100>,
  "matchedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "missingKeywords": [
    {"keyword": "keyword1", "priority": "high|medium|low", "context": "why this matters"},
    {"keyword": "keyword2", "priority": "high|medium|low", "context": "why this matters"},
    {"keyword": "keyword3", "priority": "high|medium|low", "context": "why this matters"}
  ],
  "improvements": [
    {"issue": "specific issue", "fix": "how to fix", "impact": "high|medium|low"},
    {"issue": "specific issue", "fix": "how to fix", "impact": "high|medium|low"},
    {"issue": "specific issue", "fix": "how to fix", "impact": "high|medium|low"}
  ],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "insights": ["strategic insight 1", "strategic insight 2"],
  "previewText": "First 100 words of tailored resume opening...",
  "keywordStats": {
    "matched": <number>,
    "total": <number>
  }
}

Scoring criteria:
- overallScore: Holistic match between resume and job (0-100)
- atsScore: ATS compatibility (formatting, keywords, structure)
- keywordScore: % of job keywords found in resume
- experienceScore: Relevance of past experience to job requirements
- skillsScore: Technical/soft skills alignment with job needs`;

    // Call Claude API with cost-effective settings
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Fastest and most cost-effective model
      max_tokens: 1000, // Increased for comprehensive scoring data
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!responseText) {
      throw new Error("No response from Claude API");
    }

    // Parse JSON from response
    let parsedResponse: PreviewResponse;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText);
      // Fallback: try to extract information manually
      parsedResponse = {
        overallScore: 50,
        atsScore: 50,
        keywordScore: 50,
        experienceScore: 50,
        skillsScore: 50,
        matchedKeywords: [],
        missingKeywords: [
          { keyword: "N/A", priority: "low", context: "Unable to parse analysis" }
        ],
        improvements: [
          { issue: "Unable to parse full analysis", fix: "Please try again", impact: "low" }
        ],
        strengths: [],
        insights: [],
        previewText: responseText.substring(0, 200),
        keywordStats: { matched: 0, total: 0 }
      };
    }

    // Validate parsed response structure
    if (
      typeof parsedResponse.overallScore !== "number" ||
      typeof parsedResponse.atsScore !== "number" ||
      typeof parsedResponse.keywordScore !== "number" ||
      typeof parsedResponse.experienceScore !== "number" ||
      typeof parsedResponse.skillsScore !== "number" ||
      !Array.isArray(parsedResponse.matchedKeywords) ||
      !Array.isArray(parsedResponse.missingKeywords) ||
      !Array.isArray(parsedResponse.improvements) ||
      !Array.isArray(parsedResponse.strengths) ||
      !Array.isArray(parsedResponse.insights) ||
      typeof parsedResponse.previewText !== "string" ||
      typeof parsedResponse.keywordStats !== "object"
    ) {
      throw new Error("Invalid response format from Claude API");
    }

    // Ensure scores are within valid range (0-100)
    parsedResponse.overallScore = Math.max(0, Math.min(100, parsedResponse.overallScore));
    parsedResponse.atsScore = Math.max(0, Math.min(100, parsedResponse.atsScore));
    parsedResponse.keywordScore = Math.max(0, Math.min(100, parsedResponse.keywordScore));
    parsedResponse.experienceScore = Math.max(0, Math.min(100, parsedResponse.experienceScore));
    parsedResponse.skillsScore = Math.max(0, Math.min(100, parsedResponse.skillsScore));

    // Ensure arrays are properly formatted
    parsedResponse.matchedKeywords = parsedResponse.matchedKeywords.slice(0, 10);
    parsedResponse.missingKeywords = parsedResponse.missingKeywords.slice(0, 5);
    parsedResponse.improvements = parsedResponse.improvements.slice(0, 5);
    parsedResponse.strengths = parsedResponse.strengths.slice(0, 5);
    parsedResponse.insights = parsedResponse.insights.slice(0, 3);

    // Return successful response
    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error("Error in preview API:", error);

    // Handle specific Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API Error:", {
        status: error.status,
        message: error.message,
        name: error.name,
      });

      if (error.status === 401) {
        return NextResponse.json(
          { error: `Invalid API key configuration: ${error.message}` },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
