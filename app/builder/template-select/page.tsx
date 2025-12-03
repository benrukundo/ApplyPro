"use client";

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Upload, FileText, Check, ArrowLeft, ChevronDown } from "lucide-react";
import { initializeResumeData, saveResumeData, loadResumeData, type TemplateType } from "@/lib/builder";

function TemplateSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preserveData = searchParams.get("preserve") === "true";

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("modern");
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleCreateNew = () => {
    // Check if we should preserve existing data
    if (preserveData) {
      const existingData = loadResumeData();
      if (existingData) {
        // Only change the template, keep all other data
        const updatedData = { ...existingData, template: selectedTemplate };
        saveResumeData(updatedData);
        router.push(`/builder/create?template=${selectedTemplate}&step=7`);
        return;
      }
    }

    // Initialize new resume data with selected template
    const data = initializeResumeData(selectedTemplate);
    saveResumeData(data);
    router.push(`/builder/create?template=${selectedTemplate}&step=1`);
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError("");

    try {
      // Extract text from file
      let extractedText = "";

      if (file.type === "application/pdf") {
        // Dynamically import pdf-parse
        const pdfParse = (await import("pdf-parse" as any)).default;
        const arrayBuffer = await file.arrayBuffer();
        const data = await pdfParse(Buffer.from(arrayBuffer));
        extractedText = data.text;
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        // Dynamically import mammoth
        const mammoth = (await import("mammoth" as any)).default;
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (file.type === "text/plain") {
        extractedText = await file.text();
      }

      // Initialize resume data
      const data = initializeResumeData(selectedTemplate);

      // Store extracted text for AI parsing on the builder page
      localStorage.setItem("applypro_resume_upload_text", extractedText);

      saveResumeData(data);

      // Navigate to builder with upload flag
      router.push(`/builder/create?template=${selectedTemplate}&step=1&upload=true`);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("Failed to read file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [selectedTemplate, router]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB");
        return;
      }

      handleFileUpload(file);
    }
  };

  const templates = [
    {
      id: "modern" as TemplateType,
      name: "Modern",
      description: "Clean two-column design with blue accents",
      color: "blue",
      preview: "/templates/modern-preview.png",
    },
    {
      id: "traditional" as TemplateType,
      name: "Traditional",
      description: "Classic single-column format",
      color: "gray",
      preview: "/templates/traditional-preview.png",
    },
    {
      id: "ats-optimized" as TemplateType,
      name: "ATS-Optimized",
      description: "Simple format that beats applicant tracking systems",
      color: "green",
      preview: "/templates/ats-preview.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to templates
        </Link>

        {/* Headline */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {preserveData ? "Change Your Template" : "How would you like to build your resume?"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {preserveData
              ? "Select a new template below. All your resume data will be preserved."
              : "Choose your starting point and we'll guide you through the process"}
          </p>
        </div>

        {/* Preserve Data Notice */}
        {preserveData && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Your Data is Safe
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Don't worry! All your resume information (experience, education, skills, etc.) will be kept. Only the visual design will change.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Option Cards - Only show when NOT preserving data */}
        {!preserveData && (
        <div className="grid gap-6 md:grid-cols-2 mb-16 max-w-4xl mx-auto">
          {/* Card A: Create New */}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-blue-500 hover:shadow-lg transition-all dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6 mx-auto">
              <Plus className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              Create a New Resume
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              We'll go through each section together with helpful prompts and examples
            </p>
            <button
              onClick={handleCreateNew}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Create new
            </button>
          </div>

          {/* Card B: Upload Existing */}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-orange-500 hover:shadow-lg transition-all dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-6 mx-auto">
              <Upload className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              I Already Have a Resume
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              We'll transfer everything to your new professional template
            </p>

            <label htmlFor="resume-upload" className="block">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx,.txt,.rtf"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isUploading}
              />
              <div className="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition-colors text-center cursor-pointer">
                {isUploading ? "Uploading..." : "Choose file"}
              </div>
            </label>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Acceptable file types: DOC, DOCX, PDF, RTF, TXT
            </p>

            {uploadError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 text-center">
                {uploadError}
              </p>
            )}

            <button
              onClick={() => setShowUploadOptions(!showUploadOptions)}
              className="flex items-center gap-2 mx-auto mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              More upload options
              <ChevronDown className={`h-4 w-4 transition-transform ${showUploadOptions ? 'rotate-180' : ''}`} />
            </button>

            {showUploadOptions && (
              <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400">
                <p className="mb-2">• Drag and drop support coming soon</p>
                <p className="mb-2">• Import from LinkedIn (Premium feature)</p>
                <p>• Paste text directly (Coming soon)</p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Template Selection */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Choose Your Template
          </h2>

          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? `border-${template.color}-600 bg-${template.color}-50 shadow-lg dark:bg-${template.color}-950/20`
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                {selectedTemplate === template.id && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 mb-4">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                )}

                {/* Template Preview Placeholder */}
                <div className="aspect-[8.5/11] bg-gray-100 dark:bg-gray-900 rounded-lg mb-4 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <FileText className="h-16 w-16 text-gray-400" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>

                <button
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full rounded-lg px-4 py-2 font-medium transition-colors ${
                    selectedTemplate === template.id
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {selectedTemplate === template.id ? "Selected" : "Select Template"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white">
              Contact Us
            </Link>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-4">
            © 2025, ApplyPro. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function TemplateSelectPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <TemplateSelectContent />
    </Suspense>
  );
}
