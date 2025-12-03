"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { Upload, FileText, Loader2, CheckCircle2, ArrowLeft, TrendingUp, AlertCircle, Sparkles, ShoppingCart, Target, Search, Briefcase, Award, XCircle, AlertTriangle, Lightbulb, Zap, Star } from "lucide-react";

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_JOB_DESC_LENGTH = 100;

interface PreviewData {
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

export default function GeneratePage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [apiError, setApiError] = useState<string>("");

  // License key verification states
  const [licenseKey, setLicenseKey] = useState<string>("");
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);
  const [licenseError, setLicenseError] = useState<string>("");
  const [remainingUses, setRemainingUses] = useState<number | null>(null);

  // Extract text from PDF
  const extractPdfText = async (file: File): Promise<string> => {
    // Dynamically import pdf-parse only when needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = (await import("pdf-parse" as any)).default;
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return data.text;
  };

  // Extract text from DOCX
  const extractDocxText = async (file: File): Promise<string> => {
    // Dynamically import mammoth only when needed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mammoth = (await import("mammoth" as any)).default;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError("");
    setIsExtracting(true);

    const file = acceptedFiles[0];

    if (!file) {
      setIsExtracting(false);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB");
      setIsExtracting(false);
      return;
    }

    // Validate file type
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (
      fileType !== "application/pdf" &&
      fileType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      !fileName.endsWith(".pdf") &&
      !fileName.endsWith(".docx")
    ) {
      setError("Please upload a PDF or DOCX file");
      setIsExtracting(false);
      return;
    }

    try {
      setResumeFile(file);

      // Extract text based on file type
      let text = "";
      if (fileName.endsWith(".pdf")) {
        text = await extractPdfText(file);
      } else if (fileName.endsWith(".docx")) {
        text = await extractDocxText(file);
      }

      setResumeText(text);
      setIsExtracting(false);
    } catch (err) {
      console.error("Error extracting text:", err);
      setError("Failed to read file. Please try another file.");
      setResumeFile(null);
      setResumeText("");
      setIsExtracting(false);
    }
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
    setIsLoading(true);
    setApiError("");
    setPreviewData(null);

    try {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setPreviewData(data);
    } catch (err) {
      console.error("Error analyzing resume:", err);
      setApiError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment redirect to Gumroad
  const handlePaymentRedirect = () => {
    // Save resume data to localStorage so it's available on success page
    try {
      localStorage.setItem("applypro_resume_text", resumeText);
      localStorage.setItem("applypro_job_description", jobDescription);
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }

    // Redirect directly to Gumroad
    window.location.href = "https://laurabi.gumroad.com/l/ykchtv";
  };

  // Handle license key verification and immediate generation
  const handleLicenseGenerate = async () => {
    if (!licenseKey.trim()) {
      setLicenseError("Please enter your license key");
      return;
    }

    setIsVerifyingLicense(true);
    setLicenseError("");

    try {
      // Verify license with API
      const verifyResponse = await fetch("/api/verify-license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ licenseKey: licenseKey.trim() }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.valid) {
        setLicenseError(verifyData.error || "Invalid license key");
        setIsVerifyingLicense(false);
        return;
      }

      // License is valid, store remaining uses
      setRemainingUses(verifyData.remaining || 0);

      // Generate full resume immediately
      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      const generateData = await generateResponse.json();

      if (!generateResponse.ok) {
        throw new Error(generateData.error || "Failed to generate resume");
      }

      // Save data and redirect to success page with generated content
      try {
        localStorage.setItem("applypro_resume_text", resumeText);
        localStorage.setItem("applypro_job_description", jobDescription);
        localStorage.setItem("applypro_generated_content", JSON.stringify(generateData));
        localStorage.setItem("applypro_remaining_uses", String(verifyData.remaining || 0));
      } catch (err) {
        console.error("Error saving to localStorage:", err);
      }

      // Redirect to success page
      window.location.href = "/success?verified=true";
    } catch (err) {
      console.error("Error with license generation:", err);
      setLicenseError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
      setIsVerifyingLicense(false);
    }
  };

  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getMatchScoreBgColor = (score: number) => {
    if (score >= 70) return "bg-green-600";
    if (score >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  const isGenerateDisabled =
    !resumeText ||
    !jobDescription ||
    jobDescription.length < MIN_JOB_DESC_LENGTH ||
    isLoading ||
    isExtracting;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Generate Your Tailored Resume
          </h2>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
            Upload your resume and paste the job description to get started
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Resume Upload */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upload Your Resume
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  PDF or DOCX (Max 5MB)
                </p>
              </div>
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                  : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600"
              } ${resumeFile ? "bg-green-50 dark:bg-green-950/20" : ""}`}
            >
              <input {...getInputProps()} />
              {isExtracting ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Extracting text from file...
                  </p>
                </div>
              ) : resumeFile ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {resumeFile.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(resumeFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Click or drag to replace
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {isDragActive
                        ? "Drop your resume here"
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      PDF or DOCX files only (Max 5MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-950/20">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {resumeText && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Extracted Text Preview (
                  {resumeText.length} characters)
                </p>
                <p className="mt-2 line-clamp-6 text-sm text-gray-700 dark:text-gray-300">
                  {resumeText}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Job Description */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Job Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Paste the full job posting
                </p>
              </div>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="h-[400px] w-full resize-none rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />

            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {jobDescription.length} characters
                {jobDescription.length < MIN_JOB_DESC_LENGTH && (
                  <span className="ml-2 text-orange-600 dark:text-orange-400">
                    (Minimum {MIN_JOB_DESC_LENGTH} required)
                  </span>
                )}
              </p>
              {jobDescription.length >= MIN_JOB_DESC_LENGTH && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* Two Options: Preview OR License Key */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Left Option: Free Preview */}
          <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm dark:border-blue-800 dark:from-blue-950/20 dark:to-gray-900">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Get Free Preview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See match score, improvements, and missing keywords before purchasing
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isGenerateDisabled || isVerifyingLicense}
              className={`w-full flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all ${
                isGenerateDisabled || isVerifyingLicense
                  ? "cursor-not-allowed bg-gray-400 dark:bg-gray-700"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Analyze Resume
                </>
              )}
            </button>
          </div>

          {/* Right Option: License Key */}
          <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm dark:border-green-800 dark:from-green-950/20 dark:to-gray-900">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Already have a license key?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your key to generate full resume immediately
              </p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter license key"
                disabled={isVerifyingLicense}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 disabled:opacity-50"
              />
              {licenseError && (
                <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{licenseError}</span>
                </div>
              )}
              <button
                onClick={handleLicenseGenerate}
                disabled={isGenerateDisabled || !licenseKey.trim() || isVerifyingLicense}
                className={`w-full flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all ${
                  isGenerateDisabled || !licenseKey.trim() || isVerifyingLicense
                    ? "cursor-not-allowed bg-gray-400 dark:bg-gray-700"
                    : "bg-green-600 hover:bg-green-700 hover:shadow-xl"
                }`}
              >
                {isVerifyingLicense ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Verify & Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {isGenerateDisabled && !isLoading && !isExtracting && !isVerifyingLicense && (
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {!resumeText && "Please upload your resume"}
            {resumeText &&
              jobDescription.length < MIN_JOB_DESC_LENGTH &&
              " and enter a job description (minimum 100 characters)"}
          </p>
        )}

        {/* API Error Display */}
        {apiError && (
          <div className="mt-6 flex justify-center">
            <div className="flex max-w-2xl items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-300">
                  Analysis Failed
                </h4>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {apiError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Comprehensive Resume Score Dashboard */}
        {previewData && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-500">
            {/* Overall Score Section with Circular Progress */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Resume Match Score
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  How well your resume aligns with this job opportunity
                </p>

                {/* Circular Progress Indicator */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-48 h-48">
                    {/* Background circle */}
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
                      {/* Progress circle */}
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - previewData.overallScore / 100)}`}
                        className={`transition-all duration-1000 ease-out ${
                          previewData.overallScore >= 81 ? 'text-green-500' :
                          previewData.overallScore >= 61 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Score text in center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-5xl font-bold ${getMatchScoreColor(previewData.overallScore)}`}>
                        {previewData.overallScore}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">out of 100</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                  {previewData.overallScore >= 81 && "Excellent match! Your resume is well-aligned with this position."}
                  {previewData.overallScore >= 61 && previewData.overallScore <= 80 && "Good foundation, but there's room for improvement to stand out."}
                  {previewData.overallScore < 61 && "Significant improvements needed to compete effectively for this role."}
                </p>
              </div>
            </div>

            {/* Score Breakdown Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* ATS Compatibility Score */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">ATS Score</h4>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${getMatchScoreColor(previewData.atsScore)}`}>
                    {previewData.atsScore}
                  </span>
                  <span className="text-sm text-gray-500">/100</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all duration-500 ${getMatchScoreBgColor(previewData.atsScore)}`}
                    style={{ width: `${previewData.atsScore}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Applicant Tracking System compatibility
                </p>
              </div>

              {/* Keyword Match Score */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Keywords</h4>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${getMatchScoreColor(previewData.keywordScore)}`}>
                    {previewData.keywordScore}
                  </span>
                  <span className="text-sm text-gray-500">/100</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all duration-500 ${getMatchScoreBgColor(previewData.keywordScore)}`}
                    style={{ width: `${previewData.keywordScore}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {previewData.keywordStats.matched} of {previewData.keywordStats.total} key terms found
                </p>
              </div>

              {/* Experience Relevance Score */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Briefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Experience</h4>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${getMatchScoreColor(previewData.experienceScore)}`}>
                    {previewData.experienceScore}
                  </span>
                  <span className="text-sm text-gray-500">/100</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all duration-500 ${getMatchScoreBgColor(previewData.experienceScore)}`}
                    style={{ width: `${previewData.experienceScore}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Relevance to job requirements
                </p>
              </div>

              {/* Skills Alignment Score */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Skills</h4>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${getMatchScoreColor(previewData.skillsScore)}`}>
                    {previewData.skillsScore}
                  </span>
                  <span className="text-sm text-gray-500">/100</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full transition-all duration-500 ${getMatchScoreBgColor(previewData.skillsScore)}`}
                    style={{ width: `${previewData.skillsScore}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Technical & soft skills match
                </p>
              </div>
            </div>

            {/* Detailed Insights Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Missing Keywords - RED */}
              <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-white p-6 dark:border-red-900/50 dark:from-red-950/20 dark:to-gray-900">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Missing Keywords
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Critical terms to add for ATS
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {previewData.missingKeywords.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-white p-4 border border-red-200 dark:bg-gray-800 dark:border-red-900/50"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.keyword}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          item.priority === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.context}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements Needed - YELLOW */}
              <div className="rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-6 dark:border-yellow-900/50 dark:from-yellow-950/20 dark:to-gray-900">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-600">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Improvements Needed
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Actionable fixes to boost your score
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {previewData.improvements.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-white p-4 border border-yellow-200 dark:bg-gray-800 dark:border-yellow-900/50"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`flex-shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          item.impact === 'medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          !
                        </span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white mb-1">
                            {item.issue}
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-400">
                            → {item.fix}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths Section - GREEN */}
            {previewData.strengths.length > 0 && (
              <div className="rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6 dark:border-green-900/50 dark:from-green-950/20 dark:to-gray-900">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Your Strengths
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      What you're doing right
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {previewData.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg bg-white p-4 border border-green-200 dark:bg-gray-800 dark:border-green-900/50"
                    >
                      <Star className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {strength}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Strategic Insights */}
            {previewData.insights.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 dark:border-gray-800 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                    <Lightbulb className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      AI Strategic Insights
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Expert recommendations for this role
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {previewData.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg bg-white/80 p-4 backdrop-blur-sm dark:bg-gray-900/80"
                    >
                      <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Keywords Display */}
            {previewData.matchedKeywords.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Keywords Already in Your Resume ({previewData.matchedKeywords.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {previewData.matchedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Text Section */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:border-gray-800 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tailored Resume Preview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    See how your optimized resume would start
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-white p-4 dark:bg-gray-900">
                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                  {previewData.previewText}
                </p>
              </div>
            </div>

            {/* Upgrade CTA with Benefits */}
            <div className="rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-purple-600 p-8 shadow-xl">
              <div className="text-center text-white">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold mb-3">
                  Ready to Transform Your Resume?
                </h3>
                <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                  Get the complete AI-optimized resume that fixes all these issues and gets you interviews
                </p>

                {/* Benefits List */}
                <div className="grid gap-3 md:grid-cols-2 max-w-3xl mx-auto mb-8 text-left">
                  <div className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">All missing keywords strategically added</span>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Professional ATS-optimized formatting</span>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">All improvements implemented by AI</span>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">3 professional templates (PDF & DOCX)</span>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Tailored for this specific job</span>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">3 resume generations included</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <button
                    onClick={handlePaymentRedirect}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-all hover:shadow-xl hover:scale-105 sm:w-auto"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Get Full Resume - $4.99
                  </button>
                  <button
                    onClick={() => {
                      setPreviewData(null);
                      setResumeFile(null);
                      setResumeText("");
                      setJobDescription("");
                    }}
                    className="text-sm font-medium text-white hover:text-blue-100 underline"
                  >
                    Try Another Resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
