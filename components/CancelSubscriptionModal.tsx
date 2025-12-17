'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { trackEvent } from '@/components/PostHogProvider';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string, effectiveDate: string) => void;
  plan: string;
  currentPeriodEnd?: string;
}

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  plan,
  currentPeriodEnd,
}: CancelSubscriptionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleCancel = async () => {
    if (confirmText.toLowerCase() !== 'cancel') {
      setError('Please type "cancel" to confirm');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Track successful cancellation
      trackEvent('subscription_cancelled', {
        plan: plan,
        effective_date: data.effectiveDate,
      });

      onSuccess(data.message, data.effectiveDate);
      onClose();
    } catch (err) {
      // Track cancellation failure
      trackEvent('subscription_cancel_failed', {
        plan: plan,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formattedEndDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'the end of your billing period';

  const isPPU = plan === 'pay-per-use';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Cancel Subscription
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to cancel your{' '}
            <span className="font-semibold">
              {plan === 'monthly'
                ? 'Pro Monthly'
                : plan === 'yearly'
                ? 'Pro Yearly'
                : 'Resume Pack'}
            </span>{' '}
            subscription?
          </p>

          {!isPPU && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> You'll continue to have access to all Pro
                features until <strong>{formattedEndDate}</strong>. After that,
                your account will revert to the free plan.
              </p>
            </div>
          )}

          {isPPU && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">
                <strong>Warning:</strong> Cancelling your Resume Pack will
                immediately remove any unused credits. This action cannot be
                undone.
              </p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              We're sorry to see you go. Before you cancel, consider:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
              <li>You can pause your subscription instead of cancelling</li>
              <li>Unused credits don't roll over, so use them before cancelling</li>
              <li>You can resubscribe anytime at the current price</li>
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold text-red-600">"cancel"</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type cancel here"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Keep Subscription
          </button>
          <button
            onClick={handleCancel}
            disabled={isLoading || confirmText.toLowerCase() !== 'cancel'}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
