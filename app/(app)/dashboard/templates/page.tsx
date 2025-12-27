import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import TemplatesContent from './TemplatesContent';

export const metadata = {
  title: 'Resume Templates | ApplyPro',
  description: 'Browse professional resume templates',
};

export default async function DashboardTemplatesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?callbackUrl=/dashboard/templates');
  }

  return <TemplatesContent />;
}
