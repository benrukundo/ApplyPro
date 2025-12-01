import Link from "next/link";
import { CheckCircle2, Upload, Sparkles, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              Get Your Dream Job with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Tailored Resumes
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">
              Transform your resume for each job application in minutes. Our AI
              analyzes job descriptions and optimizes your resume to match
              perfectly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/generate"
                className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Start Now
              </Link>
              <a
                href="#how-it-works"
                className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Get your tailored resume in three simple steps
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                1. Upload Your Resume
              </h3>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                Upload your existing resume or paste your experience and skills.
                We support all common formats.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                2. Paste Job Description
              </h3>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                Copy and paste the job description you&apos;re applying for. Our
                AI will analyze the requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                3. Get Tailored Resume
              </h3>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                Receive your optimized resume tailored to the job description,
                ready to submit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Pay only for what you need
            </p>
          </div>

          <div className="mt-16 flex justify-center">
            <div className="relative w-full max-w-lg rounded-3xl border-2 border-blue-600 bg-white p-8 shadow-xl dark:bg-gray-900 sm:p-10">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Per Resume
                </h3>
                <div className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    $4.99
                  </span>
                  <span className="text-lg font-semibold leading-6 tracking-wide text-gray-600 dark:text-gray-300">
                    per resume
                  </span>
                </div>
                <ul className="mt-8 space-y-4 text-left">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-blue-600" />
                    <span className="text-base text-gray-600 dark:text-gray-300">
                      AI-powered resume optimization
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-blue-600" />
                    <span className="text-base text-gray-600 dark:text-gray-300">
                      Keyword matching for ATS systems
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-blue-600" />
                    <span className="text-base text-gray-600 dark:text-gray-300">
                      Instant delivery in multiple formats
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-blue-600" />
                    <span className="text-base text-gray-600 dark:text-gray-300">
                      Professional formatting and layout
                    </span>
                  </li>
                </ul>
                <div className="mt-10">
                  <Link
                    href="/generate"
                    className="block w-full rounded-full bg-blue-600 px-6 py-4 text-center text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Get Started Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ApplyPro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
