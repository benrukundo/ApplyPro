'use client';

import { useState } from 'react';
import { trackEvent } from '@/components/PostHogProvider';

interface DodoCheckoutProps {
  productId: string;
  planType: 'monthly' | 'yearly' | 'pay-per-use';
  planName: string;
  onSuccess?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function DodoCheckout({
  productId,
  planType,
  planName,
  onSuccess,
  children,
  className,
  disabled = false,
}: DodoCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    trackEvent('checkout_started', {
      plan: planName,
      plan_type: planType,
      product_id: productId,
      provider: 'dodo',
    });

    try {
      const response = await fetch('/api/dodo-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, planType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout');
      }

      const { checkoutUrl } = await response.json();

      trackEvent('checkout_redirect', {
        plan: planName,
        plan_type: planType,
        provider: 'dodo',
      });

      // Redirect to Dodo checkout
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('Checkout error:', error);
      trackEvent('checkout_error', {
        plan: planName,
        plan_type: planType,
        product_id: productId,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'dodo',
      });
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
