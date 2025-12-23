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

    // Track checkout started
    trackEvent('checkout_started', {
      plan: planName,
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
        throw new Error('Failed to create checkout');
      }

      const { checkoutUrl } = await response.json();

      // Redirect to Dodo checkout
      window.location.href = checkoutUrl;

    } catch (error) {
      console.error('Checkout error:', error);
      trackEvent('checkout_error', {
        plan: planName,
        product_id: productId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
