import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter
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

// Type definitions
interface ATSCheckResponse {
  overallScore: number;
  formatScore: number;
  textExtractionScore: number;
  sectionScore: number;
  keywordScore: number;
  typographyScore: number;
  structureScore: number;
  formatIssues: string[];
  formatFixes: string[];
  extractedText: string;
  parsingIssues: string[];
  sectionsFound: Array<{ name: string; status: "found" | "missing" | "unclear" }>;
  keywordsFound: string[];
  keywordRecommendations: string[];
  actionVerbCount: number;
  typographyIssues: string[];
  structureDetails: {
    pageCount: number;
    fileSize: number;
    hasMultiColumn: boolean;
    hasGraphics: boolean;
    hasTables: boolean;
  };
  criticalIssues: Array<{
    issue: string;
    why: string;
    severity: "high" | "medium" | "low";
  }>;
  checklist: Array<{
    item: string;
    completed: boolean;
  }>;
}

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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".pdf") && !fileName.endsWith(".docx")) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    // Extract text from file
    let extractedText = "";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (fileName.endsWith(".pdf")) {
      // Use unpdf - works in Node.js/serverless without browser APIs
      const { extractText } = await import('unpdf');
      const result = await extractText(buffer);
      extractedText = Array.isArray(result.text) ? result.text.join('\n') : result.text;
    } else if (fileName.endsWith(".docx")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mammoth = (await import("mammoth" as any)).default;
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 100) {
      return NextResponse.json(
        { error: "Could not extract enough text. Please ensure your resume contains readable text." },
        { status: 400 }
      );
    }

    // Basic structure analysis
    const pageCount = Math.ceil(extractedText.length / 3000);
    const fileSize = file.size;
    const hasMultiColumn = detectMultiColumn(extractedText);
    const hasTables = detectTables(extractedText);
    const hasGraphics = false;

    // Section detection
    const sectionsFound = detectSections(extractedText);

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
    const systemPrompt = `You are an ATS (Applicant Tracking System) expert. Analyze resumes for ATS compatibility.

Return ONLY valid JSON:
{
  "formatScore": <0-100>,
  "textExtractionScore": <0-100>,
  "keywordScore": <0-100>,
  "typographyScore": <0-100>,
  "formatIssues": ["issue1", "issue2"],
  "formatFixes": ["fix1", "fix2"],
  "parsingIssues": ["issue1"],
  "keywordsFound": ["keyword1", "keyword2"],
  "keywordRecommendations": ["keyword1"],
  "actionVerbCount": <number>,
  "typographyIssues": ["issue1"],
  "criticalIssues": [{"issue": "x", "why": "y", "severity": "high|medium|low"}]
}`;

    const userPrompt = `Analyze this resume for ATS compatibility:

${extractedText.substring(0, 3000)}

Focus on: formatting issues, keyword presence, parsing problems, typography.`;

    // Call Claude API with Haiku 3.5
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022", // Upgraded to Haiku 3.5
      max_tokens: 800,
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let aiAnalysis: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      aiAnalysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      aiAnalysis = {
        formatScore: 70,
        textExtractionScore: 80,
        keywordScore: 60,
        typographyScore: 75,
        formatIssues: ["Unable to fully analyze format"],
        formatFixes: ["Ensure single-column layout"],
        parsingIssues: [],
        keywordsFound: [],
        keywordRecommendations: ["Add industry-specific keywords"],
        actionVerbCount: 0,
        typographyIssues: [],
        criticalIssues: [],
      };
    }

    // Calculate scores
    const foundSections = sectionsFound.filter(s => s.status === "found").length;
    const totalSections = sectionsFound.length;
    const sectionScore = Math.round((foundSections / totalSections) * 100);

    let structureScore = 100;
    if (hasMultiColumn) structureScore -= 30;
    if (hasTables) structureScore -= 20;
    if (pageCount > 2) structureScore -= 10;
    if (fileSize > 2 * 1024 * 1024) structureScore -= 10;
    structureScore = Math.max(0, structureScore);

    const overallScore = Math.round(
      (aiAnalysis.formatScore || 70) * 0.25 +
      (aiAnalysis.textExtractionScore || 80) * 0.25 +
      sectionScore * 0.20 +
      (aiAnalysis.keywordScore || 60) * 0.15 +
      (aiAnalysis.typographyScore || 75) * 0.10 +
      structureScore * 0.05
    );

    // Generate checklist
    const checklist = generateChecklist(
      aiAnalysis,
      sectionsFound,
      hasMultiColumn,
      hasTables
    );

    // Build response
    const response: ATSCheckResponse = {
      overallScore,
      formatScore: aiAnalysis.formatScore || 70,
      textExtractionScore: aiAnalysis.textExtractionScore || 80,
      sectionScore,
      keywordScore: aiAnalysis.keywordScore || 60,
      typographyScore: aiAnalysis.typographyScore || 75,
      structureScore,
      formatIssues: aiAnalysis.formatIssues || [],
      formatFixes: aiAnalysis.formatFixes || [],
      extractedText: extractedText.substring(0, 1000),
      parsingIssues: aiAnalysis.parsingIssues || [],
      sectionsFound,
      keywordsFound: aiAnalysis.keywordsFound || [],
      keywordRecommendations: aiAnalysis.keywordRecommendations || [],
      actionVerbCount: aiAnalysis.actionVerbCount || 0,
      typographyIssues: aiAnalysis.typographyIssues || [],
      structureDetails: {
        pageCount,
        fileSize,
        hasMultiColumn,
        hasGraphics,
        hasTables,
      },
      criticalIssues: aiAnalysis.criticalIssues || [],
      checklist,
    };

    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error("Error in ATS check API:", error);

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
      { error: "ATS check failed. Please try again." },
      { status: 500 }
    );
  }
}

