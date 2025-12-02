"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Upload,
  Sparkles,
  FileText,
  Target,
  Zap,
  Download,
  Shield,
  TrendingUp,
  Star,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does ApplyPro work?",
      answer:
        "ApplyPro uses advanced AI to analyze your resume and the job description. It then tailors your resume to match the specific requirements, optimizes keywords for ATS systems, and generates a matching cover letter. The entire process takes just minutes.",
    },
    {
      question: "Will this work with ATS systems?",
      answer:
        "Absolutely! Our AI is specifically trained to optimize resumes for Applicant Tracking Systems (ATS). We incorporate relevant keywords, use ATS-friendly formatting, and ensure your resume gets past automated screening to reach human recruiters.",
    },
    {
      question: "Can I use it multiple times?",
      answer:
        "Each license key ($4.99) is valid for one resume generation. If you're applying to multiple jobs, you'll need a separate license for each tailored resume. This ensures you get a uniquely optimized resume for each position.",
    },
    {
      question: "What file formats do you support?",
      answer:
        "You can input your resume as plain text or paste it directly. After generation, you'll receive your tailored resume in both text format (easy to copy/paste) and professional formatting ready for download.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! We take privacy seriously. Your resume and job description are processed in real-time through encrypted connections and are NOT stored in any database. Once you close your session, your data is gone. Read our Privacy Policy for full details.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6 animate-fadeIn">
              <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
              <span className="text-sm font-semibold text-blue-800">
                Join 100+ successful job seekers
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 animate-fadeInUp leading-tight">
              Land Your Dream Job with{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI-Tailored Resumes
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fadeInUp delay-100">
              Beat ATS systems. Get 85%+ match scores. Transform your resume in
              minutes with AI-powered optimization.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fadeInUp delay-200">
              <Link
                href="/generate"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
              >
                Try Free Preview
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-white text-gray-900 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                See How It Works
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 animate-fadeInUp delay-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Instant results</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose ApplyPro?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by cutting-edge AI to give you the competitive edge
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeInUp">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get detailed match scores, improvement suggestions, and missing
                keywords analysis. Know exactly how well your resume fits before
                applying.
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeInUp delay-100">
              <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ATS-Optimized
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Beat Applicant Tracking Systems with keyword optimization and
                ATS-friendly formatting. Get past the bots and reach human
                recruiters.
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fadeInUp delay-200">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Download className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Instant Results
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get your tailored resume and cover letter in minutes. Download
                in multiple formats and start applying immediately. No waiting,
                no hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your tailored resume in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full border-2 border-blue-100 animate-slideInLeft">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mt-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Upload Your Resume
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Paste your current resume text or upload your file. We accept
                  all formats and extract the relevant information automatically.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full border-2 border-indigo-100 animate-slideInLeft delay-100">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6 mt-4">
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Add Job Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Copy and paste the job description. Our AI analyzes the
                  requirements, skills, and keywords to optimize your resume
                  perfectly.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full border-2 border-green-100 animate-slideInLeft delay-200">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 mt-4">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Get Tailored Resume
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive your optimized resume and cover letter instantly.
                  Download and start applying with confidence. Higher match
                  scores guaranteed!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              One-time payment. No subscriptions. No hidden fees.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-1 animate-scaleIn">
              <div className="bg-white rounded-3xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-block px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
                      Limited Time Offer
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Per Resume
                    </h3>
                    <div className="flex items-baseline justify-center md:justify-start gap-2 mb-6">
                      <span className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        $4.99
                      </span>
                      <span className="text-xl text-gray-600">one-time</span>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Professional resume writers charge $100-300. Get the same
                      quality powered by AI for a fraction of the cost.
                    </p>
                  </div>

                  <div className="flex-1 w-full">
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">
                        What You Get:
                      </h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600 mt-0.5" />
                          <span className="text-gray-700">
                            AI-powered resume optimization
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600 mt-0.5" />
                          <span className="text-gray-700">
                            Custom cover letter generation
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600 mt-0.5" />
                          <span className="text-gray-700">
                            ATS keyword optimization
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600 mt-0.5" />
                          <span className="text-gray-700">
                            Match score analysis
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600 mt-0.5" />
                          <span className="text-gray-700">
                            Instant delivery - No waiting
                          </span>
                        </li>
                      </ul>
                      <Link
                        href="/generate"
                        className="mt-6 block w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-center"
                      >
                        Get Started Now
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span>Secure payment via Gumroad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>85%+ match score average</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                      <span>100+ satisfied users</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about ApplyPro
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-lg pr-8">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fadeInUp">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-blue-100 mb-8 animate-fadeInUp delay-100">
              Join hundreds of successful job seekers who transformed their
              careers with AI-tailored resumes. Your dream job is just one click
              away.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp delay-200">
              <Link
                href="/generate"
                className="group px-10 py-5 bg-white text-blue-600 text-lg font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
              >
                Get Started - $4.99
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="px-10 py-5 bg-transparent text-white text-lg font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
            <p className="mt-6 text-blue-100 text-sm animate-fadeInUp delay-300">
              No signup required • Instant results • Money-back guarantee
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
