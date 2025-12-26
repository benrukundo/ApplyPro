import { Metadata } from 'next';
import AdminNavigation from './components/AdminNavigation';

export const metadata: Metadata = {
  title: {
    default: 'Admin - ApplyPro',
    template: '%s | Admin - ApplyPro',
  },
  description: 'ApplyPro Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900">
      <AdminNavigation />
      <div className="lg:pl-72 pt-16">
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
