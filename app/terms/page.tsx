import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Mail, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - ApplyPro",
  description: "Terms of service for ApplyPro AI-powered resume tailoring service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            <span>Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-500">
            Effective Date: December 20, 2025
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10">
          <div className="prose prose-gray max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to ApplyPro. By accessing or using our website at applypro.org and our
                AI-powered resume tailoring service (the "Service"), you agree to be bound by
                these Terms of Service ("Terms"). If you do not agree to these Terms, please
                do not use our Service.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                These Terms constitute a legally binding agreement between you ("you," "your,"
                or "User") and ApplyPro ("we," "us," or "our").
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Service Description
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ApplyPro is an AI-powered career tools platform that helps job seekers
                optimize their job search. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>AI-powered resume analysis and tailoring using Claude by Anthropic</li>
                <li>Job description matching and keyword optimization</li>
                <li>Tailored resume generation in multiple templates</li>
                <li>Professional cover letter generation</li>
                <li>ATS (Applicant Tracking System) compatibility checking</li>
                <li>Job Application Tracker</li>
                <li>LinkedIn Profile Optimizer</li>
                <li>Interview Preparation tools</li>
                <li>Resume Builder (from scratch)</li>
                <li>PDF and DOCX download formats</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Account Registration
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access paid features, you must create an account by signing in with
                Google OAuth. By creating an account, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Provide accurate and current information</li>
                <li>Maintain the security of your Google account</li>
                <li>Be responsible for all activities under your account</li>
                <li>Notify us immediately of unauthorized access</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                We reserve the right to suspend or terminate accounts that violate these
                Terms or engage in fraudulent or abusive activities.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Pricing and Payment
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">4.1 Pricing Plans</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li><strong>Free Plan:</strong> ATS Checker, Resume Builder, Job Tracker (up to 25 applications)</li>
                    <li><strong>Pay-Per-Use:</strong> $4.99 USD for 3 AI-tailored resume generations</li>
                    <li><strong>Pro Monthly:</strong> $19 USD/month for up to 100 resume generations per month</li>
                    <li><strong>Pro Yearly:</strong> $149 USD/year (save 35%)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">4.2 Payment Processing</h3>
                  <p className="text-gray-700 leading-relaxed">
                    All payments are processed securely through our trusted third-party payment
                    processor. We do not store your credit card or banking details on our servers.
                    By making a purchase, you agree to the payment processor's terms of service.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">4.3 Subscription Terms</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Pro subscriptions automatically renew unless cancelled. You can cancel at
                    any time from your dashboard. Cancellation takes effect at the end of the
                    current billing period.
                  </p>
                </div>
              </div>
            </section>

            <section id="refund-policy">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Refund Policy
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">5.1 Pay-Per-Use</h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Before use:</strong> Full refund within 14 days if no generations used.<br />
                    <strong>After use:</strong> No refunds once any credits have been used.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">5.2 Monthly Subscriptions</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You may cancel at any time. Access continues until the end of the billing
                    period. We do not offer prorated refunds for partial months.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">5.3 Yearly Subscriptions</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Full refund within 14 days if fewer than 10 resumes generated. After 14 days
                    or 10+ generations, no refunds available, but you may cancel to prevent renewals.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">5.4 Technical Issues</h3>
                  <p className="text-gray-700 leading-relaxed">
                    If you experience technical issues preventing service use, contact us at
                    support@applypro.org. We will provide replacement credits or a refund for
                    issues caused by our systems.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. User Responsibilities
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">You agree to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Provide accurate information in your resume and profiles</li>
                <li>Review and verify all AI-generated content before use</li>
                <li>Use the Service only for lawful purposes</li>
                <li>Not share your account credentials</li>
                <li>Not attempt to circumvent usage limits or security measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Prohibited Uses
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">You may not:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Create fraudulent or misleading resumes</li>
                <li>Violate any laws or third-party rights</li>
                <li>Reverse engineer or hack the Service</li>
                <li>Use automated systems to access the Service</li>
                <li>Resell or commercially exploit the Service</li>
                <li>Overload or disrupt our infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. AI-Generated Content Disclaimer
              </h2>
              <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
                <p className="font-semibold text-amber-900 mb-3">Important:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>AI-generated content is for assistance only</li>
                  <li>You must review and verify all content before use</li>
                  <li>AI may occasionally produce inaccurate or inappropriate content</li>
                  <li>You are responsible for ensuring your resume is truthful</li>
                  <li>We are not responsible for job application outcomes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Intellectual Property
              </h2>
              <div className="space-y-3">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Your Content:</strong> You retain rights to information you provide.
                  You grant us a license to process it for providing the Service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Generated Content:</strong> AI-generated resumes and cover letters
                  belong to you for personal use.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Our Platform:</strong> ApplyPro's website, software, and branding
                  are our intellectual property and may not be copied or modified.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Limitation of Liability
              </h2>
              <div className="bg-red-50 border border-red-200 p-5 rounded-xl">
                <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, APPLYPRO SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm">
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of profits or business opportunities</li>
                  <li>Failure to secure employment</li>
                  <li>Inaccuracies in AI-generated content</li>
                  <li>Service interruptions or technical failures</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3 text-sm">
                  Our total liability shall not exceed the amount you paid in the 12 months
                  preceding any claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                11. Disclaimer of Warranties
              </h2>
              <p className="text-gray-700 leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not
                guarantee specific results, uninterrupted service, or that AI-generated
                content will meet your expectations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                12. Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of ApplyPro is subject to our{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                13. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You may stop using the Service at any time. We may suspend or terminate
                your access for violations of these Terms. Upon termination, your right
                to use the Service ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                14. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may modify these Terms at any time. We will notify you of material
                changes via email or website notice. Continued use after changes
                constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                15. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of the United States. Any disputes
                will be resolved through good-faith negotiation first.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                16. Contact Us
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
                <p className="text-gray-700 mb-4">
                  For questions about these Terms:
                </p>
                <div className="space-y-2">
                  <a href="mailto:support@applypro.org" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                    <Mail className="w-4 h-4" />
                    support@applypro.org
                  </a>
                  <a href="https://applypro.org" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                    <Globe className="w-4 h-4" />
                    applypro.org
                  </a>
                </div>
              </div>
            </section>

            <section className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500 italic">
                These Terms of Service were last updated on December 20, 2025. By using
                ApplyPro, you acknowledge that you have read, understood, and agree to
                be bound by these Terms.
              </p>
            </section>
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
