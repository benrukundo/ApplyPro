import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ALL active subscriptions for the user
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'past_due'] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        plan: true,
        status: true,
        monthlyUsageCount: true,
        monthlyLimit: true,
        currentPeriodEnd: true,
        createdAt: true,
      },
    });

    // Separate subscriptions by type
    const recurringSubscription = subscriptions.find(
      s => s.plan === 'monthly' || s.plan === 'yearly'
    );

    const payPerUseSubscriptions = subscriptions.filter(
      s => s.plan === 'pay-per-use' && s.monthlyUsageCount < s.monthlyLimit
    );

    // Calculate total available credits from pay-per-use packs
    const payPerUseCredits = payPerUseSubscriptions.reduce(
      (total, sub) => total + (sub.monthlyLimit - sub.monthlyUsageCount),
      0
    );

    // Determine the "active" subscription to show
    // Priority: Show recurring plan, but include pay-per-use info
    const primarySubscription = recurringSubscription || payPerUseSubscriptions[0] || null;

    // Calculate total available generations
    let totalAvailable = 0;
    let totalLimit = 0;
    let totalUsed = 0;

    if (recurringSubscription) {
      totalAvailable += recurringSubscription.monthlyLimit - recurringSubscription.monthlyUsageCount;
      totalLimit += recurringSubscription.monthlyLimit;
      totalUsed += recurringSubscription.monthlyUsageCount;
    }

    totalAvailable += payPerUseCredits;

    // Add pay-per-use to totals
    payPerUseSubscriptions.forEach(sub => {
      totalLimit += sub.monthlyLimit;
      totalUsed += sub.monthlyUsageCount;
    });

    return NextResponse.json({
      // Primary subscription for display
      subscription: primarySubscription,

      // Detailed breakdown
      recurringSubscription,
      payPerUseCredits,
      payPerUseSubscriptions,

      // Aggregated stats
      totalAvailable,
      totalLimit,
      totalUsed,

      // Quick checks
      hasRecurringPlan: !!recurringSubscription,
      hasPayPerUse: payPerUseCredits > 0,
      canGenerate: totalAvailable > 0,
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}
