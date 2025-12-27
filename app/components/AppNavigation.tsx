'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  PenLine,
  LayoutTemplate,
  ScanSearch,
  MessageCircle,
  Linkedin,
  Menu,
  X,
  Zap,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

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
}

// =============================================================================
// NAVIGATION CONFIG
// =============================================================================

const navigationGroups: NavGroup[] = [
  {
    name: '',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Job Tracker', href: '/tracker', icon: Briefcase },
    ],
  },
  {
    name: 'Resume',
    items: [
      { name: 'Tailor Resume', href: '/generate', icon: Sparkles },
      { name: 'Resume Builder', href: '/build-resume', icon: PenLine },
      { name: 'Templates', href: '/templates', icon: LayoutTemplate },
      {
        name: 'ATS Scanner',
        href: '/ats-checker',
        icon: ScanSearch,
        badge: 'Free',
        badgeColor: 'bg-emerald-100 text-emerald-700',
      },
    ],
  },
  {
    name: 'Prepare',
    items: [
      { name: 'Interview Prep', href: '/interview-prep', icon: MessageCircle },
      { name: 'LinkedIn Optimizer', href: '/linkedin-optimizer', icon: Linkedin },
    ],
  },
];

// =============================================================================
// MOBILE MENU COMPONENT
// =============================================================================

import MobileUserMenu from './MobileUserMenu';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AppNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  // ===========================================================================
  // NAVIGATION CONTENT
  // ===========================================================================

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* ===== LOGO SECTION ===== */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/30 transition-shadow">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            ApplyPro
          </span>
        </Link>
        
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
         

      {/* ===== MAIN NAVIGATION ===== */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.name || `group-${groupIndex}`}>
            {/* Group Header (only if name exists) */}
            {group.name && (
              <div className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                {group.name}
              </div>
            )}

            {/* Navigation Items */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium 
                      transition-all duration-200 group
                      ${active
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-[18px] h-[18px] transition-colors ${
                          active
                            ? 'text-blue-600'
                            : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className={`
                          px-2 py-0.5 text-[10px] font-bold rounded-full
                          ${item.badgeColor || 'bg-gray-100 text-gray-600'}
                        `}
                      >
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

      {/* ===== USER SECTION (Pinned to Bottom) ===== */}
      <div className="lg:hidden">
        <MobileUserMenu />
      </div>
    </div>
  );

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <>
      {/* ===== MOBILE HEADER ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900">ApplyPro</span>
        </Link>

        {/* Placeholder for right side balance */}
        <div className="w-9" />
      </header>

      {/* ===== MOBILE OVERLAY ===== */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-300 ease-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Main navigation"
      >
        <NavContent />
      </aside>
    </>
  );
}
