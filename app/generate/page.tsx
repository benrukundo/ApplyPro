"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { Upload, FileText, Loader2, CheckCircle2, ArrowLeft, TrendingUp, AlertCircle, Sparkles, ShoppingCart } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mammoth = require("mammoth") as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pdfParse = require("pdf-parse") as any;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_JOB_DESC_LENGTH = 100;

interface PreviewData {
  matchScore: number;
  improvements: string[];
  missingKeywords: string[];
  previewText: string;
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

  // Extract text from PDF
  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return data.text;
  };

  // Extract text from DOCX
  const extractDocxText = async (file: File): Promise<string> => {
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
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ApplyPro
            </h1>
          </div>
        </div>
      </header>

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

        {/* Generate Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={isGenerateDisabled}
            className={`flex items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all ${
              isGenerateDisabled
                ? "cursor-not-allowed bg-gray-400 dark:bg-gray-700"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Analyzing your resume...
              </>
            ) : (
              "Analyze Resume - Free Preview"
            )}
          </button>
        </div>

        {isGenerateDisabled && !isLoading && !isExtracting && (
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

        {/* Preview Results */}
        {previewData && (
          <div className="mt-8 space-y-6">
            {/* Match Score Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Match Score
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      How well your resume matches the job
                    </p>
                  </div>
                </div>
                <div
                  className={`text-5xl font-bold ${getMatchScoreColor(
                    previewData.matchScore
                  )}`}
                >
                  {previewData.matchScore}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full transition-all duration-500 ${getMatchScoreBgColor(
                    previewData.matchScore
                  )}`}
                  style={{ width: `${previewData.matchScore}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {previewData.matchScore >= 70 && "Great match! Your resume aligns well with this job."}
                {previewData.matchScore >= 50 && previewData.matchScore < 70 && "Decent match. Our AI can significantly improve your chances."}
                {previewData.matchScore < 50 && "Low match. Let our AI tailor your resume for better results."}
              </p>
            </div>

            {/* Improvements Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top 5 Improvements Needed
                </h3>
              </div>
              <ul className="space-y-3">
                {previewData.improvements.map((improvement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Keywords Section */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Missing ATS Keywords
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add these to pass applicant tracking systems
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {previewData.missingKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview Text Section */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 shadow-sm dark:border-gray-800 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="mb-4 flex items-center gap-3">
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
              <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                {previewData.previewText}
              </p>
            </div>

            {/* CTA for Full Resume */}
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-lg dark:bg-gray-900">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Ready to Get Your Full Tailored Resume?
                </h3>
                <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
                  Get the complete AI-optimized resume with ATS keywords and
                  professional formatting
                </p>
                <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <a
                    href="https://laurabi.gumroad.com/l/ykchtv"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      // Save data to localStorage before redirecting
                      try {
                        localStorage.setItem("applypro_resume_text", resumeText);
                        localStorage.setItem("applypro_job_description", jobDescription);
                      } catch (err) {
                        console.error("Error saving to localStorage:", err);
                      }
                    }}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl sm:w-auto"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Get Full Resume - $4.99
                  </a>
                  <button
                    onClick={() => {
                      setPreviewData(null);
                      setResumeFile(null);
                      setResumeText("");
                      setJobDescription("");
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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
