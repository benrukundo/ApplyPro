import { requireAdmin } from '@/lib/admin';
import AdminUsersManagement from './components/AdminUsersManagement';

export const metadata = {
  title: 'Admin Management | ApplyPro Admin',
  description: 'Manage administrator accounts',
};

export default async function AdminUsersPage() {
  await requireAdmin();
  return <AdminUsersManagement />;
}
