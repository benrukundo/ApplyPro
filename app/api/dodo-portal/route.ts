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

    // Get user's subscription with customer ID
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'cancelled', 'past_due'] },
        customerId: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription?.customerId) {
      console.log('No customer ID found for user:', session.user.id);
      return NextResponse.json(
        { error: 'No billing account found. Please contact support.' },
        { status: 404 }
      );
    }

    console.log('Creating portal session for customer:', subscription.customerId);

    // Create customer portal session
    const response = await fetch(
      `${DODO_API_URL}/customers/${subscription.customerId}/customer-portal/session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        },
        body: JSON.stringify({}),
      }
    );

    const responseText = await response.text();
    console.log('Dodo portal response:', response.status, responseText);

    if (!response.ok) {
      console.error('Failed to create portal session:', response.status, responseText);
      return NextResponse.json(
        { error: 'Unable to access billing portal. Please try again.' },
        { status: 500 }
      );
    }

    const data = JSON.parse(responseText);

    if (!data.link) {
      return NextResponse.json(
        { error: 'No portal link returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({ portalUrl: data.link });

  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
