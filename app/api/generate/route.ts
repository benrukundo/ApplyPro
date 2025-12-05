import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Type definitions
interface GenerateRequest {
  resumeText: string;
  jobDescription: string;
}

interface GenerateResponse {
  fullResume: string;
  atsOptimizedResume: string;
  matchScore: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateRequest = await request.json();
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

    // Create comprehensive prompt for high-quality results
    const prompt = `You are an expert resume writer and career coach with 15+ years of experience. Create a professionally tailored resume and cover letter that will maximize the candidate's chances of getting an interview.

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

TASK 1 - FULL TAILORED RESUME:
Create a comprehensive, well-formatted resume that perfectly matches this job description. Follow these guidelines:
- Keep ALL truthful information from the original resume - never fabricate experience
- Strategically highlight relevant experience that directly matches job requirements
- Incorporate keywords and phrases from the job description naturally
- Quantify achievements with specific numbers, percentages, and metrics wherever possible
- Use strong action verbs (e.g., "Led," "Increased," "Implemented," "Designed," "Optimized")
- Maintain professional formatting with clear sections (Summary, Experience, Skills, Education)
- Keep content concise and impactful - aim for 1-2 pages worth of content
- Prioritize the most relevant experience first
- Remove or de-emphasize less relevant experience
- Ensure the summary/objective directly addresses the target role
- Use professional formatting with proper spacing and structure

TASK 2 - ATS-OPTIMIZED RESUME:
Create a second version of the resume specifically optimized for Applicant Tracking Systems (ATS):
- Use simple, clean formatting without tables, columns, or graphics
- Place all keywords from the job description strategically throughout
- Use standard section headings (Professional Summary, Work Experience, Skills, Education)
- Avoid special characters, headers, footers, or text boxes
- List skills exactly as they appear in the job description
- Use standard bullet points (no fancy symbols)
- Ensure all dates are in a consistent format (MM/YYYY)
- Include a skills section with exact keyword matches
- Make it highly scannable by ATS software

TASK 3 - MATCH SCORE:
Calculate a realistic match score (0-100) based on:
- Skills alignment
- Experience relevance
- Qualification level
- Keywords coverage

IMPORTANT: Return your response in valid JSON format with no markdown formatting, no code blocks, no additional text. Just pure JSON.

Response format:
{
  "fullResume": "Complete full tailored resume text here with proper formatting and line breaks...",
  "atsOptimizedResume": "Complete ATS-optimized resume text here with simple formatting...",
  "matchScore": 85
}`;

    // Call Claude API with Sonnet 4 for high quality
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Claude Sonnet 4 - high quality
      max_tokens: 4000, // Allow for complete resume and cover letter
      temperature: 0.7, // Balance between creativity and consistency
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
    let parsedResponse: GenerateResponse;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText);
      console.error("Parse error:", parseError);

      // Fallback: Try to extract content manually if JSON parsing fails
      const fullResumeMatch = responseText.match(
        /"fullResume":\s*"([\s\S]*?)",?\s*"atsOptimizedResume"/
      );
      const atsResumeMatch = responseText.match(
        /"atsOptimizedResume":\s*"([\s\S]*?)",?\s*"matchScore"/
      );
      const scoreMatch = responseText.match(/"matchScore":\s*(\d+)/);

      if (fullResumeMatch && atsResumeMatch) {
        parsedResponse = {
          fullResume: fullResumeMatch[1].replace(/\\n/g, "\n"),
          atsOptimizedResume: atsResumeMatch[1].replace(/\\n/g, "\n"),
          matchScore: scoreMatch ? parseInt(scoreMatch[1]) : 85,
        };
      } else {
        // Last resort: return raw response with error indication
        return NextResponse.json(
          {
            error: "Failed to parse AI response. Please try again.",
            rawResponse: responseText.substring(0, 500),
          },
          { status: 500 }
        );
      }
    }

    // Validate parsed response structure
    if (
      !parsedResponse.fullResume ||
      !parsedResponse.atsOptimizedResume ||
      typeof parsedResponse.matchScore !== "number"
    ) {
      console.error("Invalid response structure:", parsedResponse);
      throw new Error("Invalid response format from Claude API");
    }

    // Ensure matchScore is within valid range
    parsedResponse.matchScore = Math.max(
      0,
      Math.min(100, parsedResponse.matchScore)
    );

    // Validate content quality (basic checks)
    if (parsedResponse.fullResume.length < 200) {
      throw new Error(
        "Generated resume is too short. Please try again with more details."
      );
    }

    if (parsedResponse.atsOptimizedResume.length < 200) {
      throw new Error(
        "Generated ATS-optimized resume is too short. Please try again."
      );
    }

    // Return successful response
    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error("Error in generate API:", error);

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
          {
            error:
              "Rate limit exceeded. Please try again in a moment. If this persists, contact support.",
          },
          { status: 429 }
        );
      }
      if (error.status === 529) {
        return NextResponse.json(
          {
            error:
              "Claude API is temporarily overloaded. Please try again in a few moments.",
          },
          { status: 503 }
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
            : "An unexpected error occurred. Please try again.",
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
