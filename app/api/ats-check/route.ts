import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Type definitions for ATS analysis response
interface ATSCheckResponse {
  overallScore: number;
  formatScore: number;
  textExtractionScore: number;
  sectionScore: number;
  keywordScore: number;
  typographyScore: number;
  structureScore: number;

  // Detailed findings
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = (await import("pdf-parse" as any)).default;
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (fileName.endsWith(".docx")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mammoth = (await import("mammoth" as any)).default;
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 100) {
      return NextResponse.json(
        { error: "Could not extract enough text from the file. Please ensure your resume contains readable text." },
        { status: 400 }
      );
    }

    // Basic structure analysis
    const pageCount = Math.ceil(extractedText.length / 3000); // Rough estimate
    const fileSize = file.size;
    const hasMultiColumn = detectMultiColumn(extractedText);
    const hasTables = detectTables(extractedText);
    const hasGraphics = false; // Hard to detect in text extraction

    // Section detection
    const sectionsFound = detectSections(extractedText);

    // Check for API key
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "API configuration error - API key is missing" },
        { status: 500 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Create ATS analysis prompt
    const prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility.

Resume text:
${extractedText.substring(0, 3000)}

Provide a detailed ATS compatibility analysis in JSON format:

{
  "formatScore": <0-100>,
  "textExtractionScore": <0-100>,
  "keywordScore": <0-100>,
  "typographyScore": <0-100>,
  "formatIssues": ["issue1", "issue2"],
  "formatFixes": ["fix1", "fix2"],
  "parsingIssues": ["issue1", "issue2"],
  "keywordsFound": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "keywordRecommendations": ["keyword1", "keyword2", "keyword3"],
  "actionVerbCount": <number>,
  "typographyIssues": ["issue1", "issue2"],
  "criticalIssues": [
    {
      "issue": "description",
      "why": "explanation",
      "severity": "high|medium|low"
    }
  ]
}

Scoring criteria:
- formatScore: File format and layout compatibility (PDF/DOCX, single column, no graphics)
- textExtractionScore: How cleanly text can be extracted and parsed
- keywordScore: Presence of industry keywords, action verbs, relevant terms
- typographyScore: Use of standard fonts and formatting

Focus on ATS-specific issues like multi-column layouts, tables, graphics, special characters, and parsing problems.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 800,
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
    let aiAnalysis: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      aiAnalysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText);
      // Use fallback analysis
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

    // Calculate section score
    const foundSections = sectionsFound.filter(s => s.status === "found").length;
    const totalSections = sectionsFound.length;
    const sectionScore = Math.round((foundSections / totalSections) * 100);

    // Calculate structure score
    let structureScore = 100;
    if (hasMultiColumn) structureScore -= 30;
    if (hasTables) structureScore -= 20;
    if (pageCount > 2) structureScore -= 10;
    if (fileSize > 2 * 1024 * 1024) structureScore -= 10;
    structureScore = Math.max(0, structureScore);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      aiAnalysis.formatScore * 0.25 +
      aiAnalysis.textExtractionScore * 0.25 +
      sectionScore * 0.20 +
      aiAnalysis.keywordScore * 0.15 +
      aiAnalysis.typographyScore * 0.10 +
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

      extractedText: extractedText.substring(0, 1000), // Preview only
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

    // Handle specific Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API Error:", {
        status: error.status,
        message: error.message,
        name: error.name,
      });

      if (error.status === 401) {
        return NextResponse.json(
          { error: "API authentication error" },
          { status: 500 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Too many requests. Please try again in a moment." },
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

// Helper function to detect multi-column layout
function detectMultiColumn(text: string): boolean {
  // Look for patterns that suggest multi-column (lots of short lines)
  const lines = text.split("\n");
  const shortLines = lines.filter(line => line.trim().length > 0 && line.trim().length < 40).length;
  return shortLines > lines.length * 0.4;
}

// Helper function to detect tables
function detectTables(text: string): boolean {
  // Look for tab characters or multiple spaces suggesting table structure
  return text.includes("\t\t") || /\s{5,}/.test(text);
}

// Helper function to detect resume sections
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
      status: found ? "found" : "missing",
    };
  });
}

// Helper function to generate improvement checklist
function generateChecklist(
  aiAnalysis: any,
  sections: Array<{ name: string; status: string }>,
  hasMultiColumn: boolean,
  hasTables: boolean
): Array<{ item: string; completed: boolean }> {
  const checklist = [];

  if (hasMultiColumn) {
    checklist.push({
      item: "Convert to single-column layout",
      completed: false,
    });
  }

  if (hasTables) {
    checklist.push({
      item: "Remove tables and use plain text formatting",
      completed: false,
    });
  }

  const missingSections = sections.filter(s => s.status === "missing");
  if (missingSections.length > 0) {
    checklist.push({
      item: `Add missing sections: ${missingSections.map(s => s.name).join(", ")}`,
      completed: false,
    });
  }

  if (aiAnalysis.keywordScore < 70) {
    checklist.push({
      item: "Add more industry-specific keywords",
      completed: false,
    });
  }

  if (aiAnalysis.formatIssues && aiAnalysis.formatIssues.length > 0) {
    checklist.push({
      item: "Fix formatting issues identified",
      completed: false,
    });
  }

  if (aiAnalysis.typographyIssues && aiAnalysis.typographyIssues.length > 0) {
    checklist.push({
      item: "Use standard, ATS-friendly fonts",
      completed: false,
    });
  }

  // Always include these best practices
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

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
