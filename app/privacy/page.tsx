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
                      <strong>Resume Content:</strong> Your resume text,
                      including work experience, education, and skills
                    </li>
                    <li>
                      <strong>Job Descriptions:</strong> Job posting details you
                      provide for tailoring
                    </li>
                    <li>
                      <strong>Payment Information:</strong> Email address
                      associated with your Gumroad purchase (collected by
                      Gumroad, not stored by us)
                    </li>
                    <li>
                      <strong>License Keys:</strong> Gumroad-generated license
                      keys for service access verification
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
                  <strong>AI Processing:</strong> Your resume and job
                  description are sent to Anthropic's Claude API for real-time
                  processing and tailoring
                </li>
                <li>
                  <strong>Service Delivery:</strong> To generate tailored
                  resumes and cover letters based on your input
                </li>
                <li>
                  <strong>Payment Verification:</strong> To verify license key
                  validity through Gumroad's API
                </li>
                <li>
                  <strong>License Tracking:</strong> To prevent duplicate use of
                  single-use license keys
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
                  <strong>No Permanent Storage:</strong> Your resume text and
                  job descriptions are NOT stored in any database
                </li>
                <li>
                  <strong>Real-Time Processing:</strong> All AI processing
                  happens in real-time during your session
                </li>
                <li>
                  <strong>License Keys:</strong> Used license keys are stored
                  temporarily in server memory to prevent reuse (cleared on
                  server restart)
                </li>
                <li>
                  <strong>Server Logs:</strong> Basic error logs may be
                  retained for up to 30 days for debugging purposes
                </li>
                <li>
                  <strong>No Long-Term Data:</strong> Once you close your
                  browser or complete the session, your personal content is not
                  retained
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
                7. Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use minimal cookies and browser storage:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                <li>
                  <strong>sessionStorage:</strong> Temporary storage during your
                  browsing session (cleared when you close the browser)
                </li>
                <li>
                  <strong>Essential Cookies:</strong> Required for basic site
                  functionality
                </li>
                <li>
                  <strong>No Third-Party Tracking:</strong> We do not use
                  advertising or analytics cookies
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. International Data Transfers
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
                9. Children's Privacy
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
                10. Changes to This Privacy Policy
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
                11. Contact Us
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
