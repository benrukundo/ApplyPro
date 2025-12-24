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
        status: 'active',
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({
        canGenerate: false,
        reason: 'no_subscription',
        message: 'No active subscription found',
      });
    }

    // Check recurring subscription (monthly/yearly)
    const recurringSubscription = subscriptions.find(
      s => s.plan === 'monthly' || s.plan === 'yearly'
    );

    // Check pay-per-use packs with remaining credits
    const payPerUseWithCredits = subscriptions.find(
      s => s.plan === 'pay-per-use' && s.monthlyUsageCount < s.monthlyLimit
    );

    // Can generate if either has available credits
    if (recurringSubscription && recurringSubscription.monthlyUsageCount < recurringSubscription.monthlyLimit) {
      return NextResponse.json({
        canGenerate: true,
        subscription: recurringSubscription,
        source: 'recurring',
        used: recurringSubscription.monthlyUsageCount,
        limit: recurringSubscription.monthlyLimit,
        remaining: recurringSubscription.monthlyLimit - recurringSubscription.monthlyUsageCount,
      });
    }

    if (payPerUseWithCredits) {
      return NextResponse.json({
        canGenerate: true,
        subscription: payPerUseWithCredits,
        source: 'pay-per-use',
        used: payPerUseWithCredits.monthlyUsageCount,
        limit: payPerUseWithCredits.monthlyLimit,
        remaining: payPerUseWithCredits.monthlyLimit - payPerUseWithCredits.monthlyUsageCount,
      });
    }

    // Has subscriptions but all exhausted
    const hasRecurring = !!recurringSubscription;
    const exhaustedPayPerUse = subscriptions.filter(s => s.plan === 'pay-per-use');

    return NextResponse.json({
      canGenerate: false,
      reason: hasRecurring ? 'limit_reached' : 'credits_exhausted',
      message: hasRecurring
        ? 'Monthly limit reached. Resets at the start of your next billing cycle.'
        : 'All credits used. Purchase another pack or upgrade to Pro.',
      hasRecurringPlan: hasRecurring,
      recurringSubscription,
    });

  } catch (error) {
    console.error('Can generate check error:', error);
    return NextResponse.json(
      { error: 'Failed to check generation status' },
      { status: 500 }
    );
  }
}
