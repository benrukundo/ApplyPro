"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import {
  Upload,
  CheckCircle2,
  FileText,
  Search,
  Target,
  Type,
  Layout,
  Loader2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Award,
  Shield,
  Zap,
  Star,
} from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ATSResult {
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

export default function ATSCheckerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError("");
    const uploadedFile = acceptedFiles[0];

    if (!uploadedFile) return;

    // Validate file size
    if (uploadedFile.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const fileName = uploadedFile.name.toLowerCase();
    if (!fileName.endsWith(".pdf") && !fileName.endsWith(".docx")) {
      setError("Please upload a PDF or DOCX file");
      return;
    }

    setFile(uploadedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ats-check", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setResult(data);
      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Error analyzing resume:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 81) return "text-green-600 dark:text-green-400";
    if (score >= 61) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 81) return "bg-green-600";
    if (score >= 61) return "bg-yellow-600";
    return "bg-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 81) return "✅ ATS-Friendly Resume";
    if (score >= 61) return "⚠️ May have issues with some ATS";
    return "❌ Likely to be rejected by ATS";
  };

  const getSeverityColor = (severity: string) => {
    if (severity === "high") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (severity === "medium") return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
            <Target className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
            Free ATS Resume Checker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6">
            Check if your resume can pass Applicant Tracking Systems. Get instant feedback on formatting, keywords, and readability.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>No signup required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>100% free</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Instant results</span>
            </div>
          </div>

          {/* Upload Area */}
          <div className="max-w-2xl mx-auto">
            <div
              {...getRootProps()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                  : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
              } ${file ? "bg-green-50 dark:bg-green-950/20" : ""}`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Click or drag to replace
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {isDragActive
                        ? "Drop your resume here"
                        : "Drop your resume here or click to upload"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      PDF or DOCX • Max 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className={`mt-6 w-full flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all ${
                !file || isAnalyzing
                  ? "cursor-not-allowed bg-gray-400 dark:bg-gray-700"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-xl"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Analyzing Your Resume...
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6" />
                  Check My Resume - Free
                </>
              )}
            </button>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
              <Shield className="inline h-4 w-4 mr-1" />
              Your resume is analyzed securely and not stored
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-20 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                1. Upload Your Resume
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Drag and drop your PDF or DOCX resume file
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                2. AI Analyzes ATS Compatibility
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI checks formatting, keywords, and structure
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                3. Get Instant Feedback
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive detailed analysis and actionable improvements
              </p>
            </div>
          </div>
        </div>

        {/* What We Check Section */}
        <div className="mt-20 mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            What We Check
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Our ATS checker analyzes 6 critical aspects of your resume
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                📄 Formatting
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clean, machine-readable structure that ATS can parse correctly
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <Type className="h-10 w-10 text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🔤 Text Parsing
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How well ATS systems can extract and read your text content
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <Search className="h-10 w-10 text-green-600 dark:text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🔑 Keywords
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Industry-specific terms and action verbs presence
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <Layout className="h-10 w-10 text-orange-600 dark:text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                📊 Sections
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Standard headings like Experience, Education, and Skills
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <Type className="h-10 w-10 text-red-600 dark:text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                📝 Fonts & Styles
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ATS-friendly typography and formatting choices
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <Target className="h-10 w-10 text-pink-600 dark:text-pink-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                📐 Structure
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Single vs multi-column layout and file optimization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <section id="results" className="bg-gray-50 dark:bg-gray-950 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {/* Overall Score */}
              <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Your ATS Compatibility Score
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Based on comprehensive analysis of your resume
                  </p>

                  {/* Circular Progress */}
                  <div className="flex justify-center mb-6">
                    <div className="relative w-48 h-48">
                      <svg className="transform -rotate-90 w-48 h-48">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 88}`}
                          strokeDashoffset={`${2 * Math.PI * 88 * (1 - result.overallScore / 100)}`}
                          className={`transition-all duration-1000 ease-out ${
                            result.overallScore >= 81
                              ? "text-green-500"
                              : result.overallScore >= 61
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
                          {result.overallScore}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          out of 100
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className={`text-2xl font-semibold ${getScoreColor(result.overallScore)} mb-4`}>
                    {getScoreLabel(result.overallScore)}
                  </p>
                </div>
              </div>

              {/* Score Breakdown Cards */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Detailed Breakdown
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Format Compatibility */}
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Format Compatibility
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className={`text-4xl font-bold ${getScoreColor(result.formatScore)}`}>
                        {result.formatScore}
                      </span>
                      <span className="text-sm text-gray-500">/100</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                      <div
                        className={`h-full transition-all duration-500 ${getScoreBgColor(result.formatScore)}`}
                        style={{ width: `${result.formatScore}%` }}
                      />
                    </div>
                    {result.formatIssues.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Issues Found:
                        </p>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          {result.formatIssues.slice(0, 3).map((issue, i) => (
                            <li key={i}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Text Extraction */}
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3 mb-4">
                      <Type className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Text Extraction
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className={`text-4xl font-bold ${getScoreColor(result.textExtractionScore)}`}>
                        {result.textExtractionScore}
                      </span>
                      <span className="text-sm text-gray-500">/100</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                      <div
                        className={`h-full transition-all duration-500 ${getScoreBgColor(result.textExtractionScore)}`}
                        style={{ width: `${result.textExtractionScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {result.parsingIssues.length === 0
                        ? "Text extracts cleanly from your resume"
                        : `${result.parsingIssues.length} parsing issues detected`}
                    </p>
                  </div>

                  {/* Section Detection */}
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3 mb-4">
                      <Layout className="h-8 w-8 text-green-600 dark:text-green-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Section Detection
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className={`text-4xl font-bold ${getScoreColor(result.sectionScore)}`}>
                        {result.sectionScore}
                      </span>
                      <span className="text-sm text-gray-500">/100</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                      <div
                        className={`h-full transition-all duration-500 ${getScoreBgColor(result.sectionScore)}`}
                        style={{ width: `${result.sectionScore}%` }}
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      {result.sectionsFound.map((section, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {section.status === "found" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                          <span className="text-gray-600 dark:text-gray-400">
                            {section.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3 mb-4">
                      <Search className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Keywords
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className={`text-4xl font-bold ${getScoreColor(result.keywordScore)}`}>
                        {result.keywordScore}
                      </span>
                      <span className="text-sm text-gray-500">/100</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                      <div
                        className={`h-full transition-all duration-500 ${getScoreBgColor(result.keywordScore)}`}
                        style={{ width: `${result.keywordScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {result.actionVerbCount} action verbs found
                    </p>
                    {result.keywordsFound.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.keywordsFound.slice(0, 3).map((keyword, i) => (
                          <span
                            key={i}
                            className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Typography */}
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3 mb-4">
                      <Type className="h-8 w-8 text-red-600 dark:text-red-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Typography
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className={`text-4xl font-bold ${getScoreColor(result.typographyScore)}`}>
                        {result.typographyScore}
                      </span>
                      <span className="text-sm text-gray-500">/100</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                      <div
                        className={`h-full transition-all duration-500 ${getScoreBgColor(result.typographyScore)}`}
                        style={{ width: `${result.typographyScore}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {result.typographyIssues.length === 0
                        ? "Typography is ATS-friendly"
                        : `${result.typographyIssues.length} typography issues`}
                    </p>
                  </div>

                  {/* Structure */}
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        File Structure
                      </h4>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className={`text-4xl font-bold ${getScoreColor(result.structureScore)}`}>
                        {result.structureScore}
                      </span>
                      <span className="text-sm text-gray-500">/100</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
                      <div
                        className={`h-full transition-all duration-500 ${getScoreBgColor(result.structureScore)}`}
                        style={{ width: `${result.structureScore}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Pages: {result.structureDetails.pageCount}</p>
                      <p>Size: {(result.structureDetails.fileSize / 1024).toFixed(0)} KB</p>
                      {result.structureDetails.hasMultiColumn && (
                        <p className="text-red-600 dark:text-red-400">⚠️ Multi-column detected</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Critical Issues */}
              {result.criticalIssues.length > 0 && (
                <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-6 dark:border-red-900/50 dark:from-red-950/20 dark:to-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      🚨 Critical ATS Blockers Found
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    These issues are likely to cause your resume to be rejected by ATS systems
                  </p>
                  <div className="space-y-4">
                    {result.criticalIssues.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-white p-4 border border-red-200 dark:bg-gray-800 dark:border-red-900/50"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {item.issue}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(item.severity)}`}>
                            {item.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.why}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement Checklist */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    ✅ Your ATS Optimization Checklist
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Complete these improvements to boost your ATS score
                </p>
                <div className="space-y-3">
                  {result.checklist.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        readOnly
                        className="mt-1 h-5 w-5 rounded border-gray-300"
                      />
                      <span
                        className={`text-sm ${
                          item.completed
                            ? "text-green-700 dark:text-green-400 line-through"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {result.checklist.filter(item => item.completed).length} / {result.checklist.length}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-green-600 transition-all duration-500"
                      style={{
                        width: `${(result.checklist.filter(item => item.completed).length / result.checklist.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Before/After Preview */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  What ATS Systems See
                </h3>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      📄 Your Formatted Resume
                    </h4>
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 h-64 overflow-hidden">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        [Your resume with formatting, fonts, and layout]
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      🤖 What ATS Extracts
                    </h4>
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 h-64 overflow-auto">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                        {result.extractedText}
                      </pre>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  The right side shows what Applicant Tracking Systems actually read from your resume.
                  If information is missing or garbled, ATS won't see it.
                </p>
              </div>

              {/* Upgrade CTA */}
              <div className="rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-purple-600 p-8 shadow-xl">
                <div className="text-center text-white">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">
                    Want an ATS-Optimized Resume Automatically?
                  </h3>
                  <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                    Our AI can fix all these issues and tailor your resume to any job description
                  </p>

                  {/* Benefits */}
                  <div className="grid gap-3 md:grid-cols-2 max-w-3xl mx-auto mb-8 text-left">
                    <div className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Auto-optimized for ATS systems</span>
                    </div>
                    <div className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Tailored to specific job descriptions</span>
                    </div>
                    <div className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Professional templates (all ATS-friendly)</span>
                    </div>
                    <div className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Matching cover letter included</span>
                    </div>
                    <div className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Fix all ATS blockers automatically</span>
                    </div>
                    <div className="flex items-start gap-3 text-white">
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Only $4.99 for 3 resumes</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                    <Link
                      href="/generate"
                      className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-all hover:shadow-xl hover:scale-105 sm:w-auto"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Get AI-Optimized Resume - $4.99
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What is an ATS and Why Does It Matter?
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                An Applicant Tracking System (ATS) is software used by employers to manage job applications.
                Over 90% of Fortune 500 companies use ATS to filter resumes before a human ever sees them.
                These systems scan your resume for keywords, formatting, and relevant experience to determine
                if you're a good match for the position.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                If your resume isn't ATS-friendly, it may be automatically rejected regardless of your qualifications.
                Understanding how ATS works is crucial for job seekers in today's market. The right formatting,
                keywords, and structure can mean the difference between landing an interview and never hearing back.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Common ATS Mistakes to Avoid
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Using Tables and Text Boxes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ATS struggles to parse content in tables, text boxes, or columns. Use simple formatting instead.
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Creative Section Headings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stick to standard headings like "Experience" and "Education" rather than creative alternatives.
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Images and Graphics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ATS cannot read text embedded in images. Keep all content as actual text.
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Missing Keywords
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Not including keywords from the job description will cause your resume to rank poorly.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How to Make Your Resume ATS-Friendly
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Use Standard Formatting
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Stick to single-column layouts, standard fonts (Arial, Calibri, Times New Roman),
                    and simple bullet points. Avoid headers, footers, and text boxes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Include Relevant Keywords
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mirror the language used in the job description. Include technical skills,
                    certifications, and industry terms exactly as they appear in the posting.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Use Standard Section Headings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Label sections clearly: "Work Experience," "Education," "Skills," "Certifications."
                    ATS looks for these specific headings to categorize your information.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Save in the Right Format
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unless otherwise specified, use .docx or PDF format. Avoid image-based PDFs
                    or unusual file formats that ATS may not be able to parse.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 dark:bg-gray-950 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                question: "What is an Applicant Tracking System?",
                answer:
                  "An Applicant Tracking System (ATS) is software that helps employers manage job applications. It automatically scans, ranks, and filters resumes based on keywords, formatting, and qualifications before human recruiters review them.",
              },
              {
                question: "How accurate is this ATS checker?",
                answer:
                  "Our ATS checker uses AI technology combined with industry best practices to analyze your resume. While we strive for high accuracy, real ATS systems vary by vendor. Our tool provides a comprehensive assessment based on common ATS requirements.",
              },
              {
                question: "Is my resume data stored?",
                answer:
                  "No. Your resume is processed in real-time and is not stored on our servers. We prioritize your privacy and security. Once the analysis is complete, your data is immediately discarded.",
              },
              {
                question: "Can I check multiple resumes?",
                answer:
                  "Yes! Our free ATS checker has no limits. You can check as many resumes as you'd like to test different versions and improvements.",
              },
              {
                question: "What file formats are supported?",
                answer:
                  "We support PDF and DOCX file formats, which are the most common formats accepted by ATS systems. Maximum file size is 5MB.",
              },
              {
                question: "How is this different from your paid service?",
                answer:
                  "The free ATS checker analyzes your existing resume for compatibility issues. Our paid service ($4.99) uses AI to automatically fix all issues, tailor your resume to specific job descriptions, and provides professional formatting in multiple templates.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  {expandedFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Perfect Resume?
          </h2>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Join 1,000+ job seekers who landed their dream jobs with AI-optimized resumes
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <ArrowRight className="h-5 w-5" />
            Get Started - $4.99
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2024 ApplyPro. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
