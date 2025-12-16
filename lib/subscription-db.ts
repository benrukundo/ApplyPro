// Database-backed subscription management
// Replaces localStorage-based subscription.ts

import { prisma } from "./prisma";

// Fair use limits
const MONTHLY_GENERATION_LIMIT = 100;
const PAY_PER_USE_LIMIT = 3;
const COOLDOWN_PERIOD_MS = 30000; // 30 seconds
const DAILY_ALERT_THRESHOLD = 50;
const DAILY_SUSPEND_THRESHOLD = 150;

export interface SubscriptionInfo {
  plan: 'free' | 'monthly' | 'yearly' | 'pay-per-use' | null;
  status: 'active' | 'cancelled' | 'failed' | null;
  monthlyUsageCount: number;
  monthlyLimit: number;
  daysUntilReset: number;
  isActive: boolean;
  remainingGenerations?: number;
}

/**
 * Get user's subscription status from database
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo | null> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return {
        plan: 'free',
        status: null,
        monthlyUsageCount: 0,
        monthlyLimit: 0,
        daysUntilReset: 0,
        isActive: false,
      };
    }

    // Check if monthly reset needed
    const now = new Date();
    const lastReset = new Date(subscription.lastResetDate);
    let monthlyUsage = subscription.monthlyUsageCount;

    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      // Reset the counter
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { monthlyUsageCount: 0, lastResetDate: now },
      });
      monthlyUsage = 0;
    }

    // Calculate days until reset
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Determine limits based on plan
    let monthlyLimit = 0;
    let remainingGenerations: number | undefined;

    if (subscription.plan === 'monthly' || subscription.plan === 'yearly') {
      monthlyLimit = MONTHLY_GENERATION_LIMIT;
      remainingGenerations = Math.max(0, MONTHLY_GENERATION_LIMIT - monthlyUsage);
    } else if (subscription.plan === 'pay-per-use') {
      monthlyLimit = PAY_PER_USE_LIMIT;
      remainingGenerations = Math.max(0, PAY_PER_USE_LIMIT - monthlyUsage);
    }

    return {
      plan: subscription.plan as SubscriptionInfo['plan'],
      status: subscription.status as SubscriptionInfo['status'],
      monthlyUsageCount: monthlyUsage,
      monthlyLimit,
      daysUntilReset,
      isActive: subscription.status === 'active',
      remainingGenerations,
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Check if user can generate a resume
 */
export async function canUserGenerate(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  remainingGenerations?: number;
}> {
  try {
    // Get active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return {
        allowed: false,
        reason: 'No active subscription. Please purchase a plan to generate resumes.',
      };
    }

    // Check daily usage for abuse detection
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyUsage = await prisma.usageLog.count({
      where: {
        userId,
        generatedAt: { gte: today },
      },
    });

    if (dailyUsage >= DAILY_SUSPEND_THRESHOLD) {
      return {
        allowed: false,
        reason: `Unusual activity detected (${dailyUsage} resumes today). Please contact support@applypro.org.`,
      };
    }

    // Check cooldown (last generation time)
    const lastGeneration = await prisma.usageLog.findFirst({
      where: { userId },
      orderBy: { generatedAt: 'desc' },
    });

    if (lastGeneration) {
      const timeSinceLastGen = Date.now() - lastGeneration.generatedAt.getTime();
      if (timeSinceLastGen < COOLDOWN_PERIOD_MS) {
        const waitTime = Math.ceil((COOLDOWN_PERIOD_MS - timeSinceLastGen) / 1000);
        return {
          allowed: false,
          reason: `Please wait ${waitTime} seconds before generating another resume.`,
        };
      }
    }

    // Check monthly reset
    const now = new Date();
    const lastReset = new Date(subscription.lastResetDate);
    let monthlyUsage = subscription.monthlyUsageCount;

    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { monthlyUsageCount: 0, lastResetDate: now },
      });
      monthlyUsage = 0;
    }

    // Check limits based on plan
    if (subscription.plan === 'monthly' || subscription.plan === 'yearly') {
      if (monthlyUsage >= MONTHLY_GENERATION_LIMIT) {
        return {
          allowed: false,
          reason: `Monthly limit of ${MONTHLY_GENERATION_LIMIT} resumes reached. Resets on the 1st of next month.`,
        };
      }
      return {
        allowed: true,
        remainingGenerations: MONTHLY_GENERATION_LIMIT - monthlyUsage,
      };
    }

    if (subscription.plan === 'pay-per-use') {
      if (monthlyUsage >= PAY_PER_USE_LIMIT) {
        return {
          allowed: false,
          reason: 'All 3 resume credits used. Please purchase another pack or upgrade to Pro.',
        };
      }
      return {
        allowed: true,
        remainingGenerations: PAY_PER_USE_LIMIT - monthlyUsage,
      };
    }

    return {
      allowed: false,
      reason: 'Invalid subscription plan.',
    };
  } catch (error) {
    console.error('Error checking generation eligibility:', error);
    return {
      allowed: false,
      reason: 'Unable to verify subscription. Please try again.',
    };
  }
}

