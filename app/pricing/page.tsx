'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  Star,
  Zap,
  Crown,
  ArrowRight,
  Loader2,
  Shield,
  CreditCard,
  Users,
  FileText,
  CheckCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import DodoCheckout from '@/components/DodoCheckout';

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
}

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fetch user's subscription status
  useEffect(() => {
    async function fetchSubscription() {
      if (!session?.user?.id) {
        setLoadingSubscription(false);
        return;
      }

      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    }

    fetchSubscription();
  }, [session?.user?.id]);

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  // Handle immediate plan change (upgrade/downgrade)
  const handleChangePlan = async (newPlan: 'monthly' | 'yearly') => {
    if (changingPlan) return;

    const isUpgrade = subscription?.plan === 'monthly' && newPlan === 'yearly';

    // Show confirmation
    const confirmMessage = isUpgrade
      ? `Upgrade to Pro Yearly?\n\nYou'll be charged the prorated difference ($149 - credit for unused days on monthly plan).\n\nYour yearly subscription starts immediately.`
      : `Switch to Pro Monthly?\n\nYour unused credit from the yearly plan will be applied to future charges.\n\nYour monthly subscription starts immediately.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setChangingPlan(true);

    try {
      const response = await fetch('/api/subscription/schedule-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change plan');
      }

      alert(data.message);

      // Refresh subscription data
      setSubscription({
        ...subscription!,
        plan: newPlan,
      });

      router.refresh();

    } catch (error) {
      console.error('Change plan error:', error);
      alert(error instanceof Error ? error.message : 'Failed to change plan. Please try again.');
    } finally {
      setChangingPlan(false);
    }
  };

  // Check if user is subscribed to a specific plan
  const isSubscribedTo = (planId: string): boolean => {
    if (!subscription || subscription.status !== 'active') return false;
    return subscription.plan === planId;
  };

  // Check if user has any active subscription
  const hasActiveSubscription = (): boolean => {
    return subscription?.status === 'active' &&
           (subscription.plan === 'monthly' || subscription.plan === 'yearly');
  };

  const plans = [
    {
      id: 'pay-per-use',
      name: 'Resume Pack',
      description: 'Perfect for trying ApplyPro',
      price: 4.99,
      productId: process.env.NEXT_PUBLIC_DODO_PRICE_PAY_PER_USE!,
      period: 'one-time',
      buttonText: 'Get Resume Pack',
      subscribedText: 'Purchase Again',
      features: [
        '3 AI-tailored resume generations',
        'ATS-optimized versions included',
        'Professional cover letters',
        'PDF & DOCX downloads',
        'Valid for 1 year',
      ],
      popular: false,
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      allowRepurchase: true,
    },
    {
      id: 'monthly',
      name: 'Pro Monthly',
      description: 'For active job seekers',
      price: 19,
      originalPrice: 29,
      productId: process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY!,
      period: '/month',
      buttonText: 'Start Pro Monthly',
      subscribedText: 'Current Plan',
      features: [
        '100 resume generations/month',
        'Advanced ATS optimization',
        'Custom cover letters',
        'Job application tracker',
        'Interview prep tools',
        'LinkedIn optimizer',
        'Priority support',
        'Cancel anytime',
      ],
      popular: true,
      icon: <Crown className="w-6 h-6 text-purple-600" />,
      allowRepurchase: false,
    },
    {
      id: 'yearly',
      name: 'Pro Yearly',
      description: 'Best value for serious seekers',
      price: 149,
      originalPrice: 348,
      productId: process.env.NEXT_PUBLIC_DODO_PRICE_YEARLY!,
      period: '/year',
      buttonText: 'Start Pro Yearly',
      subscribedText: 'Current Plan',
      features: [
        'Everything in Pro Monthly',
        '2 months free (35% savings)',
        'Advanced analytics',
        'Bulk resume generation',
        'Custom templates',
        'API access',
        'Dedicated support',
        'Cancel anytime',
      ],
      popular: false,
      icon: <Star className="w-6 h-6 text-amber-600" />,
      allowRepurchase: false,
    },
  ];

  const freeFeatures = [
    'ATS resume checker',
    'Resume builder (from scratch)',
    'Job application tracker (25 applications)',
    'Basic resume templates',
    'Community support',
  ];

  // Render the appropriate button based on subscription status
  const renderPlanButton = (plan: typeof plans[0]) => {
    const isCurrentPlan = isSubscribedTo(plan.id);
    const hasOtherSubscription = hasActiveSubscription() && !isCurrentPlan;

    // User is subscribed to this exact plan
    if (isCurrentPlan && !plan.allowRepurchase) {
      return (
        <div className="w-full py-3.5 px-6 rounded-xl font-semibold bg-green-100 text-green-700 flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {plan.subscribedText}
        </div>
      );
    }

    // User has monthly and this is yearly - show upgrade option
    if (hasOtherSubscription && plan.id === 'yearly' && subscription?.plan === 'monthly') {
      return (
        <button
          onClick={() => handleChangePlan('yearly')}
          disabled={changingPlan}
          className="w-full py-3.5 px-6 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {changingPlan ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Upgrading...
            </>
          ) : (
            <>
              <ArrowUp className="w-5 h-5" />
              Upgrade Now
            </>
          )}
        </button>
      );
    }

    // User has yearly and this is monthly - show downgrade option
    if (hasOtherSubscription && plan.id === 'monthly' && subscription?.plan === 'yearly') {
      return (
        <button
          onClick={() => handleChangePlan('monthly')}
          disabled={changingPlan}
          className="w-full py-3.5 px-6 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {changingPlan ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Changing...
            </>
          ) : (
            <>
              <ArrowDown className="w-5 h-5" />
              Switch to Monthly
            </>
          )}
        </button>
      );
    }

    // User is logged in but not subscribed (or it's pay-per-use)
    if (session?.user) {
      return (
        <DodoCheckout
          productId={plan.productId}
          planType={plan.id as 'monthly' | 'yearly' | 'pay-per-use'}
          planName={plan.name}
          onSuccess={handleSuccess}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all ${
            plan.popular
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
          }`}
        >
          {plan.buttonText}
        </DodoCheckout>
      );
    }

    // User is not logged in
    return (
      <Link
        href="/signup"
        className={`inline-flex items-center justify-center w-full py-3.5 px-6 rounded-xl font-semibold transition-all ${
          plan.popular
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25'
            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
        }`}
      >
        {plan.buttonText}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <CreditCard className="w-4 h-4" />
            <span>Pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with a free trial or jump straight into our premium features.
            Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Current Subscription Banner */}
        {subscription?.status === 'active' && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-8 text-white text-center">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">
                You're subscribed to {subscription.plan === 'monthly' ? 'Pro Monthly' : subscription.plan === 'yearly' ? 'Pro Yearly' : 'Resume Pack'}
              </span>
              {subscription.currentPeriodEnd && (
                <span className="text-green-100">
                  · Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              )}
              <Link href="/dashboard" className="ml-2 underline hover:no-underline text-green-100">
                Manage →
              </Link>
            </div>
          </div>
        )}

        {/* Free Plan Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">Free Forever</span>
          </div>
          <p className="text-green-100 mb-4">
            Try our core features completely free - no credit card required
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            {freeFeatures.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-200 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                  : isSubscribedTo(plan.id)
                  ? 'border-green-500 shadow-lg shadow-green-500/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && !isSubscribedTo(plan.id) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              {isSubscribedTo(plan.id) && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Current Plan
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>

                {plan.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    Originally ${plan.originalPrice}
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="text-center">
                {loadingSubscription ? (
                  <div className="w-full py-3.5 px-6 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  renderPlanButton(plan)
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid gap-6 max-w-3xl mx-auto">
            {[
              {
                q: 'Can I upgrade or downgrade anytime?',
                a: 'Yes! You can switch between Monthly and Yearly plans anytime. When upgrading, you\'ll be charged the prorated difference. When downgrading, any unused credit is applied to future charges.',
              },
              {
                q: 'How does prorated billing work?',
                a: 'When you upgrade from Monthly ($19) to Yearly ($149), we calculate how many days are left in your current billing period and credit that amount toward your new plan. You only pay the difference.',
              },
              {
                q: 'What happens to my data if I cancel?',
                a: 'Your account and data remain accessible for 30 days after cancellation. During this period, you can reactivate your subscription. After 30 days, your data is permanently deleted.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 14-day money-back guarantee for yearly subscriptions and 7-day guarantee for monthly subscriptions. Pay-per-use purchases are non-refundable once used.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and bank transfers through our secure payment processor (Dodo Payments).',
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 px-6 py-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-blue-600" />
              <span>1000+ Users</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span>Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
