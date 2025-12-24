"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
  PenTool,
  ArrowRight,
  Play,
  Users,
  Award,
  Clock,
  ChevronDown,
  Brain,
  Linkedin,
  BarChart3,
  CheckCircle,
} from "lucide-react";

interface Subscription {
  plan: string;
  status: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Fetch subscription status for logged-in users
  useEffect(() => {
    async function fetchSubscription() {
      if (!session?.user) return;
      
      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      }
    }

    fetchSubscription();
  }, [session?.user]);

  const isSubscribed = subscription?.status === 'active';
  const currentPlan = subscription?.plan;

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
        "Yes! With Pro plans, you get up to 100 resume generations per month. Pay-per-use gives you 3 resumes for $4.99. This flexibility lets you tailor your resume for each job application.",
    },
    {
      question: "What file formats do you support?",
      answer:
        "You can upload your resume as PDF or DOCX. After generation, you can download your tailored resume in both PDF and DOCX formats, ready to submit to any employer.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! We take data security and privacy seriously. Your data is stored securely in encrypted databases and is used only to provide our services to you. We comply with GDPR regulations, which means you have the right to access, modify, or delete your personal data at any time. We never sell your information to third parties. For full details, please read our Privacy Policy.",
    },
    {
      question: "What if I don't have a resume yet?",
      answer:
        "No problem! We offer a free Resume Builder that guides you step-by-step to create a professional resume from scratch. Just click 'Build Resume' to get started.",
    },
  ];

  // Helper function to get plan display name
  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'monthly': return 'Pro Monthly';
      case 'yearly': return 'Pro Yearly';
      case 'pay-per-use': return 'Resume Pack';
      default: return plan;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-100/40 to-cyan-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Resume Optimization</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center text-gray-900 mb-6 leading-tight">
              Get More Interviews with{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI-Tailored Resumes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 text-center mb-8 max-w-3xl mx-auto">
              Upload your resume, paste a job description, and get a perfectly tailored resume that beats ATS systems and impresses recruiters.
            </p>

            {/* CTA Buttons - Different for logged in vs logged out users */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              {session?.user ? (
                // Logged in user CTAs
                <>
                  <Link
                    href="/generate"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Generate Resume
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </>
              ) : (
                // Logged out user CTAs
                <>
                  <Link
                    href="/generate"
                    className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Start Free Analysis
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/ats-checker"
                    className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <Target className="w-5 h-5 text-green-600" />
                    Free ATS Check
                  </Link>
                </>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-12">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Results in 60 seconds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>85%+ ATS match scores</span>
              </div>
            </div>

            {/* Social Proof Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gray-900">10,000+</p>
                <p className="text-sm text-gray-500">Resumes Generated</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-200" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gray-900">85%</p>
                <p className="text-sm text-gray-500">Avg. Match Score</p>
              </div>
              <div className="hidden sm:block w-px h-12 bg-gray-200" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-gray-900">3x</p>
                <p className="text-sm text-gray-500">More Interviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Land the Job
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A complete suite of AI-powered tools to optimize every step of your job search
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                AI Resume Tailoring
              </h3>
              <p className="text-gray-600">
                Automatically customize your resume for each job. Our AI matches keywords, skills, and experience to the job description.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 hover:shadow-lg hover:border-green-200 transition-all duration-300">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ATS Optimization
              </h3>
              <p className="text-gray-600">
                Beat Applicant Tracking Systems with keyword optimization and ATS-friendly formatting that gets you past the bots.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 hover:shadow-lg hover:border-purple-200 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cover Letter Generator
              </h3>
              <p className="text-gray-600">
                Get a professionally written cover letter that complements your resume and speaks directly to the job requirements.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 hover:shadow-lg hover:border-amber-200 transition-all duration-300">
              <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Interview Prep
              </h3>
              <p className="text-gray-600">
                Get AI-generated interview questions and answers based on the job description. Walk in prepared and confident.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 bg-gradient-to-br from-cyan-50 to-white rounded-2xl border border-cyan-100 hover:shadow-lg hover:border-cyan-200 transition-all duration-300">
              <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Linkedin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                LinkedIn Optimizer
              </h3>
              <p className="text-gray-600">
                Optimize your LinkedIn profile to attract recruiters. Get suggestions for your headline, summary, and experience sections.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-rose-100 hover:shadow-lg hover:border-rose-200 transition-all duration-300">
              <div className="w-12 h-12 bg-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Application Tracker
              </h3>
              <p className="text-gray-600">
                Keep track of all your job applications in one place. Never lose track of where you applied or follow-up dates.
              </p>
            </div>
          </div>

          {/* No Resume CTA */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-50 border border-purple-200 rounded-xl">
              <PenTool className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700">Don't have a resume yet?</span>
              <Link
                href="/build-resume"
                className="text-purple-600 font-semibold hover:text-purple-700 inline-flex items-center gap-1"
              >
                Build one from scratch
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get your tailored resume in three simple steps
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-all h-full">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                    1
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Upload className="w-7 h-7 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Upload Your Resume
                  </h3>
                  <p className="text-gray-600">
                    Upload your existing resume as PDF or DOCX. Our AI extracts and analyzes your experience.
                  </p>
                </div>
                {/* Connector */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300" />
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-all h-full">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                    2
                  </div>
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Paste Job Description
                  </h3>
                  <p className="text-gray-600">
                    Copy the job posting you want to apply for. Our AI identifies key requirements and keywords.
                  </p>
                </div>
                {/* Connector */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300" />
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-all h-full">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                    3
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Download className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Download & Apply
                  </h3>
                  <p className="text-gray-600">
                    Get your tailored resume and cover letter. Download as PDF or DOCX and start applying!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>

          {/* Current Plan Banner for subscribed users */}
          {isSubscribed && (
            <div className="max-w-5xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white text-center">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    You're currently subscribed to {getPlanDisplayName(currentPlan || '')}
                  </span>
                  <Link 
                    href="/dashboard" 
                    className="ml-2 underline hover:no-underline"
                  >
                    Manage subscription →
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-gray-300 transition-all">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-gray-900">$0</span>
                  </div>
                  <p className="text-gray-500">Forever free</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Free ATS Resume Checker</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Resume Builder (from scratch)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Job Application Tracker</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Track up to 25 applications</span>
                  </li>
                </ul>

                <Link
                  href={session?.user ? "/dashboard" : "/signup"}
                  className="block w-full text-center py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  {session?.user ? "Go to Dashboard" : "Get Started Free"}
                </Link>
              </div>

              {/* Pro Plan - Highlighted */}
              <div className={`bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-xl relative scale-105 ${currentPlan === 'monthly' ? 'ring-4 ring-green-400' : ''}`}>
                {/* Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  {currentPlan === 'monthly' ? (
                    <span className="px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      CURRENT PLAN
                    </span>
                  ) : (
                    <span className="px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  )}
                </div>

                <div className="text-center mb-8 text-white">
                  <h3 className="text-xl font-bold mb-2">Pro Monthly</h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold">$19</span>
                    <span className="text-blue-200">/month</span>
                  </div>
                  <p className="text-blue-200">100 resumes per month</p>
                </div>

                <ul className="space-y-4 mb-8 text-white">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span><strong>100 AI-tailored resumes/month</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>All professional templates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>Cover letter generation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>Interview prep tools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>LinkedIn optimizer</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>

                {currentPlan === 'monthly' ? (
                  <Link
                    href="/dashboard"
                    className="block w-full text-center py-3 px-6 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                  >
                    Manage Subscription
                  </Link>
                ) : (
                  <Link
                    href="/pricing"
                    className="block w-full text-center py-3 px-6 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    {currentPlan === 'yearly' ? 'Current: Yearly' : 'Get Started'}
                  </Link>
                )}
              </div>

              {/* Pro Yearly Plan */}
              <div className={`bg-white rounded-2xl p-8 border-2 ${currentPlan === 'yearly' ? 'border-green-500 ring-4 ring-green-200' : 'border-purple-200 hover:border-purple-300'} transition-all relative`}>
                {/* Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  {currentPlan === 'yearly' ? (
                    <span className="px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      CURRENT PLAN
                    </span>
                  ) : (
                    <span className="px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full shadow-lg">
                      SAVE 35%
                    </span>
                  )}
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Yearly</h3>
                  <div className="mb-2">
                    <span className="text-lg text-gray-400 line-through mr-2">$228</span>
                    <span className="text-5xl font-bold text-gray-900">$149</span>
                    <span className="text-gray-500">/year</span>
                  </div>
                  <p className="text-gray-500">~$12.42/month</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700"><strong>Everything in Pro Monthly</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">100 resumes/month all year</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Early access to new features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Best value for active seekers</span>
                  </li>
                </ul>

                {currentPlan === 'yearly' ? (
                  <Link
                    href="/dashboard"
                    className="block w-full text-center py-3 px-6 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                  >
                    Manage Subscription
                  </Link>
                ) : (
                  <Link
                    href="/pricing"
                    className="block w-full text-center py-3 px-6 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    {currentPlan === 'monthly' ? 'Upgrade to Yearly' : 'Get Yearly'}
                  </Link>
                )}
              </div>
            </div>

            {/* Pay-per-use option */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Just need a few resumes?{" "}
                <Link href="/pricing" className="text-blue-600 font-semibold hover:text-blue-700">
                  Get 3 resumes for $4.99 
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
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
                className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-8">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {isSubscribed ? "Ready to Generate Your Next Resume?" : "Ready to Land More Interviews?"}
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              {isSubscribed 
                ? "You have an active subscription. Start generating tailored resumes now!"
                : "Join thousands of job seekers who've transformed their job search with AI-tailored resumes."
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isSubscribed ? (
                <>
                  <Link
                    href="/generate"
                    className="group px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Generate Resume
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-xl border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300 inline-flex items-center gap-2"
                  >
                    View Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/generate"
                    className="group px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Start Free Analysis
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/build-resume"
                    className="px-8 py-4 bg-transparent text-white text-lg font-semibold rounded-xl border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <PenTool className="w-5 h-5" />
                    Build From Scratch
                  </Link>
                </>
              )}
            </div>
            {!isSubscribed && (
              <p className="mt-6 text-blue-200 text-sm">
                No credit card required • Free analysis • Results in 60 seconds
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
