import { Metadata } from 'next';

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
      {children}
    </div>
  );
}
