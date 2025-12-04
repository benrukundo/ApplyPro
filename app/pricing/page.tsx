'use client';

import Link from 'next/link';
import { Check, X } from 'lucide-react';

export default function PricingPage() {
  const monthlyLink = process.env.NEXT_PUBLIC_GUMROAD_MONTHLY_PRODUCT_ID;
  const yearlyLink = process.env.NEXT_PUBLIC_GUMROAD_YEARLY_PRODUCT_ID;
  const payPerUseLink = process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_ID;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Start free, upgrade when you need more
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">

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
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Free ATS Resume Checker</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Resume Score Dashboard</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Job Application Tracker</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
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
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700"><strong>3 AI-tailored resumes</strong></span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">All 3 professional templates</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">PDF & DOCX downloads</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">ATS optimization included</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">Only $1.66 per resume</span>
              </li>
            </ul>

            <a
              href={`https://laurabi.gumroad.com/l/${payPerUseLink}`}
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Buy Now
            </a>
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
                <span className="text-5xl font-bold">$19.99</span>
                <span className="text-blue-200"> / month</span>
              </div>
              <p className="text-blue-200 mb-6">Unlimited resume generation*</p>
            </div>

            <ul className="space-y-4 mb-8 text-white">
              <li className="flex items-start">
                <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                <span><strong>Unlimited AI-tailored resumes*</strong></span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                <span>All 3 professional templates</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                <span>Unlimited job tracking</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                <span>Priority email support</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                <span>Early access to new features</span>
              </li>
              <li className="flex items-start">
                <Check className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" />
                <span>Cancel anytime</span>
              </li>
            </ul>

            <a
              href={`https://laurabi.gumroad.com/l/${monthlyLink}`}
              className="block w-full text-center bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition mb-3"
            >
              Subscribe Monthly
            </a>

            <a
              href={`https://laurabi.gumroad.com/l/${yearlyLink}`}
              className="block w-full text-center bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-400 transition"
            >
              Save 17% - Pay Yearly ($199/yr)
            </a>

            <p className="text-xs text-blue-200 mt-4 text-center">
              *Fair use policy: 100 resumes/month for personal job search
            </p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
            Feature Comparison
          </h2>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-900">Free</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-900">Pay-Per-Use</th>
                  <th className="px-6 py-3 text-center font-semibold text-gray-900">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">AI Resume Generation</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /> 3</td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /> 100/mo</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">ATS Checker</td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Professional Templates</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /> 3</td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /> 3</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">Job Tracker</td>
                  <td className="px-6 py-4 text-center">25 apps</td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /> Unlimited</td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /> Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">Priority Support</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Fair Use Policy */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3 text-gray-900">📋 Fair Use Policy</h3>
            <p className="text-gray-700 mb-3">
              Pro subscriptions include unlimited resume generation for personal job search use, with a fair use limit of <strong>100 resumes per month</strong>.
            </p>
            <p className="text-gray-700 mb-3">
              This limit is designed to accommodate active job seekers while maintaining service quality for all users. 99% of users never reach this limit.
            </p>
            <p className="text-gray-700">
              Need more? We offer business plans for recruitment agencies and career coaches with higher limits. <a href="mailto:support@applypro.org" className="text-blue-600 underline font-semibold">Contact us</a> for custom pricing.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <details className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition">
              <summary className="font-semibold text-gray-900">
                What does "unlimited with fair use" mean?
              </summary>
              <p className="mt-3 text-gray-600">
                You can generate up to 100 resumes per month, which is more than enough for active job searching. This limit prevents abuse while keeping the service affordable for everyone.
              </p>
            </details>

            <details className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition">
              <summary className="font-semibold text-gray-900">
                Can I switch between plans?
              </summary>
              <p className="mt-3 text-gray-600">
                Yes! You can upgrade from pay-per-use to Pro at any time. If you're on Pro, you can downgrade at the end of your billing cycle.
              </p>
            </details>

            <details className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition">
              <summary className="font-semibold text-gray-900">
                What happens to my unused pay-per-use credits if I subscribe?
              </summary>
              <p className="mt-3 text-gray-600">
                Your credits remain valid forever and can be used if you cancel your subscription later.
              </p>
            </details>

            <details className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition">
              <summary className="font-semibold text-gray-900">
                Can I cancel my Pro subscription anytime?
              </summary>
              <p className="mt-3 text-gray-600">
                Yes, you can cancel anytime via Gumroad. You'll retain access until the end of your current billing period.
              </p>
            </details>

            <details className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition">
              <summary className="font-semibold text-gray-900">
                What if I need more than 100 resumes per month?
              </summary>
              <p className="mt-3 text-gray-600">
                Contact us at support@applypro.org for business plans designed for recruitment agencies and career coaches with higher or truly unlimited limits.
              </p>
            </details>

            <details className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition">
              <summary className="font-semibold text-gray-900">
                Do you offer refunds?
              </summary>
              <p className="mt-3 text-gray-600">
                For pay-per-use purchases, we offer refunds within 7 days if you haven't used any resume generations. For subscriptions, you can cancel anytime with no penalty.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
