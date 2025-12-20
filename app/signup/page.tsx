"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Target,
  TrendingUp,
  Bell,
  CheckCircle2,
  Mail,
  User,
  Lock,
  ArrowLeft,
  Sparkles,
  FileText,
  Zap,
} from "lucide-react";
import { trackEvent } from "@/components/PostHogProvider";

// Password strength calculator
function getPasswordStrength(password: string): { strength: 'weak' | 'medium' | 'strong'; score: number } {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 25;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 10;

  if (score < 40) return { strength: 'weak', score };
  if (score < 70) return { strength: 'medium', score };
  return { strength: 'strong', score };
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const passwordStrength = getPasswordStrength(formData.password);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError('Failed to sign in with Google. Please try again.');
      } else if (result?.ok) {
        router.push(result.url || '/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    trackEvent('signup_started', {
      has_name: !!formData.name.trim(),
      has_email: !!formData.email.trim(),
    });

    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!formData.password) {
      setError("Please enter a password");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);

    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        trackEvent('signup_failed', {
          error: registerData.error || 'Unknown error',
        });
        setError(registerData.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      trackEvent('signup_completed', {
        verified: registerData.verified || false,
        method: 'email',
      });

      if (registerData.verified) {
        setSuccessMessage(registerData.message);
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setSuccessMessage(registerData.message || "Please check your email to verify your account.");
        setSuccess(true);
      }
    } catch (err) {
      trackEvent('signup_error', {
        error: 'Network or unexpected error',
      });
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        trackEvent('verification_email_resent');
        setResendMessage("Verification email sent! Please check your inbox.");
      } else {
        setResendMessage(data.error || "Failed to resend email. Please try again.");
      }
    } catch (err) {
      setResendMessage("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.strength === "weak") return "bg-red-500";
    if (passwordStrength.strength === "medium") return "bg-amber-500";
    return "bg-green-500";
  };

  const getPasswordStrengthWidth = () => {
    return `${passwordStrength.score}%`;
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Decoration - Left side only */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full blur-3xl -translate-y-1/4 -translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      {/* Simple Header */}
      <header className="relative z-10 px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">ApplyPro</span>
        </Link>
      </header>

      <div className="relative z-10 flex min-h-[calc(100vh-72px)]">
        {/* Left Side - Form */}
        <div className="flex w-full items-center justify-center px-4 py-8 lg:w-1/2">
          <div className="w-full max-w-md">
            {/* Success State */}
            {success ? (
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Check Your Email
                </h1>
                <p className="text-gray-600 mb-6">
                  {successMessage}
                </p>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                  <p className="text-sm text-blue-800">
                    We sent a verification link to <strong>{formData.email}</strong>.
                    Click the link in the email to verify your account.
                  </p>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-3">
                    Didn't receive the email? Check your spam folder or
                  </p>
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResending ? "Sending..." : "Resend verification email"}
                  </button>
                  {resendMessage && (
                    <p className={`text-sm mt-2 ${resendMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}>
                      {resendMessage}
                    </p>
                  )}
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Create Your Account
                  </h1>
                  <p className="text-gray-600">
                    Start building professional resumes in minutes
                  </p>
                </div>

                {/* Google Sign Up Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full mb-6 px-6 py-3.5 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Signing up...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Sign up with Google</span>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">or sign up with email</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        placeholder="John Doe"
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        placeholder="john@example.com"
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        placeholder="Min. 8 characters"
                        disabled={isLoading || isGoogleLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">Password strength</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength.strength === "weak" ? "text-red-600" :
                            passwordStrength.strength === "medium" ? "text-amber-600" : "text-green-600"
                          }`}>
                            {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${getPasswordStrengthColor()}`}
                            style={{ width: getPasswordStrengthWidth() }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        placeholder="Confirm your password"
                        disabled={isLoading || isGoogleLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading || isGoogleLoading}
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isGoogleLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {/* Login Link */}
                <p className="mt-6 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            )}

            {/* Back to Home */}
            <div className="text-center mt-6">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-12 items-center justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-64 h-64 border border-white rounded-full" />
            <div className="absolute bottom-20 left-10 w-40 h-40 border border-white rounded-full" />
            <div className="absolute top-1/2 right-1/3 w-32 h-32 border border-white rounded-full" />
          </div>

          <div className="relative z-10 max-w-lg text-white">
            <h2 className="text-3xl font-bold mb-4">
              Build Your Career with ApplyPro
            </h2>
            <p className="text-lg text-blue-100 mb-10">
              Join thousands of job seekers who create professional resumes and land their dream jobs faster.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: FileText,
                  title: "AI-Powered Resume Builder",
                  desc: "Create ATS-optimized resumes tailored to any job in minutes.",
                },
                {
                  icon: Target,
                  title: "Track Your Applications",
                  desc: "Never lose track of where you applied. Organize everything in one place.",
                },
                {
                  icon: TrendingUp,
                  title: "Get Application Insights",
                  desc: "See your success rate and identify patterns that work.",
                },
                {
                  icon: Zap,
                  title: "Free to Start",
                  desc: "Try our ATS checker and job tracker completely free. No credit card needed.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-blue-100">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="mt-10 pt-8 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40" />
                  ))}
                </div>
                <p className="text-sm text-blue-100">
                  <span className="font-semibold text-white">1,000+</span> job seekers already using ApplyPro
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