// Helper functions
function detectMultiColumn(text: string): boolean {
  const lines = text.split("\n");
  const shortLines = lines.filter(line => line.trim().length > 0 && line.trim().length < 40).length;
  return shortLines > lines.length * 0.4;
}

function detectTables(text: string): boolean {
  return text.includes("\t\t") || /\s{5,}/.test(text);
}

function detectSections(text: string): Array<{ name: string; status: "found" | "missing" | "unclear" }> {
  const sections = [
    { name: "Contact Information", patterns: [/contact|email|phone|linkedin/i] },
    { name: "Work Experience", patterns: [/experience|employment|work history/i] },
    { name: "Education", patterns: [/education|degree|university|college/i] },
    { name: "Skills", patterns: [/skills|competencies|technologies/i] },
    { name: "Summary", patterns: [/summary|objective|profile|about/i] },
  ];

  return sections.map(section => {
    const found = section.patterns.some(pattern => pattern.test(text));
    return {
      name: section.name,
      status: found ? "found" as const : "missing" as const,
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateChecklist(
  aiAnalysis: any,
  sections: Array<{ name: string; status: string }>,
  hasMultiColumn: boolean,
  hasTables: boolean
): Array<{ item: string; completed: boolean }> {
  const checklist = [];

  if (hasMultiColumn) {
    checklist.push({ item: "Convert to single-column layout", completed: false });
  }

  if (hasTables) {
    checklist.push({ item: "Remove tables and use plain text formatting", completed: false });
  }

  const missingSections = sections.filter(s => s.status === "missing");
  if (missingSections.length > 0) {
    checklist.push({
      item: `Add missing sections: ${missingSections.map(s => s.name).join(", ")}`,
      completed: false,
    });
  }

  if (aiAnalysis.keywordScore < 70) {
    checklist.push({ item: "Add more industry-specific keywords", completed: false });
  }

  if (aiAnalysis.formatIssues && aiAnalysis.formatIssues.length > 0) {
    checklist.push({ item: "Fix formatting issues identified", completed: false });
  }

  if (aiAnalysis.typographyIssues && aiAnalysis.typographyIssues.length > 0) {
    checklist.push({ item: "Use standard, ATS-friendly fonts", completed: false });
  }

  checklist.push({
    item: "Use standard section headings (Experience, Education, Skills)",
    completed: sections.filter(s => s.status === "found").length >= 4,
  });

  checklist.push({
    item: "Include relevant keywords from job description",
    completed: aiAnalysis.keywordScore >= 80,
  });

  return checklist;
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
