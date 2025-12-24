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
        paddleId: true,
        cancelledAt: true,
      },
    });

    // Separate subscriptions by type
    const recurringSubscription = subscriptions.find(
      s => s.plan === 'monthly' || s.plan === 'yearly'
    );

    const payPerUseSubscriptions = subscriptions.filter(
      s => s.plan === 'pay-per-use'
    );

    // Pay-per-use with remaining credits
    const payPerUseWithCredits = payPerUseSubscriptions.filter(
      s => s.monthlyUsageCount < s.monthlyLimit
    );

    // Calculate total available credits from pay-per-use packs
    const payPerUseCredits = payPerUseWithCredits.reduce(
      (total, sub) => total + (sub.monthlyLimit - sub.monthlyUsageCount),
      0
    );

    // Calculate recurring credits
    const recurringCredits = recurringSubscription
      ? recurringSubscription.monthlyLimit - recurringSubscription.monthlyUsageCount
      : 0;

    // IMPORTANT: For backward compatibility, return the RECURRING subscription as primary
    const primarySubscription = recurringSubscription || payPerUseWithCredits[0] || null;

    // Calculate totals
    const totalAvailable = recurringCredits + payPerUseCredits;
    const totalUsed = subscriptions.reduce((sum, s) => sum + s.monthlyUsageCount, 0);
    const totalLimit = subscriptions.reduce((sum, s) => sum + s.monthlyLimit, 0);

    // Calculate days until reset for recurring subscription
    let daysUntilReset = 0;
    if (recurringSubscription?.currentPeriodEnd) {
      const endDate = new Date(recurringSubscription.currentPeriodEnd);
      const now = new Date();
      daysUntilReset = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Build the subscription response with isActive for backward compatibility
    const subscriptionResponse = primarySubscription ? {
      ...primarySubscription,
      isActive: primarySubscription.status === 'active' || primarySubscription.status === 'past_due',
      daysUntilReset,
    } : null;

    return NextResponse.json({
      // PRIMARY subscription for backward compatibility (prefer recurring)
      subscription: subscriptionResponse,

      // Detailed breakdown
      recurringSubscription: recurringSubscription ? {
        ...recurringSubscription,
        isActive: recurringSubscription.status === 'active' || recurringSubscription.status === 'past_due',
        daysUntilReset,
      } : null,
      payPerUseCredits,
      payPerUseSubscriptions,
      payPerUseWithCredits,

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
