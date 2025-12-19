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
  Statistics,
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
  ArrowRight,
  Zap,
  Target,
  Send,
  Brain,
  Linkedin,
  Search as SearchIcon,
  PenTool,
  BarChart3,
  ExternalLink,
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

// Quick Action Card Component
function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  color
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, { bg: string; iconBg: string; iconText: string; hover: string }> = {
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconText: 'text-blue-600', hover: 'hover:bg-blue-100 hover:border-blue-200' },
    purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconText: 'text-purple-600', hover: 'hover:bg-purple-100 hover:border-purple-200' },
    green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconText: 'text-green-600', hover: 'hover:bg-green-100 hover:border-green-200' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconText: 'text-amber-600', hover: 'hover:bg-amber-100 hover:border-amber-200' },
    cyan: { bg: 'bg-cyan-50', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600', hover: 'hover:bg-cyan-100 hover:border-cyan-200' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <Link
      href={href}
      className={`group p-4 rounded-xl border border-gray-200 ${colors.hover} transition-all duration-200`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${colors.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${colors.iconText}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm group-hover:text-gray-700">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
}) {
  const colorClasses: Record<string, { iconBg: string; iconText: string; valueText: string }> = {
    blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-600', valueText: 'text-gray-900' },
    green: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', valueText: 'text-emerald-600' },
    amber: { iconBg: 'bg-amber-100', iconText: 'text-amber-600', valueText: 'text-amber-600' },
    purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-600', valueText: 'text-purple-600' },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${colors.valueText}`}>{value}</p>
          {trend && <p className="text-xs text-gray-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-11 h-11 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.iconText}`} />
        </div>
      </div>
    </div>
  );
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

  // Stats state
  const [stats, setStats] = useState<Statistics>({
    total: 0,
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    responseRate: 0,
    averageResponseTime: 0,
    applicationsByMonth: [],
  });

  const [upcomingFollowUps, setUpcomingFollowUps] = useState<Application[]>([]);

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
      const response = await fetch('/api/user/generations?limit=5');
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

  // Load applications and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        const [apps, statsData, followUps] = await Promise.all([
          getAllApplications(),
          getStatistics(),
          getUpcomingFollowUps()
        ]);
        setApplications(apps);
        setStats(statsData);
        setUpcomingFollowUps(followUps);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id]);

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
      let blob: Blob;
      let fileName: string;

      if (type === 'cover') {
        const content = generation.coverLetter;
        if (format === 'pdf') {
          blob = await generateCoverLetterPDF(content, 'modern', 'blue');
          fileName = `Cover_Letter_${companySlug}_${timestamp}.pdf`;
        } else {
          blob = await generateCoverLetterDOCX(content, 'modern', 'blue');
          fileName = `Cover_Letter_${companySlug}_${timestamp}.docx`;
        }
      } else {
        const content = type === 'ats' ? generation.atsResume : generation.fullResume;
        const template = type === 'ats' ? 'ats' : 'modern';
        const baseName = type === 'ats' ? 'ATS_Resume' : 'Resume';

        if (format === 'pdf') {
          blob = await generatePDF(content, template, 'blue');
          fileName = `${baseName}_${companySlug}_${timestamp}.pdf`;
        } else {
          blob = await generateDOCX(content, template, 'blue');
          fileName = `${baseName}_${companySlug}_${timestamp}.docx`;
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
      const response = await fetch(`/api/user/generations?id=${id}`, { method: 'DELETE' });
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
      if (filterStatus !== 'all' && app.status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          app.companyName.toLowerCase().includes(query) ||
          app.positionTitle.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'saved': return 'bg-slate-100 text-slate-700';
      case 'applied': return 'bg-blue-100 text-blue-700';
      case 'interview': return 'bg-purple-100 text-purple-700';
      case 'offer': return 'bg-emerald-100 text-emerald-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'saved': return <Briefcase className="h-3.5 w-3.5" />;
      case 'applied': return <Send className="h-3.5 w-3.5" />;
      case 'interview': return <Clock className="h-3.5 w-3.5" />;
      case 'offer': return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'rejected': return <XCircle className="h-3.5 w-3.5" />;
      default: return <Briefcase className="h-3.5 w-3.5" />;
    }
  };

  const getPlanDisplayName = (plan: string | null) => {
    switch (plan) {
      case 'monthly': return 'Pro Monthly';
      case 'yearly': return 'Pro Yearly';
      case 'pay-per-use': return 'Pay-Per-Use';
      default: return 'Free';
    }
  };

  const isCreditsExhausted = subscription?.isActive &&
    subscription.monthlyUsageCount >= subscription.monthlyLimit;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = session?.user?.name?.split(' ')[0] || 'there';

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-100/30 to-cyan-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-gray-600">Here's your job search overview</p>
        </div>

        {/* Success/Processing Messages */}
        {cancelMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">{cancelMessage}</p>
            </div>
            <button onClick={() => setCancelMessage('')} className="text-green-600 hover:text-green-800">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {isPolling && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-blue-800 font-medium">Processing your payment... Please wait.</p>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Subscription Card - Takes 2 columns */}
          <div className="lg:col-span-2">
            {!isLoadingSubscription ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Plan Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-900">
                              {getPlanDisplayName(subscription?.plan || null)}
                            </h2>
                            {subscription?.isActive && !subscription?.cancelledAt && (
                              <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {subscription?.plan === 'monthly' || subscription?.plan === 'yearly'
                              ? `${subscription.monthlyLimit} resumes per month`
                              : subscription?.plan === 'pay-per-use'
                                ? `${Math.max(0, (subscription?.monthlyLimit || 0) - (subscription?.monthlyUsageCount || 0))} credits remaining`
                                : 'Upgrade for full access'}
                          </p>
                        </div>
                      </div>

                      {/* Usage Progress */}
                      {subscription?.isActive && (subscription?.plan === 'monthly' || subscription?.plan === 'yearly') && (
                        <div className="max-w-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Usage this month</span>
                            <span className="text-sm font-bold text-gray-900">
                              {subscription.monthlyUsageCount} / {subscription.monthlyLimit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCreditsExhausted
                                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
                              }`}
                              style={{
                                width: `${Math.min(100, (subscription.monthlyUsageCount / subscription.monthlyLimit) * 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Resets in {subscription.daysUntilReset} days
                          </p>
                        </div>
                      )}

                      {/* Pay-per-use progress */}
                      {subscription?.isActive && subscription?.plan === 'pay-per-use' && (
                        <div className="max-w-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Credits used</span>
                            <span className="text-sm font-bold text-gray-900">
                              {subscription.monthlyUsageCount} / {subscription.monthlyLimit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCreditsExhausted
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-600'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-600'
                              }`}
                              style={{
                                width: `${(subscription.monthlyUsageCount / subscription.monthlyLimit) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Cancellation Notice */}
                      {subscription?.cancelledAt && subscription?.currentPeriodEnd && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-800">
                            <span className="font-semibold">Subscription cancelled.</span> Access until{' '}
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                              month: 'long', day: 'numeric', year: 'numeric',
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {subscription?.isActive && !subscription?.cancelledAt ? (
                        <>
                          <Link
                            href="/generate"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all text-sm"
                          >
                            <Sparkles className="w-4 h-4" />
                            Generate Resume
                          </Link>
                          <button
                            onClick={() => setShowCancelModal(true)}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            Cancel subscription
                          </button>
                        </>
                      ) : subscription?.cancelledAt ? (
                        <>
                          <Link
                            href="/generate"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
                          >
                            Generate Resume
                          </Link>
                          <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm"
                          >
                            Resubscribe
                          </Link>
                        </>
                      ) : (
                        <Link
                          href="/pricing"
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all text-sm"
                        >
                          <CreditCard className="w-4 h-4" />
                          Upgrade Plan
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <p className="text-gray-600">Loading subscription...</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 h-full">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <QuickActionCard
                  href="/generate"
                  icon={Sparkles}
                  title="Generate Resume"
                  description="AI-tailored for any job"
                  color="blue"
                />
                <QuickActionCard
                  href="/ats-checker"
                  icon={SearchIcon}
                  title="Check ATS Score"
                  description="Optimize for recruiters"
                  color="green"
                />
                <QuickActionCard
                  href="/interview-prep"
                  icon={Brain}
                  title="Interview Prep"
                  description="Practice with AI"
                  color="purple"
                />
                <QuickActionCard
                  href="/linkedin-optimizer"
                  icon={Linkedin}
                  title="LinkedIn Profile"
                  description="Optimize your profile"
                  color="cyan"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Applications"
            value={stats.total}
            icon={Briefcase}
            color="blue"
          />
          <StatCard
            label="Applied"
            value={stats.applied}
            icon={Send}
            color="green"
          />
          <StatCard
            label="In Progress"
            value={stats.interview + stats.offer}
            icon={Target}
            color="amber"
          />
          <StatCard
            label="Success Rate"
            value={`${stats.total > 0 ? ((Number(stats.offer) / Number(stats.total)) * 100).toFixed(0) : 0}%`}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Two Column Layout for Recent Items */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Generations */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <h2 className="font-bold text-gray-900">Recent Generations</h2>
                </div>
                <Link
                  href="/generate"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  New <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="p-5">
              {isLoadingGenerations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : generations.length > 0 ? (
                <div className="space-y-3">
                  {generations.slice(0, 3).map((gen) => (
                    <div
                      key={gen.id}
                      className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
                      onClick={() => setExpandedGeneration(expandedGeneration === gen.id ? null : gen.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {gen.jobTitle || gen.company ? `Resume for ${gen.company}` : 'Tailored Resume'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(gen.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {gen.company && ` • ${gen.company}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-blue-600">{gen.matchScore}%</span>
                          {expandedGeneration === gen.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {expandedGeneration === gen.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownload(gen, 'resume', 'pdf'); }}
                              disabled={downloadingId === gen.id}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> Resume
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownload(gen, 'ats', 'pdf'); }}
                              disabled={downloadingId === gen.id}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> ATS
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownload(gen, 'cover', 'pdf'); }}
                              disabled={downloadingId === gen.id}
                              className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> Cover
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(gen.id); }}
                              disabled={deletingId === gen.id}
                              className="px-3 py-1.5 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg flex items-center gap-1"
                            >
                              {deletingId === gen.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">No generations yet</p>
                  <p className="text-xs text-gray-500 mb-3">Create your first AI-tailored resume</p>
                  <Link
                    href="/generate"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <h2 className="font-bold text-gray-900">Recent Applications</h2>
                </div>
                <Link
                  href="/tracker"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="p-5">
              {filteredApplications.length > 0 ? (
                <div className="space-y-3">
                  {filteredApplications.slice(0, 4).map((app) => (
                    <div key={app.id} className="p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{app.companyName}</p>
                          <p className="text-xs text-gray-500">{app.positionTitle}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">No applications yet</p>
                  <p className="text-xs text-gray-500 mb-3">Start tracking your job search</p>
                  <Link
                    href="/tracker"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Application
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Applications Table (if many applications) */}
        {filteredApplications.length > 4 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="font-bold text-gray-900">All Applications</h2>
                <div className="flex gap-3">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-48 pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.slice(0, 10).map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900 text-sm">{app.companyName}</td>
                      <td className="px-5 py-4 text-gray-600 text-sm">{app.positionTitle}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-sm">
                        {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredApplications.length > 10 && (
              <div className="p-4 border-t border-gray-100 text-center">
                <Link href="/tracker" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all {filteredApplications.length} applications →
                </Link>
              </div>
            )}
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
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