/**
 * Track a resume generation
 */
export async function trackGeneration(userId: string): Promise<boolean> {
  try {
    // Update subscription usage count
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { monthlyUsageCount: { increment: 1 } },
      });
    }

    // Log the generation
    await prisma.usageLog.create({
      data: {
        userId,
        generationCount: 1,
      },
    });

    return true;
  } catch (error) {
    console.error('Error tracking generation:', error);
    return false;
  }
}

/**
 * Create or update subscription from payment webhook
 */
export async function createSubscription(data: {
  userId: string;
  email: string;
  plan: 'monthly' | 'yearly' | 'pay-per-use';
  paymentId?: string;
}): Promise<boolean> {
  try {
    // Check for existing active subscription of same type
    const existing = await prisma.subscription.findFirst({
      where: {
        userId: data.userId,
        plan: data.plan,
        status: 'active',
      },
    });

    if (existing) {
      // For pay-per-use, create a new subscription (adds more credits)
      if (data.plan === 'pay-per-use') {
        await prisma.subscription.create({
          data: {
            userId: data.userId,
            email: data.email,
            plan: data.plan,
            status: 'active',
            gumroadId: data.paymentId,
            monthlyUsageCount: 0,
          },
        });
      } else {
        // For subscriptions, just update
        await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status: 'active',
            gumroadId: data.paymentId,
          },
        });
      }
    } else {
      // Create new subscription
      await prisma.subscription.create({
        data: {
          userId: data.userId,
          email: data.email,
          plan: data.plan,
          status: 'active',
          gumroadId: data.paymentId,
          monthlyUsageCount: 0,
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Error creating subscription:', error);
    return false;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(userId: string, plan?: string): Promise<boolean> {
  try {
    const whereClause: { userId: string; status: string; plan?: string } = {
      userId,
      status: 'active',
    };
    
    if (plan) {
      whereClause.plan = plan;
    }

    await prisma.subscription.updateMany({
      where: whereClause,
      data: { status: 'cancelled' },
    });

    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUsageStats(userId: string): Promise<{
  monthlyUsage: number;
  dailyUsage: number;
  totalAllTime: number;
  lastGeneration: Date | null;
}> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [dailyCount, totalCount, lastLog] = await Promise.all([
      prisma.usageLog.count({
        where: {
          userId,
          generatedAt: { gte: today },
        },
      }),
      prisma.usageLog.aggregate({
        where: { userId },
        _sum: { generationCount: true },
      }),
      prisma.usageLog.findFirst({
        where: { userId },
        orderBy: { generatedAt: 'desc' },
      }),
    ]);

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });

    return {
      monthlyUsage: subscription?.monthlyUsageCount || 0,
      dailyUsage: dailyCount,
      totalAllTime: totalCount._sum.generationCount || 0,
      lastGeneration: lastLog?.generatedAt || null,
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return {
      monthlyUsage: 0,
      dailyUsage: 0,
      totalAllTime: 0,
      lastGeneration: null,
    };
  }
}
