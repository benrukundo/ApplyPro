import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import PricingContent from './PricingContent';

export const metadata = {
  title: 'Upgrade Your Plan | ApplyPro',
  description: 'Choose a plan that works for you',
};

export default async function DashboardPricingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?callbackUrl=/dashboard/pricing');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Upgrade Your Plan</h1>
        <p className="mt-2 text-gray-600">Choose the perfect plan for your job search</p>
      </div>
      <PricingContent />
    </div>
  );
}
