import { requireAdmin } from '@/lib/admin';
import AdminAnalytics from './components/AdminAnalytics';

export const metadata = {
  title: 'Analytics',
};

export default async function AdminAnalyticsPage() {
  const admin = await requireAdmin();
  
  return <AdminAnalytics admin={admin} />;
}
