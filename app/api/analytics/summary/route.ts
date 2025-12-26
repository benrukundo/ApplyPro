import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getAnalyticsSummary } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    // Optional: Add admin authentication
    const session = await getServerSession(authOptions);
    
    // You can add admin check here if needed
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const summary = await getAnalyticsSummary(days);

    return NextResponse.json(summary);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Analytics summary error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics summary' },
      { status: 500 }
    );
  }
}
