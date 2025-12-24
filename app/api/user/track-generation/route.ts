import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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
      orderBy: { createdAt: 'asc' }, // Use oldest first (FIFO for pay-per-use)
    });

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active subscription' },
        { status: 403 }
      );
    }

    // Priority: Use pay-per-use credits first (they expire/are limited)
    // Then fall back to recurring subscription
    const payPerUseWithCredits = subscriptions.find(
      s => s.plan === 'pay-per-use' && s.monthlyUsageCount < s.monthlyLimit
    );

    const recurringSubscription = subscriptions.find(
      s => (s.plan === 'monthly' || s.plan === 'yearly') && s.monthlyUsageCount < s.monthlyLimit
    );

    // Determine which subscription to deduct from
    // Use pay-per-use first if available, then recurring
    const subscriptionToUse = payPerUseWithCredits || recurringSubscription;

    if (!subscriptionToUse) {
      return NextResponse.json(
        { error: 'No available credits' },
        { status: 403 }
      );
    }

    // Increment usage
    const updated = await prisma.subscription.update({
      where: { id: subscriptionToUse.id },
      data: {
        monthlyUsageCount: { increment: 1 },
      },
    });

    // Calculate remaining across all subscriptions
    const remainingPayPerUse = subscriptions
      .filter(s => s.plan === 'pay-per-use')
      .reduce((total, s) => {
        if (s.id === subscriptionToUse.id) {
          return total + (s.monthlyLimit - s.monthlyUsageCount - 1);
        }
        return total + (s.monthlyLimit - s.monthlyUsageCount);
      }, 0);

    const remainingRecurring = recurringSubscription
      ? (subscriptionToUse.id === recurringSubscription.id
          ? recurringSubscription.monthlyLimit - recurringSubscription.monthlyUsageCount - 1
          : recurringSubscription.monthlyLimit - recurringSubscription.monthlyUsageCount)
      : 0;

    return NextResponse.json({
      success: true,
      deductedFrom: subscriptionToUse.plan,
      subscriptionId: subscriptionToUse.id,
      used: updated.monthlyUsageCount,
      limit: updated.monthlyLimit,
      remaining: updated.monthlyLimit - updated.monthlyUsageCount,
      totalRemaining: remainingPayPerUse + remainingRecurring,
    });

  } catch (error) {
    console.error('Track generation error:', error);
    return NextResponse.json(
      { error: 'Failed to track generation' },
      { status: 500 }
    );
  }
}
