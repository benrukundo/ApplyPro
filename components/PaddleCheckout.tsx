'use client';

import { useEffect, useState } from 'react';
import { initializePaddle, Paddle } from '@paddle/paddle-js';

interface PaddleCheckoutProps {
  priceId: string;
  userId: string;
  userEmail: string;
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
              onSuccess?.();
            }

            if (event.name === 'checkout.closed') {
              console.log('Checkout closed');
              onClose?.();
            }
          },
        });

        setPaddle(paddleInstance);
      } catch (error) {
        console.error('Failed to initialize Paddle:', error);
      }
    };

    initPaddle();
  }, [onSuccess, onClose]);

  const openCheckout = async () => {
    if (!paddle || disabled) return;

    setIsLoading(true);

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
