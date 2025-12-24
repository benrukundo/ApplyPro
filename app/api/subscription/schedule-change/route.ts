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

    const { newPlan, immediate = true } = await request.json();

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

    const isUpgrade = currentSubscription.plan === 'monthly' && newPlan === 'yearly';

    // For upgrades: use prorated_immediately (charges difference)
    // For downgrades: use difference_immediately (credits unused amount)
    const prorationMode = isUpgrade ? 'prorated_immediately' : 'difference_immediately';

    const requestBody = {
      product_id: newProductId,
      proration_billing_mode: prorationMode,
      quantity: 1,  // Required field
    };

    console.log('Changing plan:', {
      subscriptionId: currentSubscription.paddleId,
      from: currentSubscription.plan,
      to: newPlan,
      prorationMode,
      requestBody,
    });

    const response = await fetch(
      `${DODO_API_URL}/subscriptions/${currentSubscription.paddleId}/change-plan`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseText = await response.text();
    console.log('Dodo change plan response:', response.status, responseText);

    if (!response.ok) {
      console.error('Dodo change plan error:', response.status, responseText);

      let errorMessage = 'Failed to change plan';
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // Use default error
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const data = JSON.parse(responseText);

    // Update local database
    await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        plan: newPlan,
        monthlyLimit: 100, // Both plans have 100 limit
        // Current period end will be updated by webhook
      },
    });

    return NextResponse.json({
      success: true,
      message: isUpgrade
        ? `Successfully upgraded to ${newPlan}! You've been charged the prorated difference.`
        : `Successfully changed to ${newPlan}. Any unused credit will be applied to future charges.`,
      previousPlan: currentSubscription.plan,
      newPlan: newPlan,
      isUpgrade,
    });

  } catch (error) {
    console.error('Change plan error:', error);
    return NextResponse.json(
      { error: 'Failed to change plan' },
      { status: 500 }
    );
  }
}

// Preview what the plan change will cost
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const newPlan = searchParams.get('newPlan');

    if (!newPlan || !['monthly', 'yearly'].includes(newPlan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get current subscription
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

    const newProductId = newPlan === 'yearly'
      ? process.env.NEXT_PUBLIC_DODO_PRICE_YEARLY
      : process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY;

    // Call Dodo's Preview Plan Change API
    const response = await fetch(
      `${DODO_API_URL}/subscriptions/${currentSubscription.paddleId}/change-plan/preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
        },
        body: JSON.stringify({
          product_id: newProductId,
          proration_billing_mode: 'prorated_immediately',
        }),
      }
    );

    if (!response.ok) {
      // If preview fails, calculate manually
      const isUpgrade = currentSubscription.plan === 'monthly' && newPlan === 'yearly';
      const currentPrice = currentSubscription.plan === 'monthly' ? 19 : 149;
      const newPrice = newPlan === 'yearly' ? 149 : 19;

      // Simple calculation (Dodo will do exact proration)
      const daysRemaining = currentSubscription.currentPeriodEnd
        ? Math.ceil((new Date(currentSubscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 30;

      const totalDays = currentSubscription.plan === 'monthly' ? 30 : 365;
      const unusedValue = (currentPrice / totalDays) * daysRemaining;

      let estimatedCharge = 0;
      if (isUpgrade) {
        estimatedCharge = Math.max(0, newPrice - unusedValue);
      }

      return NextResponse.json({
        currentPlan: currentSubscription.plan,
        newPlan,
        isUpgrade,
        estimatedCharge: Math.round(estimatedCharge * 100) / 100,
        daysRemaining,
        note: 'Estimate only. Exact amount calculated at checkout.',
      });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Preview change error:', error);
    return NextResponse.json(
      { error: 'Failed to preview plan change' },
      { status: 500 }
    );
  }
}
