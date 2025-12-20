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
  Loader2,
  Sparkles,
  TrendingUp,
  RefreshCw,
  FileText,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Zap,
  Target,
  Send,
  Brain,
  Linkedin,
  Search as SearchIcon,
  PenTool,
  Crown,
  Calendar,
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

function DashboardContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
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
        const [apps, statsData] = await Promise.all([
          getAllApplications(),
          getStatistics(),
        ]);
        setApplications(apps);
        setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id]);

  const handleCancelSuccess = (message: string) => {
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

  // Sort applications by date
  const recentApplications = [...applications]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 4);

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
      case 'saved': return <Briefcase className="h-3 w-3" />;
      case 'applied': return <Send className="h-3 w-3" />;
      case 'interview': return <Clock className="h-3 w-3" />;
      case 'offer': return <CheckCircle2 className="h-3 w-3" />;
      case 'rejected': return <XCircle className="h-3 w-3" />;
      default: return <Briefcase className="h-3 w-3" />;
    }
  };

  const getPlanDisplayName = (plan: string | null) => {
    switch (plan) {
      case 'monthly': return 'Pro';
      case 'yearly': return 'Pro';
      case 'pay-per-use': return 'Credits';
      default: return 'Free';
    }
  };

  const getUsageDisplay = () => {
    if (!subscription?.isActive) return null;
    const used = subscription.monthlyUsageCount || 0;
    const limit = subscription.monthlyLimit || 0;
    return `${used}/${limit}`;
  };

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-100/30 to-cyan-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Header with Greeting and Subscription Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="text-gray-600">Ready to land your dream job?</p>
          </div>

          {/* Compact Subscription Badge */}
          {!isLoadingSubscription && (
            <div className="flex items-center gap-2">
              {subscription?.isActive ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Crown className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {getPlanDisplayName(subscription.plan)}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm font-medium text-blue-600">
                    {getUsageDisplay()} used
                  </span>
                  {subscription.daysUntilReset && subscription.plan !== 'pay-per-use' && (
                    <>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        Resets in {subscription.daysUntilReset}d
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                >
                  <Zap className="w-4 h-4" />
                  Upgrade
                </Link>
              )}
            </div>
          )}
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

        {/* What would you like to do today? */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            What would you like to do today?
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Generate Resume - Primary */}
            <Link
              href="/generate"
              className="group relative p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Generate Resume</h3>
              <p className="text-sm text-gray-600">Tailor your resume to any job with AI</p>
              <ArrowRight className="absolute top-5 right-5 w-5 h-5 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>

            {/* Build from Scratch */}
            <Link
              href="/build-resume"
              className="group relative p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Build Resume</h3>
              <p className="text-sm text-gray-600">Create from scratch step by step</p>
              <ArrowRight className="absolute top-5 right-5 w-5 h-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
            </Link>

            {/* ATS Check - Free */}
            <Link
              href="/ats-checker"
              className="group relative p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <SearchIcon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">ATS Check</h3>
              <p className="text-sm text-gray-600">Free score check for your resume</p>
              <span className="absolute top-4 right-4 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Free
              </span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total</span>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Applied</span>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{stats.applied}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Interviews</span>
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.interview}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Success Rate</span>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {stats.total > 0 ? ((Number(stats.offer) / Number(stats.total)) * 100).toFixed(0) : 0}%
            </p>
          </div>
        </div>

        {/* Two Column: Recent Resumes & Recent Applications */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Resumes */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="font-bold text-gray-900">Recent Resumes</h2>
              </div>
              <Link
                href="/generate"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                + New
              </Link>
            </div>

            <div className="p-4">
              {isLoadingGenerations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              ) : generations.length > 0 ? (
                <div className="space-y-2">
                  {generations.slice(0, 4).map((gen) => (
                    <div
                      key={gen.id}
                      className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
                      onClick={() => setExpandedGeneration(expandedGeneration === gen.id ? null : gen.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">
                              {gen.jobTitle || gen.company || 'Tailored Resume'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(gen.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-bold text-blue-600">{gen.matchScore}%</span>
                          {expandedGeneration === gen.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {expandedGeneration === gen.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(gen, 'resume', 'pdf'); }}
                            disabled={downloadingId === gen.id}
                            className="px-2.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> PDF
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(gen, 'ats', 'pdf'); }}
                            disabled={downloadingId === gen.id}
                            className="px-2.5 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> ATS
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(gen, 'cover', 'pdf'); }}
                            disabled={downloadingId === gen.id}
                            className="px-2.5 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Cover
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(gen.id); }}
                            disabled={deletingId === gen.id}
                            className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg flex items-center gap-1"
                          >
                            {deletingId === gen.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
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
                  <p className="text-sm text-gray-600 mb-1">No resumes yet</p>
                  <p className="text-xs text-gray-500 mb-3">Create your first AI-tailored resume</p>
                  <Link
                    href="/generate"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Generate
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
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

            <div className="p-4">
              {recentApplications.length > 0 ? (
                <div className="space-y-2">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{app.companyName}</p>
                          <p className="text-xs text-gray-500 truncate">{app.positionTitle}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
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
                    <Plus className="w-3.5 h-3.5" /> Add Application
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* More Tools Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            🛠️ More Tools
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/tracker"
              className="group flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">Job Tracker</p>
                <p className="text-xs text-gray-500">Track applications</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/templates"
              className="group flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50/50 transition-all"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">Templates</p>
                <p className="text-xs text-gray-500">Browse designs</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <div className="group flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 opacity-75">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">Interview Prep</p>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">Soon</span>
            </div>

            <div className="group flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50/50 opacity-75">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">LinkedIn</p>
                <p className="text-xs text-gray-500">Coming soon</p>
              </div>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">Soon</span>
            </div>
          </div>

          {/* Manage Subscription Link */}
          {subscription?.isActive && !subscription?.cancelledAt && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Need to manage your subscription?
              </p>
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Cancel subscription
              </button>
            </div>
          )}
        </div>

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
