'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  PenLine,
  LayoutTemplate,
  ScanSearch,
  MessageCircle,
  Linkedin,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  Shield,
  ChevronDown,
  HelpCircle,
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
  name: string; // Empty string = no header (primary items)
  items: NavItem[];
}

// =============================================================================
// NAVIGATION CONFIG
// =============================================================================

const navigationGroups: NavGroup[] = [
  {
    name: '', // Primary navigation - no header
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Job Tracker', href: '/tracker', icon: Briefcase },
    ],
  },
  {
    name: 'Resume',
    items: [
      { name: 'AI Tailor', href: '/generate', icon: Sparkles },
      { name: 'Builder', href: '/build-resume', icon: PenLine },
      { name: 'Templates', href: '/templates', icon: LayoutTemplate },
      { 
        name: 'ATS Check', 
        href: '/ats-checker', 
        icon: ScanSearch, 
        badge: 'Free', 
        badgeColor: 'bg-emerald-100 text-emerald-700' 
      },
    ],
  },
  {
    name: 'Prepare',
    items: [
      { name: 'Interviews', href: '/interview-prep', icon: MessageCircle },
      { name: 'LinkedIn', href: '/linkedin-optimizer', icon: Linkedin },
    ],
  },
];

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Check if user has active subscription (adjust based on your session structure)
  const hasActiveSubscription = (session?.user as any)?.subscription?.isActive;
  const isAdmin = (session?.user as any)?.isAdmin;

  // ===========================================================================
  // NAVIGATION CONTENT
  // ===========================================================================

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white">
      
      {/* ===== LOGO SECTION ===== */}
      <div className="flex items-center h-16 px-5 border-b border-gray-100 flex-shrink-0">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/30 transition-shadow">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            ApplyPro
          </span>
        </Link>
      </div>

      {/* ===== UPGRADE PROMPT (Conditional - Free Users Only) ===== */}
      {!hasActiveSubscription && (
        <div className="px-4 pt-4 flex-shrink-0">
          <Link
            href="/pricing"
            className="block p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  Upgrade to Pro
                </p>
                <p className="text-xs text-gray-600 truncate">
                  Unlimited tailored resumes
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

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
      <div 
        ref={userMenuRef}
        className="relative flex-shrink-0 p-3 border-t border-gray-100 bg-gray-50/50"
      >
        {/* User Button */}
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={`
            w-full flex items-center gap-3 p-2.5 rounded-xl transition-all
            ${userMenuOpen 
              ? 'bg-white shadow-sm' 
              : 'hover:bg-white hover:shadow-sm'
            }
          `}
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
        >
          {/* Avatar */}
          {session?.user?.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || 'User'} 
              className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
              {getInitials(session?.user?.name)}
            </div>
          )}
          
          {/* User Info */}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session?.user?.email}
            </p>
          </div>
          
          {/* Chevron */}
          <ChevronDown 
            className={`
              w-4 h-4 text-gray-400 transition-transform duration-200
              ${userMenuOpen ? 'rotate-180' : ''}
            `} 
          />
        </button>

        {/* User Dropdown Menu */}
        {userMenuOpen && (
          <div 
            className="absolute bottom-full left-3 right-3 mb-2 py-1.5 bg-white rounded-xl border border-gray-200 shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
            role="menu"
          >
            {/* Account Section */}
            <div className="px-2 py-1">
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Settings
              </Link>
              
              <Link
                href="/billing"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                <CreditCard className="w-4 h-4 text-gray-400" />
                Billing
              </Link>
              
              <Link
                href="/help"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                <HelpCircle className="w-4 h-4 text-gray-400" />
                Help & Support
              </Link>
            </div>

            {/* Admin Link (Conditional) */}
            {isAdmin && (
              <>
                <div className="my-1.5 mx-3 border-t border-gray-100" />
                <div className="px-2 py-1">
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
                    role="menuitem"
                  >
                    <Shield className="w-4 h-4 text-purple-500" />
                    Admin Panel
                  </Link>
                </div>
              </>
            )}

            {/* Sign Out */}
            <div className="my-1.5 mx-3 border-t border-gray-100" />
            <div className="px-2 py-1">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                role="menuitem"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
                Sign out
              </button>
            </div>
          </div>
        )}
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
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900">ApplyPro</span>
        </Link>
        
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-2 -mr-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
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

      {/* ===== MOBILE SPACER ===== */}
      <div className="lg:hidden h-14" />
    </>
  );
}
