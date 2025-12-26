import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import AppNavigation from '@/components/AppNavigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If not logged in, still render children (public pages)
  // The individual pages will handle their own auth
  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNavigation user={session.user} />
      <div className="lg:pl-72">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
