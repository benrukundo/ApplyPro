'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import TemplatesContent from '@/app/(app)/dashboard/templates/TemplatesContent';

export default function PublicTemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect logged-in users to the app version with sidebar
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard/templates");
    }
  }, [status, session, router]);

  // Show loading state while checking auth or redirecting
  if (status === "loading" || (status === "authenticated" && session)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <TemplatesContent />;
}
