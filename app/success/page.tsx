"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Download,
  Sparkles,
  PartyPopper,
  AlertCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";

export const dynamic = 'force-dynamic';

const MIN_JOB_DESC_LENGTH = 100;

interface GeneratedContent {
  tailoredResume: string;
  coverLetter: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string>("");

  const [resumeText, setResumeText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState<string>("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [generatedContent, setGeneratedContent] =
    useState<GeneratedContent | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingDOCX, setIsDownloadingDOCX] = useState(false);
  const [downloadError, setDownloadError] = useState<string>("");

  // Gumroad license key verification
  useEffect(() => {
    const verifyLicense = async () => {
      const licenseKey = searchParams.get("key");

      // Check for license key in URL
      if (!licenseKey) {
        setVerificationError("No license key found. Please purchase from the generate page.");
        setIsVerifying(false);
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      console.log("Verifying license key...");

      try {
        // Verify license with our API (which calls Gumroad)
        const response = await fetch("/api/verify-license", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ licenseKey }),
        });

        const data = await response.json();

        if (!response.ok || !data.valid) {
          setVerificationError(data.error || "Invalid license key");
          setIsVerifying(false);
          setTimeout(() => router.push("/"), 3000);
          return;
        }

        console.log("License verified successfully");

        // License is valid
        setPaymentVerified(true);
        setIsVerifying(false);

        // Load resume data from localStorage
        try {
          const savedResumeText = localStorage.getItem("applypro_resume_text");
          const savedJobDesc = localStorage.getItem("applypro_job_description");

          if (savedResumeText) {
            setResumeText(savedResumeText);
          }
          if (savedJobDesc) {
            setJobDescription(savedJobDesc);
          }
        } catch (err) {
          console.error("Error loading from localStorage:", err);
        }
      } catch (err) {
        console.error("Error verifying license:", err);
        setVerificationError("Failed to verify license. Please try again.");
        setIsVerifying(false);
        setTimeout(() => router.push("/"), 3000);
      }
    };

    verifyLicense();
  }, [searchParams, router]);

  // Handle generate full resume
  const handleGenerate = async () => {
    setIsGenerating(true);
    setApiError("");
    setGeneratedContent(null);

    try {
      const response = await fetch("/api/generate", {
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
        throw new Error(data.error || "Failed to generate resume");
      }

      setGeneratedContent(data);

      // Save to localStorage for future reference
      try {
        localStorage.setItem("applypro_resume_text", resumeText);
        localStorage.setItem("applypro_job_description", jobDescription);
      } catch (err) {
        console.error("Error saving to localStorage:", err);
      }
    } catch (err) {
      console.error("Error generating resume:", err);
      setApiError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const isGenerateDisabled =
    !resumeText ||
    !jobDescription ||
    jobDescription.length < MIN_JOB_DESC_LENGTH ||
    isGenerating;

  // Download handlers
  const handleDownloadPDF = async () => {
    if (!generatedContent) return;

    setIsDownloadingPDF(true);
    setDownloadError("");

    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Helper function to add text with word wrap
      const addText = (
        text: string,
        fontSize: number,
        isBold: boolean = false
      ) => {
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }

        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += fontSize * 0.5;
        });
        yPosition += 5; // Add extra spacing after paragraph
      };

      // Header
      doc.setFillColor(37, 99, 235); // Blue background
      doc.rect(0, 0, pageWidth, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("ApplyPro - Tailored Resume", pageWidth / 2, 15, {
        align: "center",
      });

      // Reset text color
      doc.setTextColor(0, 0, 0);
      yPosition = 35;

      // Resume Section
      addText("RESUME", 16, true);
      yPosition += 5;

      // Split resume into paragraphs and add them
      const resumeParagraphs = generatedContent.tailoredResume
        .split("\n\n")
        .filter((p) => p.trim());
      resumeParagraphs.forEach((paragraph) => {
        addText(paragraph.trim(), 11);
      });

      // Add new page for cover letter
      doc.addPage();
      yPosition = margin;

      // Cover Letter Section
      addText("COVER LETTER", 16, true);
      yPosition += 5;

      // Split cover letter into paragraphs and add them
      const coverLetterParagraphs = generatedContent.coverLetter
        .split("\n\n")
        .filter((p) => p.trim());
      coverLetterParagraphs.forEach((paragraph) => {
        addText(paragraph.trim(), 11);
      });

      // Generate filename with date
      const date = new Date().toISOString().split("T")[0];
      const filename = `Resume_Tailored_${date}.pdf`;

      // Save the PDF
      doc.save(filename);

      setIsDownloadingPDF(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setDownloadError("Failed to generate PDF. Please try again.");
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadDOCX = async () => {
    if (!generatedContent) return;

    setIsDownloadingDOCX(true);
    setDownloadError("");

    try {
      // Helper function to split text into paragraphs
      const createParagraphs = (text: string, isBold: boolean = false) => {
        return text
          .split("\n")
          .filter((line) => line.trim())
          .map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line.trim(),
                    bold: isBold,
                    size: isBold ? 28 : 24, // 14pt for bold headers, 12pt for normal text
                  }),
                ],
                spacing: {
                  after: 200,
                },
              })
          );
      };

      // Create document sections
      const sections = [];

      // Header
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "ApplyPro - Tailored Resume",
              bold: true,
              size: 32, // 16pt
              color: "2563EB", // Blue color
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        })
      );

      // Resume header
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "RESUME",
              bold: true,
              size: 32, // 16pt
            }),
          ],
          spacing: {
            before: 200,
            after: 300,
          },
        })
      );

      // Resume content
      sections.push(...createParagraphs(generatedContent.tailoredResume));

      // Page break before cover letter
      sections.push(
        new Paragraph({
          children: [new TextRun({ text: "", break: 1 })],
          pageBreakBefore: true,
        })
      );

      // Cover letter header
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "COVER LETTER",
              bold: true,
              size: 32, // 16pt
            }),
          ],
          spacing: {
            before: 200,
            after: 300,
          },
        })
      );

      // Cover letter content
      sections.push(...createParagraphs(generatedContent.coverLetter));

      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: sections,
          },
        ],
      });

      // Generate and save the document
      const blob = await Packer.toBlob(doc);
      const date = new Date().toISOString().split("T")[0];
      const filename = `Resume_Tailored_${date}.docx`;

      saveAs(blob, filename);

      setIsDownloadingDOCX(false);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      setDownloadError("Failed to generate DOCX. Please try again.");
      setIsDownloadingDOCX(false);
    }
  };

  // Show verification state
  if (isVerifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Verifying your license key...</p>
      </div>
    );
  }

  // Show verification error
  if (verificationError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/20">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 dark:text-red-400" />
          <h2 className="mt-4 text-xl font-bold text-red-900 dark:text-red-100">
            License Verification Failed
          </h2>
          <p className="mt-2 text-red-700 dark:text-red-300">{verificationError}</p>
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            Redirecting to homepage...
          </p>
        </div>
      </div>
    );
  }

  // License verified - show main content
  if (!paymentVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
        {/* Success Message */}
        <div className="mb-8 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-sm dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
          <div className="flex items-center gap-3">
            <PartyPopper className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                Payment Successful! 🎉
              </h2>
              <p className="mt-1 text-green-700 dark:text-green-300">
                Thank you for your purchase. Let's create your tailored resume!
              </p>
            </div>
          </div>
        </div>

        {!generatedContent ? (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Generate Your Full Tailored Resume
              </h2>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
                Upload your resume and paste the job description to get your
                complete AI-optimized resume and cover letter
              </p>
            </div>

            {/* Two-column layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Resume Text */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Your Resume
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Paste your resume text here
                    </p>
                  </div>
                </div>

                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="h-[400px] w-full resize-none rounded-xl border border-gray-300 bg-white p-4 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                />

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {resumeText.length} characters
                  </p>
                  {resumeText.length > 50 && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                </div>
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
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className={`flex items-center gap-3 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all ${
                  isGenerateDisabled
                    ? "cursor-not-allowed bg-gray-400 dark:bg-gray-700"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Generating your tailored resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6" />
                    Generate Full Resume
                  </>
                )}
              </button>
            </div>

            {isGenerateDisabled && !isGenerating && (
              <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                {!resumeText && "Please paste your resume text"}
                {resumeText &&
                  jobDescription.length < MIN_JOB_DESC_LENGTH &&
                  " and enter a job description (minimum 100 characters)"}
              </p>
            )}

            {/* API Error Display */}
            {apiError && (
              <div className="mt-6 flex justify-center">
                <div className="flex max-w-2xl items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {apiError}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Results Section */}
            <div className="space-y-6">
              {/* Success Banner */}
              <div className="rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 shadow-sm dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100">
                      Your Resume is Ready!
                    </h3>
                    <p className="mt-1 text-green-700 dark:text-green-300">
                      Download your tailored resume and cover letter below
                    </p>
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF}
                  className={`flex items-center gap-3 rounded-full px-6 py-3 font-semibold text-white shadow-lg transition-all ${
                    isDownloadingPDF
                      ? "cursor-not-allowed bg-red-400"
                      : "bg-red-600 hover:bg-red-700 hover:shadow-xl"
                  }`}
                >
                  {isDownloadingPDF ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download as PDF
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadDOCX}
                  disabled={isDownloadingDOCX}
                  className={`flex items-center gap-3 rounded-full px-6 py-3 font-semibold text-white shadow-lg transition-all ${
                    isDownloadingDOCX
                      ? "cursor-not-allowed bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl"
                  }`}
                >
                  {isDownloadingDOCX ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating DOCX...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download as DOCX
                    </>
                  )}
                </button>
              </div>

              {/* Download Error */}
              {downloadError && (
                <div className="mt-4 flex justify-center">
                  <div className="flex max-w-md items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {downloadError}
                    </p>
                  </div>
                </div>
              )}

              {/* Tailored Resume */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Your Tailored Resume
                  </h3>
                </div>
                <div className="prose max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {generatedContent.tailoredResume}
                  </pre>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Your Cover Letter
                  </h3>
                </div>
                <div className="prose max-w-none dark:prose-invert">
                  <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {generatedContent.coverLetter}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setGeneratedContent(null);
                    setResumeText("");
                    setJobDescription("");
                  }}
                  className="rounded-full border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                >
                  Generate Another Resume
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
