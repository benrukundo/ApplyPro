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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { newPlan } = await request.json();

    if (!newPlan || !['monthly', 'yearly'].includes(newPlan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get current active subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
        plan: { in: ['monthly', 'yearly'] },
      },
    });

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (currentSubscription.plan === newPlan) {
      return NextResponse.json(
        { error: 'You are already on this plan' },
        { status: 400 }
      );
    }

    // Get the new product ID
    const newProductId = newPlan === 'yearly'
      ? process.env.NEXT_PUBLIC_DODO_PRICE_YEARLY
      : process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY;

    if (!newProductId) {
      return NextResponse.json(
        { error: 'Product configuration error' },
        { status: 500 }
      );
    }

    // Call Dodo's Change Plan API
    // This schedules the change for the next billing cycle
    const response = await fetch(
      `${DODO_API_URL}/subscriptions/${currentSubscription.paddleId}/change-plan`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        },
        body: JSON.stringify({
          product_id: newProductId,
          proration_billing_mode: 'next_billing_cycle', // Change happens at renewal
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dodo change plan error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to schedule plan change' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Update local database to track the scheduled change
    await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        scheduledPlanChange: newPlan,
        scheduledChangeDate: currentSubscription.currentPeriodEnd,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Your plan will change to ${newPlan} on ${currentSubscription.currentPeriodEnd?.toLocaleDateString()}`,
      currentPlan: currentSubscription.plan,
      newPlan: newPlan,
      effectiveDate: currentSubscription.currentPeriodEnd,
    });

  } catch (error) {
    console.error('Schedule change error:', error);
    return NextResponse.json(
      { error: 'Failed to schedule plan change' },
      { status: 500 }
    );
  }
}

// Cancel a scheduled plan change
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
        scheduledPlanChange: { not: null },
      },
    });

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No scheduled plan change found' },
        { status: 404 }
      );
    }

    // Call Dodo to cancel the scheduled change
    const response = await fetch(
      `${DODO_API_URL}/subscriptions/${currentSubscription.paddleId}/change-plan`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to cancel scheduled change in Dodo');
    }

    // Clear local scheduled change
    await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        scheduledPlanChange: null,
        scheduledChangeDate: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Scheduled plan change cancelled',
    });

  } catch (error) {
    console.error('Cancel scheduled change error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel scheduled change' },
      { status: 500 }
    );
  }
}
