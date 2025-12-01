import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Type definitions
interface PreviewRequest {
  resumeText: string;
  jobDescription: string;
}

interface PreviewResponse {
  matchScore: number;
  improvements: string[];
  missingKeywords: string[];
  previewText: string;
}

export async function POST(request: NextRequest) {
  try {
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
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Create cost-effective prompt
    const prompt = `Analyze this resume against this job description. Provide a structured analysis with:

1. Match score (0-100) - How well does the resume match the job requirements?
2. Top 5 specific improvements needed - Be concrete and actionable
3. 3 missing keywords for ATS - Keywords from the job description that should be in the resume
4. Preview text - First 100 words of what a tailored resume opening would say

Resume:
${resumeText.substring(0, 2000)}

Job Description:
${jobDescription.substring(0, 2000)}

Respond in this exact JSON format:
{
  "matchScore": <number 0-100>,
  "improvements": ["improvement 1", "improvement 2", "improvement 3", "improvement 4", "improvement 5"],
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "previewText": "First 100 words of tailored resume..."
}`;

    // Call Claude API with cost-effective settings
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Fastest and most cost-effective model
      max_tokens: 500, // Limit response length to minimize cost
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
        matchScore: 50,
        improvements: [
          "Unable to parse full analysis",
          "Please try again with a different resume or job description",
        ],
        missingKeywords: ["N/A"],
        previewText: responseText.substring(0, 200),
      };
    }

    // Validate parsed response structure
    if (
      typeof parsedResponse.matchScore !== "number" ||
      !Array.isArray(parsedResponse.improvements) ||
      !Array.isArray(parsedResponse.missingKeywords) ||
      typeof parsedResponse.previewText !== "string"
    ) {
      throw new Error("Invalid response format from Claude API");
    }

    // Ensure matchScore is within valid range
    parsedResponse.matchScore = Math.max(
      0,
      Math.min(100, parsedResponse.matchScore)
    );

    // Ensure arrays have the expected number of items
    parsedResponse.improvements = parsedResponse.improvements.slice(0, 5);
    parsedResponse.missingKeywords = parsedResponse.missingKeywords.slice(0, 3);

    // Return successful response
    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error("Error in preview API:", error);

    // Handle specific Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key configuration" },
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
