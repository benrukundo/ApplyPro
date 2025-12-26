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
  Sparkles,
  ChevronDown,
  Shield,
  Zap,
  X,
  File,
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError("");
    const uploadedFile = acceptedFiles[0];

    if (!uploadedFile) return;

    if (uploadedFile.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB");
      return;
    }

    const fileName = uploadedFile.name.toLowerCase();
    if (!fileName.endsWith(".pdf") && !fileName.endsWith(".docx")) {
      setError("Please upload a PDF or DOCX file");
      return;
    }

    setFile(uploadedFile);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setError("");
  };

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
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Error analyzing resume:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 81) return "text-green-600";
    if (score >= 61) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 81) return "bg-green-500";
    if (score >= 61) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 81) return "text-green-500";
    if (score >= 61) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 81) return { text: "ATS-Friendly", emoji: "✅", desc: "Your resume should pass most ATS systems" };
    if (score >= 61) return { text: "Needs Improvement", emoji: "⚠️", desc: "Some ATS systems may have trouble parsing your resume" };
    return { text: "At Risk", emoji: "❌", desc: "Your resume is likely to be rejected by ATS systems" };
  };

  const getSeverityColor = (severity: string) => {
    if (severity === "high") return "bg-red-100 text-red-700 border-red-200";
    if (severity === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const faqs = [
    {
      question: "What is an Applicant Tracking System (ATS)?",
      answer: "An ATS is software used by employers to manage job applications. It automatically scans and filters resumes based on keywords, formatting, and qualifications before human recruiters see them. Over 90% of large companies use ATS.",
    },
    {
      question: "How accurate is this ATS checker?",
      answer: "Our checker uses AI to analyze your resume against common ATS requirements. While real ATS systems vary, we test for the most critical compatibility factors that affect most systems.",
    },
    {
      question: "Is my resume data stored?",
      answer: "No. Your resume is processed in real-time and immediately discarded after analysis. We do not store your resume content on our servers.",
    },
    {
      question: "Can I check multiple resumes?",
      answer: "Yes! This tool is completely free with no limits. Check as many versions as you need to optimize your resume.",
    },
    {
      question: "What's the difference between this and the paid service?",
      answer: "This free tool analyzes your existing resume for ATS issues. Our paid service ($4.99) uses AI to automatically fix all issues, tailor your resume to specific jobs, and generate matching cover letters.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-100/40 to-cyan-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>100% Free • No Signup Required</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Free ATS Resume Checker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Check if your resume can pass Applicant Tracking Systems. Get instant feedback on formatting, keywords, and compatibility.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Instant results</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Data not stored</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Unlimited checks</span>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {!file ? (
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-green-400 hover:bg-green-50/50 bg-gray-50/50"
                }`}
              >
                <input {...getInputProps()} />
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-colors ${
                  isDragActive ? "bg-green-100" : "bg-white border-2 border-gray-200"
                }`}>
                  <Upload className={`w-7 h-7 ${isDragActive ? "text-green-600" : "text-gray-400"}`} />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  {isDragActive ? "Drop your resume here" : "Drag and drop your resume"}
                </p>
                <p className="text-sm text-gray-500 mb-3">or click to browse</p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    PDF
                  </span>
                  <span className="flex items-center gap-1">
                    <File className="w-3.5 h-3.5" />
                    DOCX
                  </span>
                  <span>Max 5MB</span>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-green-600">Ready to analyze</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="mt-6 w-full py-3.5 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/25 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Your Resume...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  Check ATS Compatibility
                </>
              )}
            </button>
          </div>
        </div>

        {/* What We Check Section */}
        {!result && (
          <>
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                What We Analyze
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: FileText, title: "Formatting", desc: "Clean, machine-readable structure", color: "blue" },
                  { icon: Type, title: "Text Parsing", desc: "How well ATS extracts content", color: "purple" },
                  { icon: Search, title: "Keywords", desc: "Industry terms and action verbs", color: "green" },
                  { icon: Layout, title: "Sections", desc: "Standard headings detection", color: "amber" },
                  { icon: Type, title: "Typography", desc: "ATS-friendly fonts and styles", color: "red" },
                  { icon: Target, title: "Structure", desc: "Layout and file optimization", color: "pink" },
                ].map((item, i) => {
                  const colorClasses: Record<string, string> = {
                    blue: "bg-blue-100 text-blue-600",
                    purple: "bg-purple-100 text-purple-600",
                    green: "bg-green-100 text-green-600",
                    amber: "bg-amber-100 text-amber-600",
                    red: "bg-red-100 text-red-600",
                    pink: "bg-pink-100 text-pink-600",
                  };
                  return (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                      <div className={`w-10 h-10 rounded-lg ${colorClasses[item.color]} flex items-center justify-center mb-3`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: 1, icon: Upload, title: "Upload Resume", desc: "Drop your PDF or DOCX file", color: "blue" },
                  { step: 2, icon: Target, title: "AI Analysis", desc: "We check 6 critical ATS factors", color: "purple" },
                  { step: 3, icon: CheckCircle2, title: "Get Results", desc: "Detailed scores and fixes", color: "green" },
                ].map((item) => {
                  const colorClasses: Record<string, string> = {
                    blue: "bg-blue-100 text-blue-600",
                    purple: "bg-purple-100 text-purple-600",
                    green: "bg-green-100 text-green-600",
                  };
                  return (
                    <div key={item.step} className="text-center">
                      <div className={`w-14 h-14 rounded-full ${colorClasses[item.color]} flex items-center justify-center mx-auto mb-4`}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-gray-400 mb-1">Step {item.step}</div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Results Section */}
        {result && (
          <div id="results" className="space-y-8">
            {/* Overall Score Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Your ATS Score</h2>

                {/* Circular Score */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90 w-40 h-40">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - result.overallScore / 100)}`}
                        className={`transition-all duration-1000 ease-out ${getScoreRingColor(result.overallScore)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                        {result.overallScore}
                      </span>
                      <span className="text-sm text-gray-500">out of 100</span>
                    </div>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  result.overallScore >= 81 ? "bg-green-100 text-green-700" :
                  result.overallScore >= 61 ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  <span>{getScoreLabel(result.overallScore).emoji}</span>
                  <span>{getScoreLabel(result.overallScore).text}</span>
                </div>
                <p className="text-gray-500 text-sm mt-2">{getScoreLabel(result.overallScore).desc}</p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Breakdown</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Format", score: result.formatScore, icon: FileText, color: "blue" },
                  { label: "Text Parsing", score: result.textExtractionScore, icon: Type, color: "purple" },
                  { label: "Sections", score: result.sectionScore, icon: Layout, color: "green" },
                  { label: "Keywords", score: result.keywordScore, icon: Search, color: "amber" },
                  { label: "Typography", score: result.typographyScore, icon: Type, color: "red" },
                  { label: "Structure", score: result.structureScore, icon: Target, color: "pink" },
                ].map((item, i) => {
                  const colorClasses: Record<string, string> = {
                    blue: "bg-blue-100 text-blue-600",
                    purple: "bg-purple-100 text-purple-600",
                    green: "bg-green-100 text-green-600",
                    amber: "bg-amber-100 text-amber-600",
                    red: "bg-red-100 text-red-600",
                    pink: "bg-pink-100 text-pink-600",
                  };
                  return (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-lg ${colorClasses[item.color]} flex items-center justify-center`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-gray-900">{item.label}</span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className={`text-3xl font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
                        <span className="text-sm text-gray-400">/100</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getScoreBgColor(item.score)}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critical Issues */}
            {result.criticalIssues.length > 0 && (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-bold text-gray-900">Critical Issues Found</h3>
                </div>
                <div className="space-y-3">
                  {result.criticalIssues.map((issue, i) => (
                    <div key={i} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold">{issue.issue}</span>
                        <span className="text-xs px-2 py-0.5 bg-white/50 rounded">{issue.severity}</span>
                      </div>
                      <p className="text-sm opacity-80">{issue.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sections Found */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Sections Detected</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {result.sectionsFound.map((section, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                    section.status === "found" ? "bg-green-50" : "bg-red-50"
                  }`}>
                    {section.status === "found" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={section.status === "found" ? "text-green-700" : "text-red-700"}>
                      {section.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Improvement Checklist</h3>
              <div className="space-y-2">
                {result.checklist.map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${
                    item.completed ? "bg-green-50" : "bg-gray-50"
                  }`}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      readOnly
                      className="mt-0.5 h-5 w-5 rounded border-gray-300 text-green-600"
                    />
                    <span className={item.completed ? "text-green-700 line-through" : "text-gray-700"}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Want These Issues Fixed Automatically?
              </h3>
              <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                Our AI can fix all ATS issues, tailor your resume to any job, and generate a matching cover letter.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-sm">
                {["Auto-fix all issues", "Tailor to any job", "Cover letter included", "Multiple templates"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
              >
                <Zap className="w-5 h-5" />
                Get AI-Optimized Resume
              </Link>
              <p className="text-blue-200 text-sm mt-3">Starting at $4.99 for 3 resumes</p>
            </div>

            {/* Check Another */}
            <div className="text-center">
              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Check Another Resume
              </button>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {!result && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedFAQ === index ? "rotate-180" : ""}`} />
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA - Only show when no results */}
        {!result && (
          <div className="mt-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Need a Complete Resume Makeover?</h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Skip the manual fixes. Let our AI create a perfectly optimized, ATS-friendly resume tailored to your target job.
            </p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Generate AI Resume
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
