import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

const DODO_API_URL = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
  ? 'https://api.dodopayments.com'
  : 'https://test.dodopayments.com';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription to find Dodo customer ID
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
    });

    if (!subscription?.paddleId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Create customer portal session
    const response = await fetch(`${DODO_API_URL}/customer-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      },
      body: JSON.stringify({
        customer_id: subscription.paddleId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      }),
    });

    if (!response.ok) {
      console.error('Failed to create portal session');
      return NextResponse.json({ error: 'Failed to create portal' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ portalUrl: data.url });

  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
