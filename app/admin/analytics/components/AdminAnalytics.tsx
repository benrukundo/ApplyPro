'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Eye,
  MousePointer,
  Download,
  TrendingUp,
  Search,
  Loader2,
  Calendar,
  ArrowLeft,
  Shield,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Users,
  Settings,
  Bell,
  ChevronRight,
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
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
  topSearches: Array<{ query: string; count: number }>;
  dailyViews: Array<{ date: string; views: number }>;
}

export default function AdminAnalytics({ admin }: { admin: AdminUser }) {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/analytics/summary?days=${days}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: true },
    { name: 'Resume Examples', href: '/admin/examples', icon: FileText, current: false, badge: 'Soon' },
    { name: 'Users', href: '/admin/users', icon: Users, current: false, badge: 'Soon' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: false, badge: 'Soon' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">ApplyPro</p>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                item.current ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
              {admin.name?.charAt(0) || admin.email?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin.name || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white">Analytics</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
        </header>

        <main className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : !data ? (
            <div className="text-center py-20">
              <p className="text-slate-500">Failed to load analytics</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-sm text-slate-400">Total Views</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{data.summary.totalViews.toLocaleString()}</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <MousePointer className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-sm text-slate-400">Previews</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{data.summary.totalPreviews.toLocaleString()}</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Download className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-sm text-slate-400">Template Uses</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{data.summary.totalTemplateUses.toLocaleString()}</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-sm text-slate-400">Conversion Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{data.summary.conversionRate}%</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Top Examples */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Top Resume Examples
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-700">
                    {data.topExamples.map((example, index) => (
                      <div key={example.slug} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-300">
                            {index + 1}
                          </span>
                          <span className="text-slate-200">{example.title}</span>
                        </div>
                        <span className="text-sm text-slate-400">{example.views.toLocaleString()} views</span>
                      </div>
                    ))}
                    {data.topExamples.length === 0 && (
                      <p className="px-6 py-4 text-slate-500 text-center">No data yet</p>
                    )}
                  </div>
                </div>

                {/* Top Categories */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-700">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      Top Categories
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-700">
                    {data.topCategories.map((category, index) => (
                      <div key={category.slug} className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-300">
                            {index + 1}
                          </span>
                          <span className="text-slate-200">{category.name}</span>
                        </div>
                        <span className="text-sm text-slate-400">{category.views.toLocaleString()} views</span>
                      </div>
                    ))}
                    {data.topCategories.length === 0 && (
                      <p className="px-6 py-4 text-slate-500 text-center">No data yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Searches */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-green-400" />
                    Top Search Queries
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {data.topSearches.map((search) => (
                      <span
                        key={search.query}
                        className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-full text-sm"
                      >
                        {search.query}
                        <span className="ml-2 text-slate-500">({search.count})</span>
                      </span>
                    ))}
                    {data.topSearches.length === 0 && (
                      <p className="text-slate-500">No searches yet</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
