"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowLeft,
  PartyPopper,
  AlertCircle,
  Loader2,
} from "lucide-react";

export const dynamic = 'force-dynamic';

function SuccessPageContent() {
  const { data: session } = useSession();
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [licenseKey, setLicenseKey] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string>("");
  const [remainingUses, setRemainingUses] = useState<number | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);

  // Check for active subscription - skip license key for subscribers
  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.user?.id) {
        setIsLoadingSubscription(false);
        return;
      }

      try {
        const response = await fetch('/api/user/subscription');
        const data = await response.json();

        if (response.ok && data.subscription?.isActive) {
          // User has active subscription - skip license key verification
          setPaymentVerified(true);
          setRemainingUses(data.subscription?.monthlyLimit - data.subscription?.monthlyUsageCount || 0);
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    checkSubscription();
  }, [session?.user?.id]);

  // Handle license key verification
  const handleVerifyLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationError("");

    if (!licenseKey.trim()) {
      setVerificationError("Please enter a license key");
      setIsVerifying(false);
      return;
    }

    try {
      // Verify license with our API (which calls Gumroad)
      const response = await fetch("/api/verify-license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ licenseKey: licenseKey.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setVerificationError(data.error || "Invalid license key");
        setIsVerifying(false);
        return;
      }

      // License is valid
      setPaymentVerified(true);
      setRemainingUses(data.remaining || 0);
      setIsVerifying(false);
    } catch (err) {
      console.error("Error verifying license:", err);
      setVerificationError("Failed to verify license. Please try again.");
      setIsVerifying(false);
    }
  };

  if (isLoadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href="/generate"
          className="mb-8 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Generate
        </Link>

        {paymentVerified ? (
          <>
            {/* Success Message */}
            <div className="mb-8 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <PartyPopper className="h-10 w-10 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h1 className="text-3xl font-bold text-green-900 mb-2">
                    Payment Successful! 🎉
                  </h1>
                  <p className="text-lg text-green-700 mb-4">
                    Thank you for your purchase. Your subscription is now active and ready to use.
                  </p>
                  {remainingUses !== null && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-800 shadow-sm">
                      <CheckCircle2 className="h-5 w-5" />
                      {remainingUses > 0 ? (
                        <span>
                          You have <strong>{remainingUses}</strong> resume generation{remainingUses !== 1 ? "s" : ""} remaining
                        </span>
                      ) : (
                        <span>Ready to generate resumes</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Create Your Tailored Resume?
              </h2>
              <p className="text-gray-600 mb-6">
                Head back to the generate page to upload your resume and get started with your first tailored resume.
              </p>
              <Link
                href="/generate"
                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Generate Page
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* License Key Verification */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Enter Your License Key
              </h1>
              <p className="text-gray-600 mb-8">
                If you purchased a license key, enter it below to unlock resume generation
              </p>

              <form onSubmit={handleVerifyLicense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Key
                  </label>
                  <input
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="Enter your license key..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {verificationError && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 text-sm">{verificationError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify License"
                  )}
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Don't have a license key?{' '}
                  <Link href="/pricing" className="text-blue-600 hover:text-blue-700 font-semibold">
                    View pricing plans
                  </Link>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <SuccessPageContent />;
}
