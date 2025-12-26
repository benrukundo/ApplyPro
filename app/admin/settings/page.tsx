import { requireAdmin } from '@/lib/admin';
import AdminSettings from './components/AdminSettings';

export const metadata = {
  title: 'Settings',
};

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  
  return <AdminSettings admin={admin} />;
}
