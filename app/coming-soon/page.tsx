'use client';

import Link from 'next/link';
import { Clock, ArrowLeft, Bell, Mail } from 'lucide-react';
import { useState } from 'react';

export default function ComingSoonPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success message
    // In production, you would save this to a database
    setIsSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mb-8">
            <Clock className="w-20 h-20 text-blue-600 mx-auto mb-6 animate-pulse" />
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Coming Soon
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              We're working hard to bring you an amazing experience!
            </p>
            <p className="text-gray-600 max-w-lg mx-auto">
              Our payment system is currently under development. We're building something special
              to make your resume generation experience even better.
            </p>
          </div>

          {/* Notify Me Form */}
          <div className="mt-12 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Get Notified When We Launch
            </h3>

            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                Thanks! We'll notify you when we launch.
              </div>
            ) : (
              <form onSubmit={handleNotifyMe} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>

          {/* What to Expect */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What to Expect
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 text-left">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl mb-2">🚀</div>
                <h4 className="font-semibold text-gray-900 mb-1">Fast & Secure</h4>
                <p className="text-sm text-gray-600">Lightning-fast checkout with secure payment processing</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl mb-2">💳</div>
                <h4 className="font-semibold text-gray-900 mb-1">Flexible Plans</h4>
                <p className="text-sm text-gray-600">Pay-per-use or monthly subscription options</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl mb-2">✨</div>
                <h4 className="font-semibold text-gray-900 mb-1">Great Value</h4>
                <p className="text-sm text-gray-600">Competitive pricing for premium AI-powered resumes</p>
              </div>
            </div>
          </div>

          {/* CTA to explore free features */}
          <div className="mt-12">
            <p className="text-gray-600 mb-4">In the meantime, check out our free features!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/ats-checker"
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Try Free ATS Checker
              </Link>
              <Link
                href="/templates"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                View Templates
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
