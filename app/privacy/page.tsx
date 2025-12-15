import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - ApplyPro",
  description: "Privacy policy for ApplyPro AI-powered resume tailoring service",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
            Effective Date: December 2, 2025
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to ApplyPro ("we," "our," or "us"). We are committed to
                protecting your privacy and personal information. This Privacy
                Policy explains how we collect, use, disclose, and safeguard
                your information when you use our AI-powered resume tailoring
                service at applypro.org.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.1 Information You Provide
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Account Information:</strong> Name, email address, and profile picture
                      when you sign in with Google OAuth
                    </li>
                    <li>
                      <strong>Resume Content:</strong> Your resume text,
                      including work experience, education, and skills
                    </li>
                    <li>
                      <strong>Job Descriptions:</strong> Job posting details you
                      provide for tailoring
                    </li>
                    <li>
                      <strong>Payment Information:</strong> Billing information and transaction details
                      (collected and stored by Lemon Squeezy, not directly by us)
                    </li>
                    <li>
                      <strong>Subscription Data:</strong> Your subscription plan, status, and usage limits
                    </li>
                    <li>
                      <strong>License Keys:</strong> License keys for Pay-Per-Use plan access verification
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    2.2 Automatically Collected Information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>IP address (anonymized)</li>
                    <li>Page views and navigation patterns</li>
                    <li>Date and time of access</li>
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
                  <strong>Authentication:</strong> To create and manage your account using Google OAuth
                </li>
                <li>
                  <strong>AI Processing:</strong> Your resume and job
                  description are sent to Anthropic's Claude API for real-time
                  processing and tailoring
                </li>
                <li>
                  <strong>Service Delivery:</strong> To generate tailored
                  resumes and cover letters based on your input
                </li>
                <li>
                  <strong>Payment Processing:</strong> To process payments and manage subscriptions
                  through Lemon Squeezy
                </li>
                <li>
                  <strong>Subscription Management:</strong> To track your subscription plan, usage limits,
                  and generation history
                </li>
                <li>
                  <strong>License Tracking:</strong> To manage Pay-Per-Use license keys and prevent
                  unauthorized use
                </li>
                <li>
                  <strong>Service Improvement:</strong> To monitor performance
                  and identify technical issues
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Data Storage and Retention
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Important:</strong> We prioritize data minimization and
                privacy:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Account Data:</strong> Your name, email, profile picture, and subscription
                  information are stored in our secure PostgreSQL database
                </li>
                <li>
                  <strong>Resume Content:</strong> Your resume text and job descriptions are
                  NOT permanently stored. They are processed in real-time and may be cached
                  temporarily in your browser's localStorage for convenience
                </li>
                <li>
                  <strong>Real-Time Processing:</strong> All AI processing
                  happens in real-time during your session through Anthropic's Claude API
                </li>
                <li>
                  <strong>License Keys and Usage:</strong> Pay-Per-Use license keys and usage counts
                  are stored in our database to manage subscriptions and prevent unauthorized use
                </li>
                <li>
                  <strong>Generation History:</strong> We track the number of resumes you've generated
                  to enforce subscription limits, but do not store the actual resume content
                </li>
                <li>
                  <strong>Data Retention:</strong> Account data is retained while your account is active.
                  You may request account deletion at any time
                </li>
                <li>
                  <strong>Server Logs:</strong> Basic error and access logs may be
                  retained for up to 30 days for security and debugging purposes
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your
                information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>HTTPS encryption for all data transmission</li>
                <li>Secure API communication with third-party services</li>
                <li>No permanent storage of sensitive personal information</li>
                <li>Regular security monitoring and updates</li>
                <li>Access controls and authentication for administrative systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Your Rights (GDPR & CCPA Compliance)
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Right to Access:</strong> Request information about
                  data we process
                </li>
                <li>
                  <strong>Right to Deletion:</strong> Request deletion of your
                  data (note: most data is not permanently stored)
                </li>
                <li>
                  <strong>Right to Correction:</strong> Request correction of
                  inaccurate data
                </li>
                <li>
                  <strong>Right to Object:</strong> Object to certain data
                  processing activities
                </li>
                <li>
                  <strong>Right to Data Portability:</strong> Request a copy of
                  your data in a structured format
                </li>
                <li>
                  <strong>Right to Withdraw Consent:</strong> Withdraw consent
                  at any time
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise any of these rights, please contact us at{" "}
                <a
                  href="mailto:support@applypro.org"
                  className="text-blue-600 hover:underline font-medium"
                >
                  support@applypro.org
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the following trusted third-party services to provide our service:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Google OAuth:</strong> For secure authentication. Google's Privacy Policy
                  applies to data collected during sign-in
                </li>
                <li>
                  <strong>Anthropic (Claude API):</strong> For AI-powered resume generation.
                  Your resume content is processed by Anthropic's API. See Anthropic's Privacy Policy
                  for details on their data handling
                </li>
                <li>
                  <strong>Lemon Squeezy:</strong> For payment processing and subscription management.
                  Lemon Squeezy handles all payment information as our merchant of record. See Lemon Squeezy's Privacy Policy for details
                </li>
                <li>
                  <strong>Vercel:</strong> Our hosting provider. Server infrastructure and deployment
                </li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                These third parties have their own privacy policies and we encourage you to review them.
                We only share the minimum necessary information with these services to provide our functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use minimal cookies and browser storage:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                <li>
                  <strong>Authentication Cookies:</strong> NextAuth.js session cookies to keep
                  you logged in (essential for service functionality)
                </li>
                <li>
                  <strong>localStorage:</strong> May temporarily cache your resume text and job
                  description for convenience while you're actively using the service
                </li>
                <li>
                  <strong>Essential Cookies:</strong> Required for basic site
                  functionality and security
                </li>
                <li>
                  <strong>No Third-Party Tracking:</strong> We do not use
                  advertising, marketing, or analytics cookies
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are hosted in the United States. By using ApplyPro,
                you consent to the transfer of your information to the United
                States and processing according to this Privacy Policy. We
                ensure appropriate safeguards are in place for international
                data transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                ApplyPro is not intended for users under the age of 18. We do
                not knowingly collect personal information from children. If you
                are a parent or guardian and believe your child has provided us
                with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. Changes
                will be posted on this page with an updated "Effective Date." We
                encourage you to review this Privacy Policy periodically for any
                changes. Continued use of our service after changes constitutes
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Contact Us
              </h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding
                  this Privacy Policy or our data practices, please contact us:
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
                This Privacy Policy was last updated on December 2, 2025. By
                using ApplyPro, you acknowledge that you have read and
                understood this Privacy Policy and agree to its terms.
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
