'use client';

import { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { trackEvent } from '@/components/PostHogProvider';

interface PaddleCheckoutProps {
  priceId: string;
  userId: string;
  userEmail: string;
  planName?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function PaddleCheckout({
  priceId,
  userId,
  userEmail,
  planName = 'unknown',
  onSuccess,
  onClose,
  children,
  className,
  disabled = false,
}: PaddleCheckoutProps) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initPaddle = async () => {
      try {
        const paddleInstance = await initializePaddle({
          environment: process.env.NEXT_PUBLIC_PADDLE_ENV as 'sandbox' | 'production',
          token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
          eventCallback: (event) => {
            console.log('Paddle event:', event);

            if (event.name === 'checkout.completed') {
              console.log('Checkout completed!');
              trackEvent('checkout_completed', {
                plan: planName,
                price_id: priceId,
              });
              onSuccess?.();
            }

            if (event.name === 'checkout.closed') {
              console.log('Checkout closed');
              trackEvent('checkout_closed', {
                plan: planName,
                price_id: priceId,
              });
              onClose?.();
            }
          },
        });

        if (paddleInstance) {
          setPaddle(paddleInstance);
        }
      } catch (error) {
        console.error('Failed to initialize Paddle:', error);
      }
    };

    initPaddle();
  }, [onSuccess, onClose, planName, priceId]);

  const openCheckout = async () => {
    if (!paddle || disabled) return;

    setIsLoading(true);

    // Track checkout started
    trackEvent('checkout_started', {
      plan: planName,
      price_id: priceId,
    });

    try {
      await paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: {
          email: userEmail,
        },
        customData: {
          user_id: userId,
        },
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'en',
          successUrl: `${window.location.origin}/dashboard?payment=success`,
        },
      });
    } catch (error) {
      console.error('Failed to open checkout:', error);
      trackEvent('checkout_error', {
        plan: planName,
        price_id: priceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={openCheckout}
      disabled={disabled || !paddle || isLoading}
      className={className}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
