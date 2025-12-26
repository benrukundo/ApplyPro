import { requireAdmin } from '@/lib/admin';
import AdminAnalytics from './components/AdminAnalytics';

export const metadata = {
  title: 'Analytics | ApplyPro Admin',
  description: 'View analytics and performance metrics',
};

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  
  return <AdminAnalytics />;
}
