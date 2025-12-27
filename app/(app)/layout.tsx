import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import AppNavigation from '@/app/components/AppNavigation';
import TopHeader from '@/app/components/TopHeader';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Header - Desktop Only */}
        <TopHeader />

        {/* Mobile header spacer */}
        <div className="lg:hidden h-14" />

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
