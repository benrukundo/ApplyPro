'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getAllApplications,
  getStatistics,
  getUpcomingFollowUps,
  Application,
} from '@/lib/tracker';
import {
  Plus,
  Search,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  Calendar,
  TrendingUp,
  RefreshCw,
  FileText,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  CreditCard,
} from 'lucide-react';
import CancelSubscriptionModal from '@/components/CancelSubscriptionModal';
import {
  generatePDF,
  generateDOCX,
  generateCoverLetterPDF,
  generateCoverLetterDOCX,
} from '@/lib/documentGenerator';

export const dynamic = 'force-dynamic';

interface SubscriptionInfo {
  plan: 'free' | 'monthly' | 'yearly' | 'pay-per-use' | null;
  status: 'active' | 'cancelled' | 'failed' | null;
  monthlyUsageCount: number;
  monthlyLimit: number;
  daysUntilReset: number;
  isActive: boolean;
  currentPeriodEnd?: string;
  cancelledAt?: string;
}

interface GenerationHistory {
  id: string;
  jobTitle: string | null;
  company: string | null;
  matchScore: number;
  createdAt: string;
  fullResume: string;
  atsResume: string;
  coverLetter: string;
}

function DashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  // Generation history state
  const [generations, setGenerations] = useState<GenerationHistory[]>([]);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(true);
  const [expandedGeneration, setExpandedGeneration] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!session?.user) {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [session, router]);

  // Load subscription info
  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      const data = await response.json();

      if (response.ok) {
        setSubscription(data.subscription);
        return data.subscription;
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
    } finally {
      setIsLoadingSubscription(false);
    }
    return null;
  };

  // Load generation history
  const loadGenerations = async () => {
    try {
      const response = await fetch('/api/user/generations?limit=10');
      const data = await response.json();

      if (response.ok) {
        setGenerations(data.generations);
      }
    } catch (err) {
      console.error('Error loading generations:', err);
    } finally {
      setIsLoadingGenerations(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadSubscription();
      loadGenerations();
    }
  }, [session?.user?.id]);

  // Handle post-payment polling
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');

    if (paymentStatus === 'success' && session?.user?.id) {
      let attempts = 0;
      const maxAttempts = 10;

      setIsPolling(true);
      setIsLoadingSubscription(true);

      const pollSubscription = async () => {
        attempts++;

        try {
          const response = await fetch('/api/user/subscription');
          const data = await response.json();

          if (response.ok && data.subscription?.isActive && !data.subscription?.cancelledAt) {
            setSubscription(data.subscription);
            setIsLoadingSubscription(false);
            setIsPolling(false);

            window.history.replaceState({}, '', '/dashboard');
            return;
          }

          if (attempts < maxAttempts) {
            setTimeout(pollSubscription, 1500);
          } else {
            setIsLoadingSubscription(false);
            setIsPolling(false);
          }
        } catch (err) {
          console.error('Error polling subscription:', err);
          if (attempts < maxAttempts) {
            setTimeout(pollSubscription, 1500);
          } else {
            setIsLoadingSubscription(false);
            setIsPolling(false);
          }
        }
      };

      pollSubscription();
    }
  }, [searchParams, session?.user?.id]);

  // Load applications
  useEffect(() => {
    const apps = getAllApplications();
    setApplications(apps);
  }, []);

  const stats = getStatistics();
  const upcomingFollowUps = getUpcomingFollowUps();

  const handleCancelSuccess = (message: string, effectiveDate: string) => {
    setCancelMessage(message);
    loadSubscription();
  };

  // Handle download from history
  const handleDownload = async (
    generation: GenerationHistory,
    type: 'resume' | 'ats' | 'cover',
    format: 'pdf' | 'docx'
  ) => {
    setDownloadingId(generation.id);

    try {
      const timestamp = new Date(generation.createdAt).toISOString().split('T')[0];
      const companySlug = generation.company?.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume';

      if (type === 'cover') {
        const content = generation.coverLetter;
        if (format === 'pdf') {
          await generateCoverLetterPDF(content, `Cover_Letter_${companySlug}_${timestamp}.pdf`);
        } else {
          await generateCoverLetterDOCX(content, `Cover_Letter_${companySlug}_${timestamp}.docx`);
        }
      } else {
        const content = type === 'ats' ? generation.atsResume : generation.fullResume;
        const baseName = type === 'ats' ? 'ATS_Resume' : 'Resume';
        const template = type === 'ats' ? 'ats' : 'modern';

        if (format === 'pdf') {
          await generatePDF(content, `${baseName}_${companySlug}_${timestamp}.pdf`, template);
        } else {
          await generateDOCX(content, `${baseName}_${companySlug}_${timestamp}.docx`, template);
        }
      }
    } catch (err) {
      console.error('Error downloading:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle delete generation
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this generation? This cannot be undone.')) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/user/generations?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGenerations((prev) => prev.filter((g) => g.id !== id));
      }
    } catch (err) {
      console.error('Error deleting generation:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter applications
  const filteredApplications = applications
    .filter((app) => {
      if (filterStatus !== 'all' && app.status !== filterStatus) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          app.companyName.toLowerCase().includes(query) ||
          app.positionTitle.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saved':
        return 'bg-gray-100 text-gray-700';
      case 'applied':
        return 'bg-blue-100 text-blue-700';
      case 'interview':
        return 'bg-purple-100 text-purple-700';
      case 'offer':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'saved':
        return <Briefcase className="h-4 w-4" />;
      case 'applied':
        return <Clock className="h-4 w-4" />;
      case 'interview':
        return <AlertCircle className="h-4 w-4" />;
      case 'offer':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getPlanDisplayName = (plan: string | null) => {
    switch (plan) {
      case 'monthly':
        return 'Pro Monthly';
      case 'yearly':
        return 'Pro Yearly';
      case 'pay-per-use':
        return 'Pay-Per-Use';
      default:
        return 'Free';
    }
  };

  // Check if credits/usage exhausted
  const isCreditsExhausted = subscription?.isActive && 
    subscription.monthlyUsageCount >= subscription.monthlyLimit;

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-xl text-gray-600">Track your job applications and manage your account</p>
        </div>

        {/* Success Message */}
        {cancelMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
            <p className="text-green-800 font-medium">{cancelMessage}</p>
            <button
              onClick={() => setCancelMessage('')}
              className="text-green-600 hover:text-green-800"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Payment Processing Message */}
        {isPolling && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-blue-800 font-medium">Processing your payment... Please wait.</p>
          </div>
        )}

        {/* Subscription Card */}
        {!isLoadingSubscription && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-100">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex-1 min-w-[300px]">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  Your Plan
                </h2>

                {subscription?.isActive || (subscription?.cancelledAt && subscription?.currentPeriodEnd) ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-semibold text-blue-600 mb-2">
                        {getPlanDisplayName(subscription?.plan)}
                      </p>
                      <p className="text-gray-600">
                        {subscription?.plan === 'monthly' || subscription?.plan === 'yearly'
                          ? `${subscription.monthlyLimit} resumes per month`
                          : subscription?.plan === 'pay-per-use'
                            ? `${Math.max(0, subscription.monthlyLimit - subscription.monthlyUsageCount)} credits remaining`
                            : 'Limited access'}
                      </p>
                    </div>

                    {/* Cancellation Warning */}
                    {subscription?.cancelledAt && subscription?.currentPeriodEnd && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-900 font-semibold mb-1">Subscription Cancelled</p>
                        <p className="text-sm text-amber-800">
                          Access until{' '}
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    )}

                    {/* Usage Progress for Monthly/Yearly */}
                    {(subscription?.plan === 'monthly' || subscription?.plan === 'yearly') &&
                      !subscription?.cancelledAt && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Usage This Month</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {subscription.monthlyUsageCount} / {subscription.monthlyLimit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                isCreditsExhausted ? 'bg-red-500' : 'bg-blue-600'
                              }`}
                              style={{
                                width: `${Math.min(100, (subscription.monthlyUsageCount / subscription.monthlyLimit) * 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Resets in {subscription.daysUntilReset} days
                          </p>

                          {/* Monthly/Yearly Limit Reached */}
                          {isCreditsExhausted && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-amber-900 font-semibold mb-1">Monthly Limit Reached</p>
                              <p className="text-sm text-amber-800 mb-3">
                                You've used all {subscription.monthlyLimit} resumes this month. Resets in {subscription.daysUntilReset} days.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                    {/* Pay-per-use credits */}
                    {subscription?.plan === 'pay-per-use' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Credits Used</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {subscription.monthlyUsageCount} / {subscription.monthlyLimit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              isCreditsExhausted ? 'bg-red-500' : 'bg-green-600'
                            }`}
                            style={{
                              width: `${(subscription.monthlyUsageCount / subscription.monthlyLimit) * 100}%`,
                            }}
                          />
                        </div>

                        {/* Credits Exhausted Warning */}
                        {isCreditsExhausted && (
                          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-amber-900 font-semibold mb-1">All Credits Used</p>
                                <p className="text-sm text-amber-800 mb-3">
                                  Purchase more credits or upgrade to a monthly plan for more generations.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  <Link
                                    href="/pricing"
                                    className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-medium hover:bg-amber-700 transition-colors"
                                  >
                                    Buy More Credits
                                  </Link>
                                  <Link
                                    href="/pricing"
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                  >
                                    Upgrade to Pro
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-amber-900">No Active Subscription</p>
                      <p className="text-sm text-amber-800">
                        Subscribe to start generating tailored resumes
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {subscription?.isActive && !subscription?.cancelledAt ? (
                  <>
                    {isCreditsExhausted ? (
                      <>
                        <Link
                          href="/pricing"
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors text-center"
                        >
                          {subscription.plan === 'pay-per-use' ? 'Buy More Credits' : 'View Plans'}
                        </Link>
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                        >
                          Cancel Subscription
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/generate"
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                        >
                          Generate Resume
                        </Link>
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                        >
                          Cancel Subscription
                        </button>
                      </>
                    )}
                  </>
                ) : subscription?.cancelledAt ? (
                  <>
                    <Link
                      href="/generate"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                    >
                      Generate Resume
                    </Link>
                    <Link
                      href="/pricing"
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
                    >
                      Resubscribe
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/pricing"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                  >
                    Upgrade Plan
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Subscription */}
        {isLoadingSubscription && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-100">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading subscription...</p>
            </div>
          </div>
        )}

        {/* Cancel Subscription Modal */}
        <CancelSubscriptionModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSuccess={handleCancelSuccess}
          plan={subscription?.plan || 'free'}
          currentPeriodEnd={subscription?.currentPeriodEnd}
        />

        {/* Generation History */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Recent Generations
            </h2>
            <Link
              href="/generate"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Generate New →
            </Link>
          </div>

          {isLoadingGenerations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : generations.length > 0 ? (
            <div className="space-y-4">
              {generations.map((gen) => (
                <div
                  key={gen.id}
                  className="border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Generation Header */}
                  <div
                    className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      setExpandedGeneration(expandedGeneration === gen.id ? null : gen.id)
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {gen.jobTitle || 'Resume'}{' '}
                          {gen.company && (
                            <span className="text-gray-500 font-normal">at {gen.company}</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(gen.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Match Score</p>
                        <p className="font-bold text-blue-600">{gen.matchScore}%</p>
                      </div>
                      {expandedGeneration === gen.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedGeneration === gen.id && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {/* Tailored Resume */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="font-medium text-gray-900 mb-2">Tailored Resume</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownload(gen, 'resume', 'pdf')}
                              disabled={downloadingId === gen.id}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </button>
                            <button
                              onClick={() => handleDownload(gen, 'resume', 'docx')}
                              disabled={downloadingId === gen.id}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              DOCX
                            </button>
                          </div>
                        </div>

                        {/* ATS Resume */}
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="font-medium text-gray-900 mb-2">ATS-Optimized</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownload(gen, 'ats', 'pdf')}
                              disabled={downloadingId === gen.id}
                              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </button>
                            <button
                              onClick={() => handleDownload(gen, 'ats', 'docx')}
                              disabled={downloadingId === gen.id}
                              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              DOCX
                            </button>
                          </div>
                        </div>

                        {/* Cover Letter */}
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <p className="font-medium text-gray-900 mb-2">Cover Letter</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownload(gen, 'cover', 'pdf')}
                              disabled={downloadingId === gen.id}
                              className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </button>
                            <button
                              onClick={() => handleDownload(gen, 'cover', 'docx')}
                              disabled={downloadingId === gen.id}
                              className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              DOCX
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(gen.id)}
                          disabled={deletingId === gen.id}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {deletingId === gen.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No generations yet</p>
              <Link href="/generate" className="text-blue-600 hover:text-blue-700 font-medium">
                Generate your first resume →
              </Link>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-600 opacity-10" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Applied</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.applied}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-blue-600 opacity-10" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats.interview + stats.offer}
                </p>
              </div>
              <AlertCircle className="w-12 h-12 text-purple-600 opacity-10" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.total > 0 ? ((stats.offer / stats.total) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-10" />
            </div>
          </div>
        </div>

        {/* Upcoming Follow-ups */}
        {upcomingFollowUps.length > 0 && (
          <div className="mb-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Follow-ups</h2>
            <div className="space-y-3">
              {upcomingFollowUps.slice(0, 5).map((app) => (
                <div key={app.id} className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{app.companyName}</p>
                      <p className="text-sm text-gray-600">{app.positionTitle}</p>
                    </div>
                    <span className="text-sm text-yellow-700 font-medium">
                      Follow up on {new Date(app.followUpDate || 0).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Applications</h2>
            <Link
              href="/tracker"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Application
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies or positions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Status</option>
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Applications Table */}
          {filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{app.companyName}</td>
                      <td className="px-6 py-4 text-gray-700">{app.positionTitle}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}
                        >
                          {getStatusIcon(app.status)}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No applications found</p>
              <Link href="/tracker" className="text-blue-600 hover:text-blue-700 font-semibold">
                Start tracking applications
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
