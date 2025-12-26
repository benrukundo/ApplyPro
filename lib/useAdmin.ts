'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
}

interface UseAdminResult {
  isAdmin: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  error: string | null;
}

export function useAdmin(redirectIfNotAdmin = false): UseAdminResult {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      // Wait for session to load
      if (status === 'loading') return;

      // If no session, not an admin
      if (!session?.user) {
        setIsAdmin(false);
        setIsLoading(false);
        if (redirectIfNotAdmin) {
          router.push('/admin/login');
        }
        return;
      }

      try {
        const response = await fetch('/api/admin/auth/check');
        const data = await response.json();

        if (data.isAdmin) {
          setIsAdmin(true);
          setUser(data.user);
        } else {
          setIsAdmin(false);
          setError(data.error || 'Not an admin');
          if (redirectIfNotAdmin) {
            router.push('/admin/login');
          }
        }
      } catch (err) {
        setError('Failed to verify admin status');
        setIsAdmin(false);
        if (redirectIfNotAdmin) {
          router.push('/admin/login');
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAdmin();
  }, [session, status, redirectIfNotAdmin, router]);

  return { isAdmin, isLoading, user, error };
}
