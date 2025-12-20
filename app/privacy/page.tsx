import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Mail, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - ApplyPro",
  description: "Privacy policy for ApplyPro AI-powered resume tailoring service",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            <span>Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Privacy Policy
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
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to ApplyPro ("we," "our," or "us"). We are committed to
                protecting your privacy and being transparent about our data practices.
                This Privacy Policy explains how we collect, use, store, disclose, and
                safeguard your information when you use our AI-powered resume tailoring
                service at applypro.org.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                We comply with the General Data Protection Regulation (GDPR) and other
                applicable privacy laws. By using our Service, you consent to the data
                practices described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    2.1 Account Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    When you sign in with Google OAuth, we collect:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Profile picture (if provided by Google)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    2.2 Content You Provide
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li><strong>Resume Content:</strong> Your resume text, work experience, education, skills, and other professional information</li>
                    <li><strong>Job Descriptions:</strong> Job posting details you provide for resume tailoring</li>
                    <li><strong>Generated Content:</strong> AI-generated resumes, cover letters, and related documents</li>
                    <li><strong>Job Applications:</strong> Information about jobs you're tracking</li>
                    <li><strong>LinkedIn Profile Data:</strong> Your LinkedIn information if you use our LinkedIn Optimizer</li>
                    <li><strong>Interview Preparation:</strong> Interview questions and answers if you use our Interview Prep tool</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    2.3 Subscription & Payment Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Subscription plan and status</li>
                    <li>Usage counts and limits</li>
                    <li>Subscription dates and billing periods</li>
                    <li><strong>Note:</strong> Payment card details are collected and stored by Paddle (our payment processor), not by us directly</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    2.4 Automatically Collected Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>IP address</li>
                    <li>Pages visited and features used</li>
                    <li>Date, time, and duration of visits</li>
                    <li>Device information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li><strong>Provide Our Services:</strong> To generate tailored resumes, cover letters, and other career documents</li>
                <li><strong>Store Your History:</strong> To save your generated resumes and cover letters for later access</li>
                <li><strong>Track Applications:</strong> To help you manage and monitor your job applications</li>
                <li><strong>AI Processing:</strong> To send your content to Anthropic's Claude API for AI-powered analysis</li>
                <li><strong>Manage Subscriptions:</strong> To track usage limits and process renewals</li>
                <li><strong>Improve Our Service:</strong> To analyze usage patterns and improve features</li>
                <li><strong>Communicate:</strong> To send service-related emails and important updates</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Data Storage and Retention
              </h2>
              <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl mb-4">
                <p className="font-semibold text-blue-900 mb-2">
                  Transparency Notice
                </p>
                <p className="text-gray-700 text-sm">
                  We want to be clear about what data we store. Unlike some services that
                  claim not to store data, we do store certain information to provide you
                  with a better experience.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    4.1 What We Store
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li><strong>Account Data:</strong> Your name, email, profile picture, and account settings</li>
                    <li><strong>Generated Resumes:</strong> AI-generated resumes, ATS-optimized versions, and cover letters</li>
                    <li><strong>Generation Metadata:</strong> Job titles, company names, match scores, and creation dates</li>
                    <li><strong>Job Applications:</strong> Companies, positions, statuses, and dates you track</li>
                    <li><strong>Subscription Data:</strong> Plan type, usage counts, and subscription status</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    4.2 What We Don't Store
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li><strong>Original Resume Files:</strong> Your uploaded PDF/DOCX files are processed and then discarded</li>
                    <li><strong>Payment Card Details:</strong> These are handled entirely by Paddle</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    4.3 Data Retention
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We retain your data for as long as your account is active. You can delete
                    your account and all associated data at any time by contacting us at
                    support@applypro.org. Upon account deletion, we will remove all your
                    personal data within 30 days.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>HTTPS/TLS encryption for all data transmission</li>
                <li>Encrypted database connections</li>
                <li>Secure API communication with third-party services</li>
                <li>Regular security monitoring and updates</li>
                <li>Access controls and authentication for all systems</li>
                <li>Secure hosting on Vercel's infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Your Rights Under GDPR
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are in the European Economic Area (EEA), you have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Right to Restrict Processing:</strong> Request limits on data use</li>
                <li><strong>Right to Data Portability:</strong> Request data in a machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing for certain purposes</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise any of these rights, contact us at support@applypro.org. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We share data with the following third-party services:
              </p>

              <div className="grid gap-3">
                {[
                  { name: "Anthropic (Claude AI)", purpose: "AI-powered resume analysis", link: "https://www.anthropic.com/privacy" },
                  { name: "Google OAuth", purpose: "Secure authentication", link: "https://policies.google.com/privacy" },
                  { name: "Paddle", purpose: "Payment processing", link: "https://www.paddle.com/legal/privacy" },
                  { name: "PostHog", purpose: "Product analytics", link: "https://posthog.com/privacy" },
                  { name: "Vercel", purpose: "Website hosting", link: "https://vercel.com/legal/privacy-policy" },
                  { name: "Resend", purpose: "Email delivery", link: "https://resend.com/legal/privacy-policy" },
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                      <p className="text-xs text-gray-500">{service.purpose}</p>
                    </div>
                    <a href={service.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      Privacy Policy →
                    </a>
                  </div>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed mt-4 text-sm">
                We only share the minimum data necessary. We do not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Cookies and Tracking
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li><strong>Essential Cookies:</strong> NextAuth.js session cookies required for authentication</li>
                <li><strong>Analytics:</strong> PostHog tracking to understand usage and improve the experience</li>
                <li><strong>localStorage:</strong> Browser storage for caching preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are primarily located in the United States. If you are accessing
                our Service from outside the United States, your data will be transferred to
                and processed in the United States. We ensure appropriate safeguards are in
                place for international data transfers in compliance with GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                ApplyPro is not intended for users under the age of 16. We do not knowingly
                collect personal information from children. If you believe a child has provided
                us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                11. Changes to This Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. When we make significant
                changes, we will notify you by email and/or by posting a notice on our website.
                Continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                12. Contact Us
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy:
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
                <p className="text-xs text-gray-500 mt-4">
                  We will respond to all legitimate requests within 30 days.
                </p>
              </div>
            </section>

            <section className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-500 italic">
                This Privacy Policy was last updated on December 20, 2025. By using ApplyPro,
                you acknowledge that you have read and understood this Privacy Policy.
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
