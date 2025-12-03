"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ShoppingCart,
  FileText,
  Download,
  Sparkles,
} from "lucide-react";
import { loadResumeData, type ResumeData } from "@/lib/builder";

export default function CheckoutPage() {
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const data = loadResumeData();
    if (!data) {
      router.push("/builder/template-select");
      return;
    }
    setResumeData(data);
  }, [router]);

  const handlePayment = () => {
    setIsRedirecting(true);

    // Save resume data for post-payment processing
    try {
      if (resumeData) {
        localStorage.setItem("applypro_builder_resume", JSON.stringify(resumeData));
      }
    } catch (error) {
      console.error("Error saving resume data:", error);
    }

    // Redirect to Gumroad
    window.location.href = "https://laurabi.gumroad.com/l/ykchtv";
  };

  if (!resumeData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    "Download in PDF and DOCX formats",
    "3 resume downloads included",
    "ATS-optimized formatting",
    "Professional templates",
    "Lifetime access to your resumes",
    "Mobile-friendly downloads",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/builder/create?step=7"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to editor
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Resume Summary */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Your Resume is Ready!
            </h1>

            {/* Resume Preview Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {resumeData.header.firstName} {resumeData.header.lastName}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {resumeData.template.charAt(0).toUpperCase() + resumeData.template.slice(1)} Template
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Last edited: {new Date(resumeData.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Resume Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {resumeData.experience.length}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Experiences</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {resumeData.education.length}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Education</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {resumeData.skills.length}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Skills</p>
                </div>
              </div>
            </div>

            {/* Edit Options */}
            <div className="space-y-3">
              <Link
                href="/builder/template-select?preserve=true"
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Change Template
              </Link>
              <Link
                href="/builder/create?step=1"
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Edit Sections
              </Link>
            </div>
          </div>

          {/* Right Column - Payment */}
          <div>
            <div className="rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-purple-600 p-8 shadow-xl mb-6">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-8 w-8" />
                  <h2 className="text-2xl font-bold">Download Your Resume</h2>
                </div>

                <p className="text-blue-100 mb-6">
                  Get instant access to your professionally formatted resume in multiple formats
                </p>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-5xl font-bold">$4.99</span>
                    <span className="text-blue-100">one-time payment</span>
                  </div>

                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isRedirecting}
                  className="w-full flex items-center justify-center gap-3 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-blue-50 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRedirecting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                      Redirecting to payment...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Complete Purchase
                    </>
                  )}
                </button>

                <p className="text-xs text-blue-100 text-center mt-4">
                  Secure payment powered by Gumroad
                </p>
              </div>
            </div>

            {/* Money-Back Guarantee */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    100% Satisfaction Guaranteed
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Not happy with your resume? Get a full refund within 30 days, no questions asked.
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>Instant Download</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What formats can I download?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can download your resume in both PDF and DOCX (Microsoft Word) formats, making it easy to edit later or submit to any employer.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I edit my resume after purchase?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yes! You can return to the builder anytime to make changes and download updated versions. Your purchase includes 3 resume downloads.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is my resume ATS-friendly?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Absolutely! All our templates are optimized to pass Applicant Tracking Systems (ATS) used by employers to filter resumes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
