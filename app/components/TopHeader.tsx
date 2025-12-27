'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Settings,
  LogOut,
  HelpCircle,
  Shield,
  Zap,
  ChevronDown,
  User,
} from 'lucide-react';

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

export default function TopHeader() {
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as any)?.isAdmin;

  // Load subscription status
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription');
        const data = await response.json();
        if (response.ok && data.subscription) {
          setHasActiveSubscription(data.subscription.isActive);
        }
      } catch (err) {
        console.error('Error loading subscription:', err);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    if (session?.user) {
      loadSubscription();
    }
  }, [session?.user]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header className="hidden lg:flex h-16 items-center justify-end gap-3 px-6 border-b border-gray-200 bg-white sticky top-0 z-30">
      {/* Upgrade Button - Only for free users */}
      {!isLoadingSubscription && !hasActiveSubscription && (
        <Link
          href="/pricing"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
        >
          <Zap className="w-4 h-4" />
          Upgrade
        </Link>
      )}

      {/* User Profile Dropdown */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={`
            flex items-center gap-3 px-3 py-2 rounded-xl transition-all
            ${userMenuOpen
              ? 'bg-gray-100'
              : 'hover:bg-gray-50'
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

          {/* Name (hidden on smaller screens) */}
          <span className="hidden xl:block text-sm font-medium text-gray-700">
            {session?.user?.name?.split(' ')[0] || 'User'}
          </span>

          {/* Chevron */}
          <ChevronDown
            className={`
              w-4 h-4 text-gray-400 transition-transform duration-200
              ${userMenuOpen ? 'rotate-180' : ''}
            `}
          />
        </button>

        {/* Dropdown Menu */}
        {userMenuOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
            role="menu"
          >
            {/* User Info Header */}
            <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-11 h-11 rounded-full border-2 border-white shadow-sm object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
                    {getInitials(session?.user?.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Account Settings
              </Link>

              <Link
                href="/help"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                <HelpCircle className="w-4 h-4 text-gray-400" />
                FAQ & Help
              </Link>

              {/* Admin Link (Conditional) */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                  role="menuitem"
                >
                  <Shield className="w-4 h-4 text-purple-500" />
                  Admin Panel
                </Link>
              )}
            </div>

            {/* Log Out */}
            <div className="border-t border-gray-100">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
