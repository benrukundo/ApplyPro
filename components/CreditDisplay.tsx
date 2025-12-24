'use client';

import Link from 'next/link';
import { Zap, Package, Crown, ArrowRight } from 'lucide-react';

interface CreditDisplayProps {
  recurringSubscription: {
    plan: string;
    status: string;
    monthlyUsageCount: number;
    monthlyLimit: number;
    currentPeriodEnd?: string;
  } | null;
  payPerUseCredits: number;
  payPerUseTotal: number;
  compact?: boolean;
}

export default function CreditDisplay({
  recurringSubscription,
  payPerUseCredits,
  payPerUseTotal,
  compact = false,
}: CreditDisplayProps) {
  const hasRecurring = recurringSubscription?.status === 'active';
  const hasPayPerUse = payPerUseCredits > 0;
  const payPerUseRemaining = payPerUseTotal - payPerUseCredits;

  // Calculate percentages
  const recurringPercentage = hasRecurring
    ? (recurringSubscription.monthlyUsageCount / recurringSubscription.monthlyLimit) * 100
    : 0;
  const payPerUsePercentage = payPerUseTotal > 0
    ? ((payPerUseTotal - payPerUseRemaining) / payPerUseTotal) * 100
    : 0;

  // Format plan name
  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'monthly': return 'Pro Monthly';
      case 'yearly': return 'Pro Yearly';
      default: return plan;
    }
  };

  if (compact) {
    // Compact version for header/navbar
    const totalAvailable = (hasRecurring ? recurringSubscription.monthlyLimit - recurringSubscription.monthlyUsageCount : 0) + payPerUseRemaining;

    return (
      <Link
        href="/dashboard/subscription"
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <Zap className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          {totalAvailable} credits
        </span>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Resume Credits</h3>
          </div>
          <Link
            href="/dashboard/subscription"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Manage
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Pay-Per-Use Credits (show first if available) */}
        {payPerUseRemaining > 0 && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-gray-900">Resume Pack</span>
              </div>
              <span className="text-sm font-semibold text-amber-700">
                {payPerUseRemaining} of {payPerUseTotal} remaining
              </span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${100 - payPerUsePercentage}%` }}
              />
            </div>
            <p className="text-xs text-amber-700 mt-2">
              Pack credits are used first before your subscription credits
            </p>
          </div>
        )}

        {/* Recurring Subscription */}
        {hasRecurring && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">
                  {getPlanName(recurringSubscription.plan)}
                </span>
              </div>
              <span className="text-sm font-semibold text-blue-700">
                {recurringSubscription.monthlyUsageCount} of {recurringSubscription.monthlyLimit} used
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${recurringPercentage}%` }}
              />
            </div>
            {recurringSubscription.currentPeriodEnd && (
              <p className="text-xs text-blue-700 mt-2">
                Resets on {new Date(recurringSubscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* No subscription state */}
        {!hasRecurring && payPerUseRemaining === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-3">No active credits</p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Credits
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Buy more pack CTA */}
        {hasRecurring && payPerUseRemaining === 0 && (
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/pricing"
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Need extra credits?</span>
              </div>
              <span className="text-sm font-medium text-blue-600">
                Buy Resume Pack →
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
