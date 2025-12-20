import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - ApplyPro",
  description: "Privacy policy for ApplyPro AI-powered resume tailoring service",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-gray-600 mb-8">
            Effective Date: December 20, 2025
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.1 Account Information
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    When you sign in with Google OAuth, we collect:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Profile picture (if provided by Google)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.2 Content You Provide
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Resume Content:</strong> Your resume text, work experience,
                      education, skills, and other professional information you upload or enter
                    </li>
                    <li>
                      <strong>Job Descriptions:</strong> Job posting details you provide for
                      resume tailoring
                    </li>
                    <li>
                      <strong>Generated Content:</strong> AI-generated resumes, cover letters,
                      and related documents we create for you
                    </li>
                    <li>
                      <strong>Job Applications:</strong> Information about jobs you're tracking,
                      including company names, positions, application status, and dates
                    </li>
                    <li>
                      <strong>LinkedIn Profile Data:</strong> Your LinkedIn headline, summary,
                      and experience sections if you use our LinkedIn Optimizer
                    </li>
                    <li>
                      <strong>Interview Preparation:</strong> Interview questions, answers, and
                      preparation notes if you use our Interview Prep tool
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.3 Subscription & Payment Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Subscription plan and status</li>
                    <li>Usage counts and limits</li>
                    <li>Subscription dates and billing periods</li>
                    <li>
                      <strong>Note:</strong> Payment card details are collected and stored by
                      Paddle (our payment processor), not by us directly
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.4 Automatically Collected Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>IP address</li>
                    <li>Pages visited and features used</li>
                    <li>Date, time, and duration of visits</li>
                    <li>Referring website or source</li>
                    <li>Device information</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Provide Our Services:</strong> To generate tailored resumes,
                  cover letters, and other career documents
                </li>
                <li>
                  <strong>Store Your History:</strong> To save your generated resumes and
                  cover letters so you can access them later
                </li>
                <li>
                  <strong>Track Applications:</strong> To help you manage and monitor your
                  job applications
                </li>
                <li>
                  <strong>AI Processing:</strong> To send your content to Anthropic's Claude
                  API for AI-powered analysis and generation
                </li>
                <li>
                  <strong>Manage Subscriptions:</strong> To track usage limits, process
                  renewals, and enforce fair use policies
                </li>
                <li>
                  <strong>Improve Our Service:</strong> To analyze usage patterns and improve
                  our features (using aggregated, anonymized data)
                </li>
                <li>
                  <strong>Communicate:</strong> To send service-related emails, usage alerts,
                  and important updates
                </li>
                <li>
                  <strong>Security:</strong> To detect and prevent fraud, abuse, and
                  security incidents
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Data Storage and Retention
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-4">
                <p className="font-semibold text-blue-900 mb-2">
                  Transparency Notice:
                </p>
                <p className="text-gray-700">
                  We want to be clear about what data we store. Unlike some services that
                  claim not to store data, we do store certain information to provide you
                  with a better experience. Here's exactly what we keep:
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.1 What We Store in Our Database
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Account Data:</strong> Your name, email, profile picture, and
                      account settings
                    </li>
                    <li>
                      <strong>Generated Resumes:</strong> The full text of AI-generated resumes,
                      ATS-optimized versions, and cover letters you create
                    </li>
                    <li>
                      <strong>Generation Metadata:</strong> Job titles, company names, match
                      scores, and creation dates for each generation
                    </li>
                    <li>
                      <strong>Job Applications:</strong> Companies, positions, statuses, dates,
                      and notes for jobs you track
                    </li>
                    <li>
                      <strong>LinkedIn Optimizations:</strong> Your optimized headlines, summaries,
                      and saved optimization history
                    </li>
                    <li>
                      <strong>Interview Preparations:</strong> Generated questions, suggested
                      answers, and preparation sessions
                    </li>
                    <li>
                      <strong>Subscription Data:</strong> Plan type, usage counts, billing dates,
                      and subscription status
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.2 What We Don't Store
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Original Resume Files:</strong> Your uploaded PDF/DOCX files are
                      processed for text extraction and then discarded
                    </li>
                    <li>
                      <strong>Payment Card Details:</strong> These are handled entirely by
                      Paddle and never touch our servers
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.3 Temporary Storage
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Browser localStorage:</strong> May temporarily cache your resume
                      text and job description for convenience during your session
                    </li>
                    <li>
                      <strong>Server Logs:</strong> Access and error logs retained for up to
                      30 days for security and debugging
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.4 Data Retention
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We retain your data for as long as your account is active. You can delete
                    your account and all associated data at any time by contacting us at
                    support@applypro.org. Upon account deletion, we will remove all your
                    personal data within 30 days, except where retention is required by law.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>HTTPS/TLS encryption for all data transmission</li>
                <li>Encrypted database connections</li>
                <li>Secure API communication with third-party services</li>
                <li>Regular security monitoring and updates</li>
                <li>Access controls and authentication for all systems</li>
                <li>Secure hosting on Vercel's infrastructure</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                While we take security seriously, no method of transmission over the Internet
                is 100% secure. We cannot guarantee absolute security of your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Your Rights Under GDPR
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are in the European Economic Area (EEA), you have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Right to Access:</strong> Request a copy of all personal data we
                  hold about you
                </li>
                <li>
                  <strong>Right to Rectification:</strong> Request correction of inaccurate
                  or incomplete data
                </li>
                <li>
                  <strong>Right to Erasure:</strong> Request deletion of your personal data
                  ("right to be forgotten")
                </li>
                <li>
                  <strong>Right to Restrict Processing:</strong> Request that we limit how
                  we use your data
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Request your data in a
                  structured, machine-readable format
                </li>
                <li>
                  <strong>Right to Object:</strong> Object to processing of your data for
                  certain purposes
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> Withdraw your consent at any
                  time (this won't affect the lawfulness of prior processing)
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:support@applypro.org"
                  className="text-blue-600 hover:underline font-medium"
                >
                  support@applypro.org
                </a>
                . We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We share data with the following third-party services to provide our Service:
              </p>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Anthropic (Claude AI)</h4>
                  <p className="text-gray-700 text-sm">
                    <strong>Purpose:</strong> AI-powered resume analysis and generation<br />
                    <strong>Data Shared:</strong> Resume content, job descriptions<br />
                    <strong>Privacy Policy:</strong>{" "}
                    <a href="https://www.anthropic.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      anthropic.com/privacy
                    </a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Google OAuth</h4>
                  <p className="text-gray-700 text-sm">
                    <strong>Purpose:</strong> Secure authentication<br />
                    <strong>Data Shared:</strong> Authentication tokens<br />
                    <strong>Privacy Policy:</strong>{" "}
                    <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      policies.google.com/privacy
                    </a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Paddle</h4>
                  <p className="text-gray-700 text-sm">
                    <strong>Purpose:</strong> Payment processing, subscription management<br />
                    <strong>Data Shared:</strong> Email, transaction details<br />
                    <strong>Privacy Policy:</strong>{" "}
                    <a href="https://www.paddle.com/legal/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      paddle.com/legal/privacy
                    </a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">PostHog</h4>
                  <p className="text-gray-700 text-sm">
                    <strong>Purpose:</strong> Product analytics, usage tracking<br />
                    <strong>Data Shared:</strong> Page views, feature usage, anonymized user behavior<br />
                    <strong>Privacy Policy:</strong>{" "}
                    <a href="https://posthog.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      posthog.com/privacy
                    </a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Vercel</h4>
                  <p className="text-gray-700 text-sm">
                    <strong>Purpose:</strong> Website hosting, serverless infrastructure<br />
                    <strong>Data Shared:</strong> Server logs, IP addresses<br />
                    <strong>Privacy Policy:</strong>{" "}
                    <a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      vercel.com/legal/privacy-policy
                    </a>
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Resend</h4>
                  <p className="text-gray-700 text-sm">
                    <strong>Purpose:</strong> Transactional email delivery<br />
                    <strong>Data Shared:</strong> Email addresses, email content<br />
                    <strong>Privacy Policy:</strong>{" "}
                    <a href="https://resend.com/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      resend.com/legal/privacy-policy
                    </a>
                  </p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mt-4">
                We only share the minimum data necessary with these services to provide
                our functionality. We do not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the following cookies and tracking technologies:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Essential Cookies:</strong> NextAuth.js session cookies required
                  for authentication (necessary for the service to function)
                </li>
                <li>
                  <strong>Analytics:</strong> PostHog tracking to understand how users
                  interact with our service and improve the user experience
                </li>
                <li>
                  <strong>localStorage:</strong> Browser storage for caching your resume
                  text and preferences for convenience
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can disable cookies in your browser settings, but this may affect
                the functionality of our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our services and third-party providers are primarily located in the United
                States. If you are accessing our Service from outside the United States,
                your data will be transferred to, stored, and processed in the United States
                and potentially other countries. By using our Service, you consent to these
                transfers. We ensure appropriate safeguards are in place for international
                data transfers in compliance with GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                ApplyPro is not intended for users under the age of 16. We do not knowingly
                collect personal information from children. If you are a parent or guardian
                and believe your child has provided us with personal information, please
                contact us immediately at support@applypro.org, and we will delete the
                information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. When we make significant
                changes, we will notify you by email (if you have an account) and/or by
                posting a prominent notice on our website. The "Effective Date" at the top
                will be updated. Your continued use of our Service after changes are posted
                constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Contact Us
              </h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy
                  Policy or our data practices, please contact us:
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
                    <a
                      href="https://applypro.org"
                      className="text-blue-600 hover:underline"
                    >
                      applypro.org
                    </a>
                  </p>
                  <p className="text-sm text-gray-600 mt-4">
                    We will respond to all legitimate requests within 30 days.
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-600 italic">
                This Privacy Policy was last updated on December 20, 2025. By using ApplyPro,
                you acknowledge that you have read and understood this Privacy Policy and
                agree to its terms.
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
