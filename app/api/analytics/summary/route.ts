import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminApi';
import { getAnalyticsSummary } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error } = await checkAdminAuth();

    if (!isAdmin) {
      return NextResponse.json(
        { error: error || 'Admin access required' },
        { status: 403 }
      );
    }

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
