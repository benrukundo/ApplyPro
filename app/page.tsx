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

  // Payment links - redirecting to coming soon page
  const payPerUseLink = '/coming-soon';
  const monthlyLink = '/coming-soon';
  const yearlyLink = '/coming-soon';

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
        "Yes! Each $4.99 purchase includes 3 resume generations, perfect for tailoring your resume to multiple job applications. This gives you the flexibility to apply to different positions with optimized resumes for each.",
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 animate-fadeInUp delay-200">
              <Link
                href="/generate"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
              >
                Try Free Preview
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
              <Link
                href="/templates"
                className="px-8 py-4 bg-white text-gray-900 text-lg font-semibold rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 inline-flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                View Templates
              </Link>
            </div>

            <div className="mb-8 animate-fadeInUp delay-300">
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
              >
                <span>Already purchased? Generate resume</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <p className="text-xs text-gray-500 mt-1">Have a license key? Click here</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 animate-fadeInUp delay-400">
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

      {/* Free ATS Checker Banner */}
      <section className="py-12 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-4">
              <Target className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold text-white">
                100% Free • No Signup Required
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Not Ready to Buy? Try Our Free ATS Checker First!
            </h2>
            <p className="text-lg text-green-100 mb-6 max-w-2xl mx-auto">
              See if your resume can pass Applicant Tracking Systems. Get instant feedback on formatting, keywords, and compatibility.
            </p>
            <Link
              href="/ats-checker"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-600 text-lg font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Shield className="w-5 h-5" />
              Check My Resume For Free
            </Link>
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
              Flexible Pricing for Every Job Seeker
            </h2>
            <p className="text-xl text-gray-600 mb-4">
              Free tools, pay-per-use, or unlimited with Pro
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span><strong>Free:</strong> ATS Checker, Tracker</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span><strong>Pay-Per-Use:</strong> $4.99 for 3 resumes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span><strong>Pro:</strong> $19/month or $149/year</span>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-6">
              {/* FREE PLAN */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:shadow-xl transition">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Free</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">$0</span>
                  </div>
                  <p className="text-gray-600 mb-6">Perfect for getting started</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Free ATS Resume Checker</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Resume Score Dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Job Application Tracker</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Track up to 25 applications</span>
                  </li>
                </ul>

                <Link
                  href="/signup"
                  className="block w-full text-center bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Get Started Free
                </Link>
              </div>

              {/* PAY-PER-USE PLAN */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-200 hover:shadow-xl transition">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Pay-Per-Use</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">$4.99</span>
                    <span className="text-gray-600"> / 3 resumes</span>
                  </div>
                  <p className="text-gray-600 mb-6">Perfect for occasional use</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700"><strong>3 AI-tailored resumes</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">All 3 professional templates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">PDF & DOCX downloads</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">ATS optimization included</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Only $1.66 per resume</span>
                  </li>
                </ul>

                <Link
                  href={payPerUseLink}
                  className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Buy Now
                </Link>
              </div>

              {/* PRO PLAN */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-8 border-2 border-blue-500 relative hover:shadow-xl transition transform hover:scale-105">
                {/* Popular badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>

                <div className="text-center text-white">
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold">$19</span>
                    <span className="text-blue-200"> / month</span>
                  </div>
                  <p className="text-blue-200 mb-6">Unlimited resume generation*</p>
                </div>

                <ul className="space-y-4 mb-8 text-white">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                    <span><strong>Unlimited AI-tailored resumes*</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                    <span>All 3 professional templates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                    <span>Unlimited job tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                    <span>Priority email support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                    <span>Early access to new features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                    <span>Cancel anytime</span>
                  </li>
                </ul>

                <Link
                  href={monthlyLink}
                  className="block w-full text-center bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Subscribe Now
                </Link>

                <p className="text-xs text-blue-200 mt-4 text-center">
                  *Fair use: 100 resumes/month for personal job search
                </p>
              </div>

              {/* PRO YEARLY PLAN */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-200 hover:shadow-xl transition relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    BEST VALUE
                  </span>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">Pro Yearly</h3>
                  <div className="mb-2">
                    <span className="text-lg text-gray-400 line-through mr-2">$228</span>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">$149</span>
                    <span className="text-gray-600"> / year</span>
                  </div>
                  <p className="text-gray-600 mb-6">Save 35% vs monthly</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Unlimited AI-tailored resumes*</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">All 3 professional templates</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited job tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Priority email support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Early access to new features</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">Cancel anytime</span>
                  </li>
                </ul>

                <Link
                  href={yearlyLink}
                  className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Subscribe Yearly
                </Link>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  *Fair use: 100 resumes/month for personal job search
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>85%+ match score average</span>
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
