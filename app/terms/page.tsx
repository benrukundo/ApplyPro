import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - ApplyPro",
  description: "Terms of service for ApplyPro AI-powered resume tailoring service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">
            Effective Date: December 20, 2025
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to ApplyPro. By accessing or using our website at
                applypro.org and our AI-powered resume tailoring service (the
                "Service"), you agree to be bound by these Terms of Service
                ("Terms"). If you do not agree to these Terms, please do not use
                our Service.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                These Terms constitute a legally binding agreement between you
                ("you," "your," or "User") and ApplyPro ("we," "us," or "our").
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Service Description
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ApplyPro is an AI-powered career tools platform that helps job seekers
                optimize their job search. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Account Registration
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access paid features, you must create an account by signing in with
                Google OAuth. By creating an account, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Pricing and Payment
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.1 Pricing Plans
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Free Plan:</strong> ATS Checker, Resume Builder, Job Tracker
                      (up to 25 applications)
                    </li>
                    <li>
                      <strong>Pay-Per-Use:</strong> $4.99 USD for 3 AI-tailored resume
                      generations
                    </li>
                    <li>
                      <strong>Pro Monthly:</strong> $19 USD/month for up to 100 resume
                      generations per month
                    </li>
                    <li>
                      <strong>Pro Yearly:</strong> $149 USD/year (save 35%)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.2 Payment Processing
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    All payments are processed by Paddle, our merchant of record. Paddle
                    handles billing, taxes, and payment processing. By making a purchase,
                    you agree to Paddle's terms of service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.3 Subscription Terms
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Pro subscriptions automatically renew at the end of each billing period
                    unless cancelled. You can cancel at any time from your dashboard or by
                    contacting support. Cancellation takes effect at the end of the current
                    billing period.
                  </p>
                </div>
              </div>
            </section>

            <section id="refund-policy">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Refund Policy
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.1 Pay-Per-Use
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Before use:</strong> Full refund within 14 days if no generations
                    have been used.<br />
                    <strong>After use:</strong> No refunds once any generation credits have
                    been used, due to the digital nature of the service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.2 Monthly Subscriptions
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    You may cancel at any time. Access continues until the end of the billing
                    period. We do not offer prorated refunds for partial months.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.3 Yearly Subscriptions
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Full refund within 14 days of purchase if fewer than 10 resumes have been
                    generated. After 14 days or 10+ generations, no refunds are available, but
                    you may cancel to prevent future renewals.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    5.4 Technical Issues
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    If you experience technical issues preventing service use, contact us at
                    support@applypro.org. We will provide replacement credits or a refund for
                    issues caused by our systems.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. User Responsibilities
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Provide accurate information in your resume and profiles</li>
                <li>Review and verify all AI-generated content before use</li>
                <li>Use the Service only for lawful purposes</li>
                <li>Not share your account credentials</li>
                <li>Not attempt to circumvent usage limits or security measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Prohibited Uses
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Create fraudulent or misleading resumes</li>
                <li>Violate any laws or third-party rights</li>
                <li>Reverse engineer or hack the Service</li>
                <li>Use automated systems to access the Service</li>
                <li>Resell or commercially exploit the Service</li>
                <li>Overload or disrupt our infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. AI-Generated Content Disclaimer
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <p className="font-semibold text-yellow-900 mb-3">Important:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>AI-generated content is for assistance only</li>
                  <li>You must review and verify all content before use</li>
                  <li>AI may occasionally produce inaccurate or inappropriate content</li>
                  <li>You are responsible for ensuring your resume is truthful</li>
                  <li>We are not responsible for job application outcomes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Intellectual Property
              </h2>
              <div className="space-y-4">
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Limitation of Liability
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, APPLYPRO SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of profits or business opportunities</li>
                  <li>Failure to secure employment</li>
                  <li>Inaccuracies in AI-generated content</li>
                  <li>Service interruptions or technical failures</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Our total liability shall not exceed the amount you paid in the 12 months
                  preceding any claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Disclaimer of Warranties
              </h2>
              <p className="text-gray-700 leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not
                guarantee specific results, uninterrupted service, or that AI-generated
                content will meet your expectations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You may stop using the Service at any time. We may suspend or terminate
                your access for violations of these Terms. Upon termination, your right
                to use the Service ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may modify these Terms at any time. We will notify you of material
                changes via email or website notice. Continued use after changes
                constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                15. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of the United States. Any disputes
                will be resolved through good-faith negotiation first. If unresolved,
                disputes may be brought in the appropriate courts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                16. Contact Us
              </h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  For questions about these Terms:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:support@applypro.org"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      support@applypro.org
                    </a>
                  </p>
                  <p>
                    <strong>Website:</strong>{" "}
                    <a href="https://applypro.org" className="text-blue-600 hover:underline">
                      applypro.org
                    </a>
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-600 italic">
                These Terms of Service were last updated on December 20, 2025. By using
                ApplyPro, you acknowledge that you have read, understood, and agree to
                be bound by these Terms.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
