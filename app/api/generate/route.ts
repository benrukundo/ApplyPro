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
  tailoredResume: string;
  coverLetter: string;
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

TASK 1 - TAILORED RESUME:
Rewrite the resume to perfectly match this job description. Follow these guidelines:
- Keep ALL truthful information from the original resume - never fabricate experience
- Strategically highlight relevant experience that directly matches job requirements
- Incorporate keywords and phrases from the job description for ATS (Applicant Tracking System) optimization
- Quantify achievements with specific numbers, percentages, and metrics wherever possible
- Use strong action verbs (e.g., "Led," "Increased," "Implemented," "Designed," "Optimized")
- Maintain professional formatting with clear sections (Summary, Experience, Skills, Education)
- Keep content concise and impactful - aim for 1-2 pages worth of content
- Prioritize the most relevant experience first
- Remove or de-emphasize less relevant experience
- Ensure the summary/objective directly addresses the target role

TASK 2 - COVER LETTER:
Write a compelling, personalized cover letter (250-350 words) that:
- Opens with genuine enthusiasm for the specific role and company
- Directly addresses 2-3 key requirements from the job description
- Tells a brief story connecting the candidate's experience to the role's challenges
- Demonstrates understanding of the company's mission, values, or recent achievements
- Highlights 1-2 specific accomplishments that prove capability
- Shows personality while maintaining professionalism
- Closes with a clear call to action and availability for interview
- Uses a warm, confident, and professional tone

TASK 3 - MATCH SCORE:
Calculate a realistic match score (0-100) based on:
- Skills alignment
- Experience relevance
- Qualification level
- Keywords coverage

IMPORTANT: Return your response in valid JSON format with no markdown formatting, no code blocks, no additional text. Just pure JSON.

Response format:
{
  "tailoredResume": "Complete tailored resume text here with proper formatting and line breaks...",
  "coverLetter": "Complete cover letter text here with proper formatting...",
  "matchScore": 85
}`;

    console.log("Calling Claude API for full resume generation...");

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

    console.log("Claude API response received, parsing...");

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
      const resumeMatch = responseText.match(
        /"tailoredResume":\s*"([\s\S]*?)",?\s*"coverLetter"/
      );
      const coverLetterMatch = responseText.match(
        /"coverLetter":\s*"([\s\S]*?)",?\s*"matchScore"/
      );
      const scoreMatch = responseText.match(/"matchScore":\s*(\d+)/);

      if (resumeMatch && coverLetterMatch) {
        parsedResponse = {
          tailoredResume: resumeMatch[1].replace(/\\n/g, "\n"),
          coverLetter: coverLetterMatch[1].replace(/\\n/g, "\n"),
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
      !parsedResponse.tailoredResume ||
      !parsedResponse.coverLetter ||
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
    if (parsedResponse.tailoredResume.length < 200) {
      throw new Error(
        "Generated resume is too short. Please try again with more details."
      );
    }

    if (parsedResponse.coverLetter.length < 200) {
      throw new Error(
        "Generated cover letter is too short. Please try again."
      );
    }

    console.log("Successfully generated resume and cover letter");

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
