'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Settings,
  LogOut,
  HelpCircle,
  Shield,
  ChevronUp,
} from 'lucide-react';

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function MobileUserMenu() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = (session?.user as any)?.isAdmin;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative border-t border-gray-100 bg-gray-50/50 p-3">
      {/* User Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`
          w-full flex items-center gap-3 p-2.5 rounded-xl transition-all
          ${menuOpen ? 'bg-white shadow-sm' : 'hover:bg-white hover:shadow-sm'}
        `}
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
        <ChevronUp
          className={`
            w-4 h-4 text-gray-400 transition-transform duration-200
            ${menuOpen ? 'rotate-180' : ''}
          `}
        />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div
          className="absolute bottom-full left-3 right-3 mb-2 py-1.5 bg-white rounded-xl border border-gray-200 shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
          role="menu"
        >
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              role="menuitem"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              Account Settings
            </Link>

            <a
              href="/faq"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              role="menuitem"
            >
              <HelpCircle className="w-4 h-4 text-gray-400" />
              FAQ & Help
            </a>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors"
                role="menuitem"
              >
                <Shield className="w-4 h-4 text-purple-500" />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="border-t border-gray-100">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
