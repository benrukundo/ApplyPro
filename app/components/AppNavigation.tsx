'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FileText,
  Wand2,
  Target,
  MessageSquare,
  Linkedin,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Shield,
  User,
  CreditCard,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  name: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navigationGroups: NavGroup[] = [
  {
    name: 'Overview',
    defaultOpen: true,
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    name: 'Resume Tools',
    defaultOpen: true,
    items: [
      { name: 'AI Generate', href: '/generate', icon: Wand2 },
      { name: 'Build Resume', href: '/build-resume', icon: FileText },
      { name: 'Resume Examples', href: '/resume-examples', icon: BookOpen },
      { name: 'ATS Checker', href: '/ats-checker', icon: Target, badge: 'Free', badgeColor: 'bg-green-100 text-green-700' },
    ],
  },
  {
    name: 'Career Tools',
    defaultOpen: true,
    items: [
      { name: 'Job Tracker', href: '/tracker', icon: Target },
      { name: 'Interview Prep', href: '/interview-prep', icon: MessageSquare },
      { name: 'LinkedIn Optimizer', href: '/linkedin-optimizer', icon: Linkedin },
    ],
  },
];

export default function AppNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    navigationGroups.forEach((group) => {
      initialExpanded[group.name] = group.defaultOpen ?? true;
    });
    setExpandedGroups(initialExpanded);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 1. Logo Section */}
      <div className="flex items-center h-16 px-6 border-b border-gray-100 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <span className="font-bold text-lg">⚡</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">ApplyPro</span>
        </Link>
      </div>

      {/* 2. Navigation Links (Flex-1 fills available space) */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-none">
        {navigationGroups.map((group) => (
          <div key={group.name}>
            <button
              onClick={() => toggleGroup(group.name)}
              className="flex items-center justify-between w-full mb-2 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
            >
              <span>{group.name}</span>
              {expandedGroups[group.name] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            {expandedGroups[group.name] && (
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className={`w-4.5 h-4.5 mr-3 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor || 'bg-gray-100 text-gray-600'}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* 3. User Profile & Bottom Actions (Pinned to bottom) */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="space-y-1 mb-4">
          <Link href="/billing" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-white hover:shadow-sm transition-all">
            <CreditCard className="w-4 h-4 mr-3 text-gray-400" />
            Billing
          </Link>
          <Link href="/settings" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-white hover:shadow-sm transition-all">
            <Settings className="w-4 h-4 mr-3 text-gray-400" />
            Settings
          </Link>
          {(session?.user as any)?.isAdmin && (
             <Link href="/admin" className="flex items-center px-3 py-2 text-sm font-medium text-purple-600 rounded-lg hover:bg-purple-50 transition-all">
               <Shield className="w-4 h-4 mr-3" /> Admin
             </Link>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {session?.user?.image ? (
              <img src={session.user.image} alt="User" className="w-9 h-9 rounded-full border border-gray-200" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                {session?.user?.name?.[0] || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {session?.user?.name?.split(' ')[0]}
              </p>
              <button onClick={() => signOut()} className="text-xs text-gray-500 hover:text-red-500 transition-colors text-left truncate w-full">
                Sign out
              </button>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between">
        <span className="font-bold text-lg">ApplyPro</span>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-600">
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>
      
      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavContent />
      </aside>
    </>
  );
}
