import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

const DODO_API_URL = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
  ? 'https://live.dodopayments.com'
  : 'https://test.dodopayments.com';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json(); // 'cancel' or 'resume'

    // Get user's active recurring subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
        plan: { in: ['monthly', 'yearly'] },
      },
    });

    if (!subscription?.paddleId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Call Dodo API to update subscription
    const dodoResponse = await fetch(
      `${DODO_API_URL}/subscriptions/${subscription.paddleId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        },
        body: JSON.stringify({
          cancel_at_next_billing_date: action === 'cancel',
        }),
      }
    );

    if (!dodoResponse.ok) {
      const errorData = await dodoResponse.json();
      console.error('Dodo API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    const dodoData = await dodoResponse.json();

    // Update local database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: action === 'cancel',
      },
    });

    return NextResponse.json({
      success: true,
      message: action === 'cancel'
        ? 'Auto-renewal cancelled. Your subscription will remain active until the end of your billing period.'
        : 'Auto-renewal resumed. Your subscription will continue automatically.',
      cancelAtPeriodEnd: action === 'cancel',
      currentPeriodEnd: dodoData.next_billing_date,
    });

  } catch (error) {
    console.error('Cancel renewal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
