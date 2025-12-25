// components/layout/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { Menu, X, Search } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">ApplyPro</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/resume-examples"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Resume Examples
            </Link>
            <Link
              href="/builder"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Builder
            </Link>
            <Link
              href="/ats-checker"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ATS Checker
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Pricing
            </Link>
          </nav>

          {/* Search & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Desktop Search */}
            <div className="w-64">
              <GlobalSearch placeholder="Search examples..." />
            </div>

            <Link
              href="/builder"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Create Resume
            </Link>
          </div>

          {/* Mobile Buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden py-4 border-t">
            <GlobalSearch placeholder="Search resume examples..." />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 space-y-4">
            <Link
              href="/resume-examples"
              className="text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Resume Examples
            </Link>
            <Link
              href="/builder"
              className="text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Builder
            </Link>
            <Link
              href="/ats-checker"
              className="text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ATS Checker
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/builder"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Create Resume
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
