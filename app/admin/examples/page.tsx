import { requireAdmin } from '@/lib/admin';
import AdminExamplesManagement from './components/AdminExamplesManagement';

export const metadata = {
  title: 'Resume Examples | ApplyPro Admin',
  description: 'Manage resume examples across all industries',
};

export default async function AdminExamplesPage() {
  await requireAdmin();
  
  return <AdminExamplesManagement />;
}
