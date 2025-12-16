'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import PaddleCheckout from '@/components/PaddleCheckout';

const plans = [
  {
    id: 'pay-per-use',
    name: 'Resume Pack',
    description: 'Perfect for trying ApplyPro',
    price: 9,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PAY_PER_USE!,
    period: 'one-time',
    features: [
      '3 AI-tailored resumes',
      'All templates included',
      'ATS-optimized versions',
      'Cover letters included',
      'PDF & DOCX downloads',
      'Never expires',
    ],
    icon: Zap,
    popular: false,
    buttonText: 'Buy Resume Pack',
  },
  {
    id: 'monthly',
    name: 'Pro Monthly',
    description: 'For active job seekers',
    price: 19,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY!,
    period: '/month',
    features: [
      '100 resumes per month',
      'All templates included',
      'ATS-optimized versions',
      'Cover letters included',
      'PDF & DOCX downloads',
      'Priority support',
      'Cancel anytime',
    ],
    icon: Sparkles,
    popular: true,
    buttonText: 'Start Monthly',
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    description: 'Best value for serious seekers',
    price: 149,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_YEARLY!,
    period: '/year',
    originalPrice: 228,
    features: [
      '100 resumes per month',
      'All templates included',
      'ATS-optimized versions',
      'Cover letters included',
      'PDF & DOCX downloads',
      'Priority support',
      'Save 35% vs monthly',
    ],
    icon: Crown,
    popular: false,
    buttonText: 'Start Yearly',
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');

  const handleSuccess = () => {
    setSuccessMessage('Payment successful! Redirecting to dashboard...');
    setTimeout(() => {
      router.push('/dashboard?payment=success');
    }, 2000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your job search. All plans include our AI-powered
            resume tailoring and all premium templates.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.popular ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-400 line-through mr-2">
                        ${plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {session?.user ? (
                    <PaddleCheckout
                      priceId={plan.priceId}
                      userId={session.user.id}
                      userEmail={session.user.email || ''}
                      onSuccess={handleSuccess}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {plan.buttonText}
                    </PaddleCheckout>
                  ) : (
                    <Link
                      href={`/login?callbackUrl=/pricing`}
                      className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      Sign in to Purchase
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What's included in all plans?
              </h3>
              <p className="text-gray-600">
                All plans include AI-powered resume tailoring, multiple professional templates,
                ATS optimization, custom cover letters, and downloads in both PDF and DOCX formats.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-600">
                Yes! Monthly and yearly subscriptions can be cancelled anytime from your dashboard.
                You'll retain access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What happens when I reach my monthly limit?
              </h3>
              <p className="text-gray-600">
                Your limit resets at the start of each billing cycle. If you need more resumes
                before then, you can upgrade to a higher plan or purchase a Resume Pack.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is my payment information secure?
              </h3>
              <p className="text-gray-600">
                Absolutely! All payments are processed securely through Paddle, a trusted payment
                processor. We never store your payment information on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Have questions? <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-semibold">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
