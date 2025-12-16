import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - ApplyPro",
  description: "Terms of service for ApplyPro AI-powered resume tailoring service",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-gray-600 mb-8">
            Effective Date: December 2, 2025
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
                ApplyPro is an AI-powered resume tailoring service that helps
                users optimize their resumes and create cover letters for
                specific job applications. Our Service includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Google OAuth authentication for secure account access</li>
                <li>AI-powered resume analysis and optimization using Claude by Anthropic</li>
                <li>Job description matching and keyword optimization</li>
                <li>Tailored resume generation in multiple templates (Modern, Traditional, ATS-Optimized)</li>
                <li>Professional cover letter generation</li>
                <li>ATS (Applicant Tracking System) compatibility scoring and optimization</li>
                <li>Match scoring and detailed improvement suggestions</li>
                <li>PDF and DOCX download formats</li>
                <li>Free ATS Resume Checker for all users</li>
                <li>Job Application Tracker (up to 25 applications on Free plan, unlimited on Pro)</li>
                <li>Subscription management with usage tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Account Registration and Authentication
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  To access paid features of ApplyPro (resume generation), you must create
                  an account by signing in with Google OAuth. By creating an account, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Provide accurate and current information during registration</li>
                  <li>Maintain the security of your Google account credentials</li>
                  <li>Be responsible for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Comply with Google's Terms of Service for authentication</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate these Terms
                  or engage in fraudulent, abusive, or illegal activities.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Payment Terms
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.1 Pricing
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    ApplyPro offers flexible pricing options to suit your needs:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>
                      <strong>Free Plan:</strong> Access to ATS Resume Checker,
                      Resume Score Dashboard, and Job Application Tracker (up to 25 applications)
                    </li>
                    <li>
                      <strong>Pay-Per-Use (Resume Pack):</strong> $9 USD for 3 AI-tailored resume generations
                      with all professional templates, PDF & DOCX downloads, and ATS optimization
                    </li>
                    <li>
                      <strong>Pro Monthly:</strong> $19 USD per month for unlimited
                      AI-tailored resumes (100/month fair use limit), all templates,
                      unlimited job tracking, and priority support
                    </li>
                    <li>
                      <strong>Pro Yearly:</strong> $149 USD per year (35% savings compared to monthly)
                      with all Pro Monthly benefits
                    </li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Prices are subject to change at our discretion, but any price
                    changes will not affect purchases or subscriptions already made.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.2 Payment Processing
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    All payments are processed securely through Paddle, a
                    third-party payment processor. We do not store or have
                    access to your payment card information. By making a
                    purchase or subscribing, you agree to Paddle's terms of service and
                    privacy policy. Paddle handles all payment transactions, refunds,
                    and billing inquiries.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    4.3 License Keys (Pay-Per-Use Only)
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    If you purchase a Pay-Per-Use plan, you will receive a unique license
                    key via email upon successful payment. This license key grants you
                    access to generate 3 tailored resumes and cover letters
                    using our Service. Pro Monthly and Pro Yearly subscribers do not require
                    license keys and have automatic access through their account login.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. License Key Usage and Restrictions
              </h2>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg mb-4">
                <p className="font-semibold text-amber-900 mb-2">
                  Important Restrictions:
                </p>
                <ul className="list-disc list-inside text-amber-900 space-y-1 ml-2 text-sm">
                  <li>Each license key grants 3 resume generation credits</li>
                  <li>Once all 3 credits are used, the license key cannot generate additional resumes</li>
                  <li>License keys are non-transferable and non-shareable</li>
                  <li>License keys are non-refundable after first use</li>
                </ul>
              </div>
              <p className="text-gray-700 leading-relaxed">
                By purchasing a license key, you acknowledge and agree that:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                <li>
                  You may generate up to THREE tailored resumes and cover letters per license
                  key purchased ($9 for 3 generations)
                </li>
                <li>
                  To generate more than 3 resumes, you must purchase additional
                  license keys or upgrade to a Pro subscription for unlimited access
                </li>
                <li>
                  License keys cannot be shared, sold, or transferred to other
                  users
                </li>
                <li>
                  Attempts to reuse, share, or circumvent license key
                  restrictions may result in immediate termination of service
                  access
                </li>
                <li>
                  Refunded or chargebacked purchases will have their license
                  keys permanently invalidated
                </li>
              </ul>
            </section>

            <section id="refund-policy">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Refund Policy
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.1 Pay-Per-Use Refunds
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    <strong>After First Use:</strong> Due to the instant, digital nature of our Service,
                    all sales are final once you have successfully used your license key to generate
                    any tailored resume (even 1 out of 3 credits). We cannot offer refunds after the
                    Service has been delivered.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-sm mb-3">
                    <strong>Important:</strong> Before purchasing, we encourage you to use our free
                    preview feature to evaluate the quality, formatting, and style of AI-generated content.
                    This allows you to assess whether our Service meets your needs before making a purchase.
                  </p>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    For technical issues (server errors, failed generation, formatting problems unrelated
                    to AI output), please contact support@applypro.org for resolution or replacement credits.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Before First Use:</strong> If you have purchased a license key but have not yet used
                    any of your 3 credits, you may request a full refund within 14
                    days of purchase by contacting support@applypro.org. Completely unused
                    license keys will receive a full refund, no questions asked.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.2 Pro Subscription Refunds
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    <strong>Monthly Subscriptions:</strong> You may cancel your Pro Monthly subscription
                    at any time. Cancellation will take effect at the end of your current billing period.
                    You will retain access until the end of the paid period. We do not offer prorated
                    refunds for partial months, except where required by law.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Yearly Subscriptions:</strong> You may request a full refund for Pro Yearly subscriptions
                    within 14 days of initial purchase if you have generated fewer than 10 resumes.
                    We will process the refund within 5-7 business days.
                    After 14 days or 10+ resume generations, yearly subscription fees are non-refundable,
                    though you may cancel at any time to prevent future renewals.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.3 Technical Issues
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    If you experience technical issues that prevent you from
                    using the Service (such as server errors, failed generation,
                    or invalid license keys due to system errors), please
                    contact us immediately at support@applypro.org. We will
                    investigate and, if the issue is on our end, provide a
                    replacement license key or issue a refund.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    6.4 Chargebacks and Disputes
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We are committed to resolving any issues you may have with our Service.
                    Before initiating a chargeback or payment dispute with your bank or
                    payment provider, we strongly encourage you to contact us first at
                    support@applypro.org. Most issues can be resolved quickly and amicably
                    through direct communication.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Unauthorized Chargebacks:</strong> Initiating a chargeback or payment
                    dispute without first attempting to resolve the issue with us is considered
                    a violation of these Terms and may result in immediate termination of service
                    access, invalidation of license keys, and restriction from future purchases.
                    Fraudulent chargebacks may be reported to the appropriate authorities and
                    pursued legally.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. User Responsibilities
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                As a user of ApplyPro, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Provide Accurate Information:</strong> Ensure all
                  resume information you input is truthful and accurate
                </li>
                <li>
                  <strong>Verify AI-Generated Content:</strong> Review and
                  verify all AI-generated content before using it in job
                  applications
                </li>
                <li>
                  <strong>Own Your Content:</strong> Ensure you have the right
                  to use any information you provide to the Service
                </li>
                <li>
                  <strong>Use Service Legally:</strong> Use the Service only for
                  lawful purposes and in accordance with these Terms
                </li>
                <li>
                  <strong>Maintain Confidentiality:</strong> Keep your license
                  key confidential and do not share it with others
                </li>
                <li>
                  <strong>Report Issues:</strong> Promptly report any technical
                  issues, bugs, or security vulnerabilities to us
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Prohibited Uses
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may not use ApplyPro to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  Create fraudulent, misleading, or false resumes or cover
                  letters
                </li>
                <li>
                  Violate any applicable laws, regulations, or third-party
                  rights
                </li>
                <li>
                  Attempt to reverse engineer, decompile, or hack the Service
                </li>
                <li>
                  Circumvent or bypass license key restrictions or usage limits
                </li>
                <li>
                  Resell, redistribute, or commercially exploit the Service or
                  generated content
                </li>
                <li>
                  Use automated systems (bots, scrapers) to access the Service
                </li>
                <li>
                  Overload, disrupt, or interfere with the Service or its
                  infrastructure
                </li>
                <li>
                  Use the Service to generate content for others commercially
                  without proper authorization
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. AI-Generated Content Disclaimer
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                <p className="font-semibold text-yellow-900 mb-3">
                  Important Disclaimer:
                </p>
                <p className="text-gray-700 leading-relaxed mb-3">
                  ApplyPro uses artificial intelligence (AI) to generate
                  tailored resumes and cover letters. While our AI is designed
                  to produce high-quality, professional content, you acknowledge
                  and agree that:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    AI-generated content is for <strong>assistance only</strong>{" "}
                    and should not be used without review
                  </li>
                  <li>
                    You are solely responsible for reviewing, editing, and
                    verifying all AI-generated content
                  </li>
                  <li>
                    The AI may occasionally produce inaccurate, incomplete, or
                    inappropriate content
                  </li>
                  <li>
                    You must ensure all information in your final resume and
                    cover letter is truthful and accurate
                  </li>
                  <li>
                    We are not responsible for the outcomes of job applications
                    using AI-generated content
                  </li>
                  <li>
                    The quality of generated content depends on the quality of
                    input you provide
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Intellectual Property Rights
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    10.1 Your Content
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    You retain all rights to the resume information, work
                    experience, and other personal content you provide to
                    ApplyPro. By using our Service, you grant us a limited,
                    non-exclusive, royalty-free license to process your content
                    through our AI systems solely for the purpose of providing
                    the Service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    10.2 Generated Content
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    The tailored resumes and cover letters generated by our AI
                    belong to you. You may use, modify, and distribute this
                    content as you see fit for your personal job search purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    10.3 ApplyPro Platform
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    The ApplyPro website, software, algorithms, design, and all
                    related intellectual property are owned by us and protected
                    by copyright, trademark, and other intellectual property
                    laws. You may not copy, modify, distribute, or create
                    derivative works based on our platform.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Limitation of Liability
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
                <p className="text-gray-700 leading-relaxed mb-3">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, APPLYPRO AND ITS
                  AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL
                  NOT BE LIABLE FOR:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    Any indirect, incidental, special, consequential, or
                    punitive damages
                  </li>
                  <li>
                    Loss of profits, revenue, data, or business opportunities
                  </li>
                  <li>
                    Failure to secure employment or job interviews based on
                    AI-generated content
                  </li>
                  <li>
                    Inaccuracies, errors, or omissions in AI-generated content
                  </li>
                  <li>
                    Service interruptions, technical failures, or downtime
                  </li>
                  <li>
                    Third-party actions or content (including Anthropic, Paddle, Google, Vercel)
                  </li>
                  <li>
                    Any damages arising from your use or inability to use the
                    Service
                  </li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  IN ANY EVENT, OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE
                  AMOUNT YOU PAID FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING
                  THE CLAIM (e.g., $9 for Pay-Per-Use, $19/month for Pro Monthly, $149/year for Pro Yearly).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Disclaimer of Warranties
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS
                WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
                INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Accuracy, reliability, or completeness of AI-generated content</li>
                <li>Uninterrupted, secure, or error-free service operation</li>
                <li>Specific results or outcomes from using the Service</li>
                <li>Compatibility with all devices, browsers, or systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless ApplyPro and
                its affiliates, officers, directors, employees, and agents from
                any claims, liabilities, damages, losses, costs, or expenses
                (including reasonable attorney's fees) arising from:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                <li>Your use or misuse of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>
                  False, misleading, or fraudulent information you provide or
                  use
                </li>
                <li>
                  Any consequences resulting from your use of AI-generated
                  content
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Our collection, use, and
                protection of your personal information is governed by our{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference. By using
                ApplyPro, you consent to our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                15. Termination
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    15.1 Termination by You
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    You may stop using the Service at any time. However, license
                    keys already used are non-refundable.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    15.2 Termination by Us
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to suspend or terminate your access to
                    the Service immediately, without notice, if you violate
                    these Terms or engage in prohibited activities, including:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
                    <li>Attempting to reuse or share license keys</li>
                    <li>Fraudulent payment activity or chargebacks</li>
                    <li>Abusive, harmful, or illegal use of the Service</li>
                    <li>Attempts to circumvent security or usage restrictions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    15.3 Effect of Termination
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Upon termination, your right to use the Service ceases
                    immediately. Termination does not entitle you to a refund.
                    Sections of these Terms that by their nature should survive
                    termination (including disclaimers, limitation of liability,
                    and indemnification) will continue to apply.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                16. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. When we
                make changes, we will update the "Effective Date" at the top of
                this page. Material changes will be communicated via email (if
                you have provided an email) or prominent notice on our website.
                Your continued use of the Service after changes are posted
                constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                17. Governing Law and Dispute Resolution
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    17.1 Governing Law
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms are governed by and construed in accordance with
                    the laws of the United States and the State of California,
                    without regard to conflict of law principles.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    17.2 Dispute Resolution
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    If you have any disputes or issues with the Service, please
                    contact us first at support@applypro.org to attempt to
                    resolve the matter informally. If we cannot resolve the
                    dispute within 30 days, either party may pursue legal
                    remedies.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Any legal action or proceeding arising out of or relating to
                    these Terms or the Service shall be brought exclusively in
                    the federal or state courts located in California, and you
                    consent to the jurisdiction of such courts.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    17.3 Class Action Waiver
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    You agree that any dispute resolution proceedings will be
                    conducted only on an individual basis and not in a class,
                    consolidated, or representative action.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                18. Severability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be invalid,
                illegal, or unenforceable, the remaining provisions will
                continue in full force and effect. The invalid provision will be
                modified to the minimum extent necessary to make it valid and
                enforceable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                19. Entire Agreement
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the
                entire agreement between you and ApplyPro regarding the Service
                and supersede all prior agreements, understandings, and
                communications, whether written or oral.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                20. Contact Information
              </h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions, concerns, or feedback about these
                  Terms of Service or our Service, please contact us:
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
                    We aim to respond to all inquiries within 2-3 business days.
                  </p>
                </div>
              </div>
            </section>

            <section className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-600 italic">
                These Terms of Service were last updated on December 2, 2025. By
                using ApplyPro, you acknowledge that you have read, understood,
                and agree to be bound by these Terms.
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
