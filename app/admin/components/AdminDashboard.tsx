'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  LogOut,
  Shield,
  TrendingUp,
  Eye,
  MousePointer,
  Download,
  ChevronRight,
  Menu,
  X,
  Home,
  Loader2,
  Bell,
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home, current: true },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: false },
    { name: 'Resume Examples', href: '/admin/examples', icon: FileText, current: false, badge: 'Soon' },
    { name: 'Admin Management', href: '/admin/users', icon: Users, current: false },
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
        {/* Logo */}
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
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                item.current
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User & Logout */}
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
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <h1 className="text-lg font-semibold text-white lg:ml-0 ml-2">Dashboard</h1>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              View Site
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
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
        </main>
      </div>
    </div>
  );
}
