"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import SearchCommand from './SearchCommand';
import {
  Menu,
  X,
  LogOut,
  PenTool,
  Brain,
  Linkedin,
  ChevronDown,
  User,
  CreditCard,
  FileText,
  Target,
  Search,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";

interface SubscriptionInfo {
  plan: string | null;
  status: string;
  isActive?: boolean;
  monthlyUsageCount?: number;
  monthlyLimit?: number;
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  // Load subscription status
  useEffect(() => {
    const loadSubscription = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user/subscription');
          const data = await response.json();
          if (response.ok && data.subscription) {
            setSubscription({
              ...data.subscription,
              isActive: data.subscription.status === 'active',
            });
          }
        } catch (err) {
          console.error('Error loading subscription:', err);
        }
      }
    };
    loadSubscription();
  }, [session?.user]);

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

  // Don't show navbar on login/signup pages or authenticated app pages (they use sidebar navigation)
  const appRoutes = [
    '/dashboard',
    '/generate',
    '/tracker',
    '/build-resume',
    '/ats-checker',
    '/interview-prep',
    '/linkedin-optimizer',
    '/settings',
    '/billing',
  ];
  
  const isAppRoute = appRoutes.some(route => pathname?.startsWith(route));
  const isAdminRoute = pathname?.startsWith('/admin');
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  
  // Don't render navbar on app, admin, or auth routes
  if (isAppRoute || isAdminRoute || isAuthRoute) {
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

  // Check if user has active subscription
  const hasActiveSubscription = subscription?.isActive === true && 
    (subscription?.plan === 'monthly' || subscription?.plan === 'yearly');

  // Get plan display name
  const getPlanBadge = () => {
    if (!subscription?.isActive) return { text: 'Free', color: 'bg-gray-100 text-gray-700' };
    switch (subscription.plan) {
      case 'monthly': return { text: 'Pro Monthly', color: 'bg-blue-100 text-blue-700' };
      case 'yearly': return { text: 'Pro Yearly', color: 'bg-purple-100 text-purple-700' };
      case 'pay-per-use': return { text: 'Pack', color: 'bg-amber-100 text-amber-700' };
      default: return { text: 'Free', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const planBadge = getPlanBadge();

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
            ? `${activeColor} bg-gray-100`
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center gap-2 text-xl font-bold text-gray-900"
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
                  <NavLink href="/resume-examples" icon={FileText}>
                    Examples
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
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {session.user?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${planBadge.color}`}>
                            {planBadge.text}
                          </span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {/* Dashboard Link */}
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          Dashboard
                        </Link>

                        {/* Subscription & Billing Link - ALWAYS links to /dashboard/subscription */}
                        <Link
                          href="/dashboard/subscription"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span>Subscription & Billing</span>
                          </div>
                          {hasActiveSubscription && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Active
                            </span>
                          )}
                        </Link>

                        {/* Upgrade prompt for free users */}
                        {!hasActiveSubscription && (
                          <Link
                            href="/pricing"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 mx-3 my-2 px-3 py-2.5 text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-lg border border-blue-100 hover:from-blue-100 hover:to-purple-100"
                          >
                            <Zap className="w-4 h-4" />
                            <span className="font-medium">Upgrade to Pro</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
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
                <NavLink href="/resume-examples" icon={FileText}>
                  Examples
                </NavLink>
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
            className="lg:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100"
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
          <div className="lg:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-2">
              {session ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center justify-between px-3 py-3 mb-2 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {session.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt="" 
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          getInitials(session.user?.name)
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{session.user?.name}</p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${planBadge.color}`}>
                      {planBadge.text}
                    </span>
                  </div>

                  {/* Subscription & Billing Link - Mobile */}
                  <Link
                    href="/dashboard/subscription"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <span>Subscription & Billing</span>
                    </div>
                    {hasActiveSubscription && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </Link>

                  {/* Upgrade prompt for free users - Mobile */}
                  {!hasActiveSubscription && (
                    <Link
                      href="/pricing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 mx-1 my-2 px-3 py-2.5 text-sm bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-lg border border-blue-100"
                    >
                      <Zap className="w-5 h-5" />
                      <span className="font-medium">Upgrade to Pro</span>
                    </Link>
                  )}

                  <div className="h-px bg-gray-200 my-2" />

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
                    <Sparkles className="w-5 h-5 text-blue-500" />
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
                    href="/resume-examples"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    Resume Examples
                  </Link>
                  <Link
                    href="/ats-checker"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <Search className="w-5 h-5 text-gray-400" />
                    ATS Checker
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
                    href="/resume-examples"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Resume Examples
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
