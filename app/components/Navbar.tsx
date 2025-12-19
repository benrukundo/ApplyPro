"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  LogOut, 
  PenTool, 
  Brain, 
  Linkedin, 
  ChevronDown,
  User,
  Settings,
  CreditCard,
  FileText,
  Target,
  Search,
  Sparkles
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't show navbar on login/signup pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  // Get user initials for avatar
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const NavLink = ({ 
    href, 
    children, 
    icon: Icon,
    activeColor = "text-blue-600"
  }: { 
    href: string; 
    children: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    activeColor?: string;
  }) => {
    const isActive = pathname === href || pathname?.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? `${activeColor} bg-gray-100 dark:bg-gray-800`
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span>ApplyPro</span>
          </Link>

          {/* Desktop Navigation */}
          {session ? (
            <>
              {/* Main Navigation - Grouped */}
              <nav className="hidden lg:flex items-center gap-1">
                {/* Core Tools Group */}
                <div className="flex items-center gap-1 px-2">
                  <NavLink href="/dashboard" icon={Target}>
                    Dashboard
                  </NavLink>
                  <NavLink href="/tracker" icon={FileText}>
                    Tracker
                  </NavLink>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 mx-2" />

                {/* Resume Tools Group */}
                <div className="flex items-center gap-1 px-2">
                  <NavLink href="/generate" icon={Sparkles}>
                    Generate
                  </NavLink>
                  <NavLink href="/build-resume" icon={PenTool} activeColor="text-purple-600">
                    Build
                  </NavLink>
                  <NavLink href="/ats-checker" icon={Search}>
                    ATS Check
                  </NavLink>
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 mx-2" />

                {/* Career Tools Group */}
                <div className="flex items-center gap-1 px-2">
                  <NavLink href="/interview-prep" icon={Brain} activeColor="text-green-600">
                    Interview
                  </NavLink>
                  <NavLink href="/linkedin-optimizer" icon={Linkedin} activeColor="text-[#0077B5]">
                    LinkedIn
                  </NavLink>
                </div>
              </nav>

              {/* User Menu */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt="" 
                          className="w-9 h-9 rounded-full"
                        />
                      ) : (
                        getInitials(session.user?.name)
                      )}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                        {session.user?.name || "User"}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {session.user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/pricing"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          Subscription
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Public Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/templates">Templates</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/build-resume" icon={PenTool} activeColor="text-purple-600">
                  Build Resume
                </NavLink>
                <NavLink href="/ats-checker">ATS Checker</NavLink>
              </nav>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 dark:border-gray-800">
            <nav className="flex flex-col gap-2">
              {session ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getInitials(session.user?.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.email}</p>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Target className="w-5 h-5 text-gray-400" />
                    Dashboard
                  </Link>
                  <Link
                    href="/tracker"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    Tracker
                  </Link>
                  <Link
                    href="/generate"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Sparkles className="w-5 h-5 text-gray-400" />
                    Generate Resume
                  </Link>
                  <Link
                    href="/build-resume"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <PenTool className="w-5 h-5 text-purple-500" />
                    Build Resume
                  </Link>
                  <Link
                    href="/interview-prep"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Brain className="w-5 h-5 text-green-500" />
                    Interview Prep
                  </Link>
                  <Link
                    href="/linkedin-optimizer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Linkedin className="w-5 h-5 text-[#0077B5]" />
                    LinkedIn Optimizer
                  </Link>
                  <Link
                    href="/ats-checker"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Search className="w-5 h-5 text-gray-400" />
                    ATS Checker
                  </Link>

                  {/* Logout */}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Home
                  </Link>
                  <Link
                    href="/templates"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Templates
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/build-resume"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <PenTool className="w-4 h-4 text-purple-500" />
                    Build Resume
                  </Link>
                  <Link
                    href="/ats-checker"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    ATS Checker
                  </Link>
                  <div className="border-t border-gray-200 mt-2 pt-4 flex flex-col gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-center text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2 text-center text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
