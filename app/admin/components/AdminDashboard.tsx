'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  TrendingUp,
  Eye,
  MousePointer,
  Download,
  Loader2,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  twoFactorEnabled: boolean;
}

interface AdminDashboardProps {
  admin: AdminUser;
}

interface AnalyticsSummary {
  summary: {
    totalViews: number;
    totalPreviews: number;
    totalTemplateUses: number;
    conversionRate: string;
  };
  topExamples: Array<{ slug: string; title: string; views: number }>;
  topCategories: Array<{ slug: string; name: string; views: number }>;
}

export default function AdminDashboard({ admin }: AdminDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch('/api/analytics/summary?days=30');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {admin.name?.split(' ')[0] || 'Admin'}! 👋
            </h2>
            <p className="text-slate-400">
              Here's what's happening with ApplyPro today.
            </p>
          </div>

          {/* Stats Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-sm text-slate-400">Total Views</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {analytics.summary.totalViews.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <MousePointer className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-sm text-slate-400">Previews</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {analytics.summary.totalPreviews.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Download className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-sm text-slate-400">Template Uses</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {analytics.summary.totalTemplateUses.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-sm text-slate-400">Conversion</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {analytics.summary.conversionRate}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Views → Template</p>
                </div>
              </div>

              {/* Top Content */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Examples */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Top Resume Examples</h3>
                    <Link 
                      href="/admin/analytics"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-700">
                    {analytics.topExamples.slice(0, 5).map((example, index) => (
                      <div key={example.slug} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-300">
                            {index + 1}
                          </span>
                          <span className="text-slate-200">{example.title}</span>
                        </div>
                        <span className="text-sm text-slate-400">{example.views.toLocaleString()}</span>
                      </div>
                    ))}
                    {analytics.topExamples.length === 0 && (
                      <p className="px-6 py-4 text-slate-500 text-center">No data yet</p>
                    )}
                  </div>
                </div>

                {/* Top Categories */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Top Categories</h3>
                    <Link 
                      href="/admin/analytics"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-700">
                    {analytics.topCategories.slice(0, 5).map((category, index) => (
                      <div key={category.slug} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-300">
                            {index + 1}
                          </span>
                          <span className="text-slate-200">{category.name}</span>
                        </div>
                        <span className="text-sm text-slate-400">{category.views.toLocaleString()}</span>
                      </div>
                    ))}
                    {analytics.topCategories.length === 0 && (
                      <p className="px-6 py-4 text-slate-500 text-center">No data yet</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">Failed to load analytics</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/admin/analytics"
                className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors group"
              >
                <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">View Analytics</p>
                  <p className="text-sm text-slate-400">Detailed metrics & charts</p>
                </div>
              </Link>

              <Link
                href="/resume-examples"
                target="_blank"
                className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors group"
              >
                <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">View Examples</p>
                  <p className="text-sm text-slate-400">See live resume examples</p>
                </div>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors group"
              >
                <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <Settings className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Settings</p>
                  <p className="text-sm text-slate-400">Configure admin options</p>
                </div>
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors group"
              >
                <div className="p-3 bg-amber-500/10 rounded-lg group-hover:bg-amber-500/20 transition-colors">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Admin Management</p>
                  <p className="text-sm text-slate-400">Manage administrator accounts</p>
                </div>
              </Link>
            </div>
          </div>
    </div>
  );
}
