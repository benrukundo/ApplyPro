'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  Package,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  Zap,
  Receipt,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import DodoCheckout from '@/components/DodoCheckout';

interface SubscriptionData {
  subscription: {
    id: string;
    plan: string;
    status: string;
    monthlyUsageCount: number;
    monthlyLimit: number;
    currentPeriodEnd?: string;
    createdAt: string;
    paddleId?: string;
    customerId?: string;
  } | null;
  recurringSubscription: {
    id: string;
    plan: string;
    status: string;
    monthlyUsageCount: number;
    monthlyLimit: number;
    currentPeriodEnd?: string;
    createdAt: string;
    customerId?: string;
  } | null;
  payPerUseCredits: number;
  payPerUseSubscriptions: Array<{
    id: string;
    monthlyUsageCount: number;
    monthlyLimit: number;
    createdAt: string;
  }>;
  totalAvailable: number;
  totalUsed: number;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [syncingCustomer, setSyncingCustomer] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchSubscriptionData();
    }
  }, [status, router]);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
        
        // Auto-sync customer ID if missing but has active subscription
        if (data.recurringSubscription && !data.recurringSubscription.customerId) {
          console.log('Customer ID missing, will show sync button');
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync customer ID from Dodo
  const syncCustomerId = async () => {
    setSyncingCustomer(true);
    setSyncError(null);
    
    try {
      const response = await fetch('/api/admin/sync-customer');
      const data = await response.json();
      
      if (response.ok && data.customerId) {
        console.log('Customer ID synced:', data.customerId);
        // Refresh subscription data
        await fetchSubscriptionData();
        alert('Billing synced successfully! You can now manage your payment method and view invoices.');
      } else {
        console.error('Sync failed:', data.error);
        setSyncError(data.error || 'Failed to sync billing information');
      }
    } catch (error) {
      console.error('Failed to sync customer ID:', error);
      setSyncError('Failed to connect to billing service');
    } finally {
      setSyncingCustomer(false);
    }
  };

  // Open Dodo Customer Portal
  const handleOpenPortal = async () => {
    setPortalLoading(true);
    
    try {
      const response = await fetch('/api/dodo-portal', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.portalUrl) {
        window.open(data.portalUrl, '_blank');
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      console.error('Portal error:', error);
      alert(error instanceof Error ? error.message : 'Unable to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  // Handle upgrade to yearly
  const handleUpgradeToYearly = async () => {
    if (changingPlan) return;

    const confirmMessage = `Upgrade to Pro Yearly?\n\nYou'll be charged the prorated difference ($149 - credit for unused days on monthly plan).\n\nYour yearly subscription starts immediately.`;

    if (!confirm(confirmMessage)) return;

    setChangingPlan(true);

    try {
      const response = await fetch('/api/subscription/schedule-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlan: 'yearly' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade plan');
      }

      alert('Successfully upgraded to Pro Yearly!');
      fetchSubscriptionData();
      router.refresh();
    } catch (error) {
      console.error('Upgrade error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upgrade. Please try again.');
    } finally {
      setChangingPlan(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      const response = await fetch('/api/subscription/cancel', { method: 'POST' });

      if (response.ok) {
        alert('Subscription cancelled. You will retain access until the end of your billing period.');
        fetchSubscriptionData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'monthly': return 'Pro Monthly';
      case 'yearly': return 'Pro Yearly';
      case 'pay-per-use': return 'Resume Pack';
      default: return plan;
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'monthly': return '$19/month';
      case 'yearly': return '$149/year';
      case 'pay-per-use': return '$4.99 one-time';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const hasRecurring = subscriptionData?.recurringSubscription?.status === 'active';
  const recurringPlan = subscriptionData?.recurringSubscription;
  const hasCustomerId = !!(recurringPlan as any)?.customerId;
  
  const payPerUseCreditsRemaining = subscriptionData?.payPerUseSubscriptions?.reduce(
    (acc, sub) => acc + (sub.monthlyLimit - sub.monthlyUsageCount),
    0
  ) || 0;
  const payPerUseTotal = subscriptionData?.payPerUseSubscriptions?.reduce(
    (acc, sub) => acc + sub.monthlyLimit,
    0
  ) || 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Subscription & Billing
          </h1>
          <p className="text-gray-600">
            Manage your subscription, view usage, and update billing details
          </p>
        </div>

        <div className="space-y-6">
          {/* Current Plan Card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-blue-600" />
                Current Plan
              </h2>
            </div>

            <div className="p-6">
              {hasRecurring ? (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {getPlanName(recurringPlan!.plan)}
                      </h3>
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Active
                      </span>
                    </div>
                    <p className="text-gray-600">{getPlanPrice(recurringPlan!.plan)}</p>
                    {recurringPlan?.currentPeriodEnd && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Next billing: {new Date(recurringPlan.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {recurringPlan?.plan === 'monthly' && (
                      <button
                        onClick={handleUpgradeToYearly}
                        disabled={changingPlan}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {changingPlan ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Upgrading...
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-4 h-4" />
                            Upgrade to Yearly
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel Plan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 mb-4">Subscribe to unlock AI-powered resume generation</p>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Plans
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Usage Card */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Usage This Period
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {payPerUseCreditsRemaining > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-gray-900">Resume Pack Credits</span>
                    </div>
                    <span className="font-semibold text-amber-700">
                      {payPerUseCreditsRemaining} of {payPerUseTotal} remaining
                    </span>
                  </div>
                  <div className="w-full bg-amber-100 rounded-full h-3">
                    <div
                      className="bg-amber-500 h-3 rounded-full transition-all"
                      style={{ width: `${(payPerUseCreditsRemaining / payPerUseTotal) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-amber-700 mt-1">Used first before subscription credits</p>
                </div>
              )}

              {hasRecurring && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">{getPlanName(recurringPlan!.plan)} Usage</span>
                    </div>
                    <span className="font-semibold text-blue-700">
                      {recurringPlan!.monthlyUsageCount} of {recurringPlan!.monthlyLimit} used
                    </span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${(recurringPlan!.monthlyUsageCount / recurringPlan!.monthlyLimit) * 100}%` }}
                    />
                  </div>
                  {recurringPlan?.currentPeriodEnd && (
                    <p className="text-sm text-blue-700 mt-1">
                      Resets on {new Date(recurringPlan.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {!hasRecurring && payPerUseCreditsRemaining === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-600">No active credits</p>
                </div>
              )}

              {/* Buy more pack */}
              <div className="pt-4 border-t border-gray-100">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Need more credits?</p>
                        <p className="text-sm text-gray-500">Get 3 resume generations for $4.99</p>
                      </div>
                    </div>
                    <DodoCheckout
                      productId={process.env.NEXT_PUBLIC_DODO_PRICE_PAY_PER_USE!}
                      planType="pay-per-use"
                      planName="Resume Pack"
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Buy Pack
                    </DodoCheckout>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          {hasRecurring && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment Method
                </h2>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Card on file</p>
                      <p className="text-sm text-gray-500">Managed securely by Dodo Payments</p>
                    </div>
                  </div>
                  
                  {hasCustomerId ? (
                    <button
                      onClick={handleOpenPortal}
                      disabled={portalLoading}
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {portalLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          Update Payment
                          <ExternalLink className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={syncCustomerId}
                      disabled={syncingCustomer}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {syncingCustomer ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Sync Billing
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                {!hasCustomerId && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Setup required:</strong> Click "Sync Billing" to enable payment management and invoice access.
                    </p>
                    {syncError && (
                      <p className="text-sm text-red-600 mt-2">{syncError}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Billing History Card */}
          {hasRecurring && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  Billing History
                </h2>
              </div>

              <div className="p-6">
                {hasCustomerId ? (
                  <button
                    onClick={handleOpenPortal}
                    disabled={portalLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 text-blue-600 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Opening portal...
                      </>
                    ) : (
                      <>
                        View Invoices & Billing History
                        <ExternalLink className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-2">
                      Sync your billing above to access invoices
                    </p>
                    <p className="text-sm text-gray-500">
                      Or{' '}
                      <a 
                        href="mailto:support@applypro.org?subject=Invoice Request" 
                        className="text-blue-600 hover:underline"
                      >
                        request invoices via email
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Cancel Subscription?</h3>
              <p className="text-gray-600 text-center mb-6">
                You'll keep access until{' '}
                <strong>
                  {recurringPlan?.currentPeriodEnd
                    ? new Date(recurringPlan.currentPeriodEnd).toLocaleDateString()
                    : 'the end of your billing period'}
                </strong>
                .
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
