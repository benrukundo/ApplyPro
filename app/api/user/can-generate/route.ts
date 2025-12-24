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

    // Get all active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['active', 'past_due'] },
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        canGenerate: false,
        reason: 'no_subscription',
        message: 'No active subscription found',
        subscription: null,
      });
    }

    // Check recurring subscription (monthly/yearly) - prioritize this
    const recurringSubscription = subscriptions.find(
      s => (s.plan === 'monthly' || s.plan === 'yearly')
    );

    // Check pay-per-use packs with remaining credits
    const payPerUseWithCredits = subscriptions.filter(
      s => s.plan === 'pay-per-use' && s.monthlyUsageCount < s.monthlyLimit
    );

    const recurringHasCredits = recurringSubscription &&
      recurringSubscription.monthlyUsageCount < recurringSubscription.monthlyLimit;

    const payPerUseCreditsTotal = payPerUseWithCredits.reduce(
      (total, s) => total + (s.monthlyLimit - s.monthlyUsageCount),
      0
    );

    // Can generate if recurring has available credits
    if (recurringHasCredits) {
      return NextResponse.json({
        canGenerate: true,
        subscription: {
          ...recurringSubscription,
          isActive: true,
        },
        source: 'recurring',
        plan: recurringSubscription.plan,
        used: recurringSubscription.monthlyUsageCount,
        limit: recurringSubscription.monthlyLimit,
        remaining: recurringSubscription.monthlyLimit - recurringSubscription.monthlyUsageCount,
        totalRemaining: (recurringSubscription.monthlyLimit - recurringSubscription.monthlyUsageCount) + payPerUseCreditsTotal,
      });
    }

    // Can generate if pay-per-use has credits
    if (payPerUseCreditsTotal > 0) {
      const activePack = payPerUseWithCredits[0];
      return NextResponse.json({
        canGenerate: true,
        subscription: {
          ...activePack,
          isActive: true,
        },
        source: 'pay-per-use',
        plan: 'pay-per-use',
        used: activePack.monthlyUsageCount,
        limit: activePack.monthlyLimit,
        remaining: activePack.monthlyLimit - activePack.monthlyUsageCount,
        totalRemaining: payPerUseCreditsTotal,
        hasRecurringPlan: !!recurringSubscription,
        recurringSubscription: recurringSubscription ? {
          ...recurringSubscription,
          isActive: true,
        } : null,
      });
    }

    // Has recurring but exhausted
    if (recurringSubscription) {
      return NextResponse.json({
        canGenerate: false,
        reason: 'limit_reached',
        message: 'Monthly limit reached. Resets at the start of your next billing cycle.',
        subscription: {
          ...recurringSubscription,
          isActive: true,
        },
        hasRecurringPlan: true,
      });
    }

    // Has pay-per-use but all exhausted
    return NextResponse.json({
      canGenerate: false,
      reason: 'credits_exhausted',
      message: 'All credits used. Purchase another pack or upgrade to Pro.',
      subscription: subscriptions[0] ? {
        ...subscriptions[0],
        isActive: true,
      } : null,
      hasRecurringPlan: false,
    });

  } catch (error) {
    console.error('Can generate check error:', error);
    return NextResponse.json(
      { error: 'Failed to check generation status' },
      { status: 500 }
    );
  }
}
