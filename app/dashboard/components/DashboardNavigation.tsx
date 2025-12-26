'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  PenTool,
  Search,
  Brain,
  Linkedin,
  Briefcase,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Crown,
  Zap,
  ChevronRight,
  Bell,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SubscriptionInfo {
  plan: string | null;
  status: string;
  isActive: boolean;
  monthlyUsageCount: number;
  monthlyLimit: number;
  daysUntilReset?: number;
}

const navigationGroups = [
  {
    name: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Job Tracker', href: '/tracker', icon: Briefcase },
    ],
  },
  {
    name: 'Resume Tools',
    items: [
      { name: 'AI Generate', href: '/generate', icon: Sparkles, badge: 'AI' },
      { name: 'Build Resume', href: '/build-resume', icon: PenTool },
      { name: 'Resume Examples', href: '/resume-examples', icon: BookOpen },
      { name: 'ATS Checker', href: '/ats-checker', icon: Search, badge: 'Free' },
    ],
  },
  {
    name: 'Career Tools',
    items: [
      { name: 'Interview Prep', href: '/interview-prep', icon: Brain },
      { name: 'LinkedIn Optimizer', href: '/linkedin-optimizer', icon: Linkedin },
    ],
  },
  {
    name: 'Account',
    items: [
      { name: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
    ],
  },
];

export default function DashboardNavigation({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription');
        const data = await response.json();
        if (response.ok && data.subscription) {
          setSubscription(data.subscription);
        }
      } catch (err) {
        console.error('Error loading subscription:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSubscription();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlanInfo = () => {
    if (!subscription?.isActive) {
      return { name: 'Free', color: 'bg-gray-100 text-gray-700', icon: null };
    }
    switch (subscription.plan) {
      case 'monthly':
        return { name: 'Pro Monthly', color: 'bg-blue-100 text-blue-700', icon: Crown };
      case 'yearly':
        return { name: 'Pro Yearly', color: 'bg-purple-100 text-purple-700', icon: Crown };
      case 'pay-per-use':
        return { name: 'Credits', color: 'bg-amber-100 text-amber-700', icon: Zap };
      default:
        return { name: 'Free', color: 'bg-gray-100 text-gray-700', icon: null };
    }
  };

  const planInfo = getPlanInfo();
  const usageDisplay = subscription?.isActive 
    ? `${subscription.monthlyUsageCount}/${subscription.monthlyLimit}` 
    : null;

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">ApplyPro</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Badge / Upgrade CTA */}
        <div className="px-4 py-4 border-b border-gray-100">
          {subscription?.isActive ? (
            <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {planInfo.icon && <planInfo.icon className="w-4 h-4 text-blue-600" />}
                  <span className="text-sm font-semibold text-gray-900">{planInfo.name}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planInfo.color}`}>
                  Active
                </span>
              </div>
              {usageDisplay && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Usage</span>
                    <span className="font-medium text-gray-700">{usageDisplay}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((subscription.monthlyUsageCount / subscription.monthlyLimit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  {subscription.daysUntilReset && (
                    <p className="text-xs text-gray-400">Resets in {subscription.daysUntilReset} days</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/pricing"
              className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Upgrade to Pro</p>
                  <p className="text-xs text-gray-500">Unlimited AI generations</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
          {navigationGroups.map((group) => (
            <div key={group.name}>
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.name}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          item.badge === 'AI' 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                            : item.badge === 'Free'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="relative">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt="" 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {getInitials(user.name)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Top Header - Mobile */}
      <header className="lg:hidden fixed top-0 right-0 left-0 z-30 h-16 bg-white/95 backdrop-blur-xl border-b border-gray-200">
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">ApplyPro</span>
          </Link>

          <Link
            href="/"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  );
}
