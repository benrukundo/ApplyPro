'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  Filter,
  FileText,
  Target,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Lock,
  Loader2,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface SubscriptionInfo {
  plan: 'free' | 'monthly' | 'yearly' | 'pay-per-use' | null;
  status: 'active' | 'cancelled' | 'failed' | null;
  monthlyUsageCount: number;
  monthlyLimit: number;
  daysUntilReset: number;
  isActive: boolean;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!session?.user) {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [session, router]);

  // Load subscription info
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription');
        const data = await response.json();

        if (response.ok) {
          setSubscription(data.subscription);
        }
      } catch (err) {
        console.error('Error loading subscription:', err);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    if (session?.user?.id) {
      loadSubscription();
    }
  }, [session?.user?.id]);

  // Load applications
  useEffect(() => {
    const apps = getAllApplications();
    setApplications(apps);
  }, []);

  const stats = getStatistics();
  const upcomingFollowUps = getUpcomingFollowUps();

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

        {/* Subscription Card */}
        {!isLoadingSubscription && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  Your Plan
                </h2>

                {subscription?.isActive ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-semibold text-blue-600 mb-2">
                        {subscription.plan === 'monthly'
                          ? 'Pro Monthly'
                          : subscription.plan === 'yearly'
                            ? 'Pro Yearly'
                            : 'Pay-Per-Use'}
                      </p>
                      <p className="text-gray-600">
                        {subscription.plan === 'monthly' || subscription.plan === 'yearly'
                          ? `${subscription.monthlyLimit} resumes per month`
                          : 'Pay per resume'}
                      </p>
                    </div>

                    {(subscription.plan === 'monthly' || subscription.plan === 'yearly') && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Usage This Month</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {subscription.monthlyUsageCount} / {subscription.monthlyLimit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (subscription.monthlyUsageCount / subscription.monthlyLimit) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Resets in {subscription.daysUntilReset} days
                        </p>
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

              <Link
                href={subscription?.isActive ? '/coming-soon' : '/pricing'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {subscription?.isActive ? 'Manage Subscription' : 'Upgrade Plan'}
              </Link>
            </div>
          </div>
        )}

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
                  {stats.total > 0
                    ? ((stats.offer / stats.total) * 100).toFixed(1)
                    : 0}
                  %
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
                      Follow up on{' '}
                      {new Date(app.followUpDate || 0).toLocaleDateString()}
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
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            app.status
                          )}`}
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
              <Link
                href="/tracker"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Start tracking applications →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
