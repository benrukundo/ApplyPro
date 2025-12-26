import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import AdminDashboard from './components/AdminDashboard';

export default async function AdminPage() {
  // This will redirect to /admin/login if not an admin
  const admin = await requireAdmin();
  
  return <AdminDashboard admin={admin} />;
}
