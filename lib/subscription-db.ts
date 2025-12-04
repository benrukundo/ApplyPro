import { prisma } from "./prisma";

export interface SubscriptionInfo {
  plan: "free" | "monthly" | "yearly" | "pay-per-use" | null;
  status: "active" | "cancelled" | "failed" | null;
  monthlyUsageCount: number;
  monthlyLimit: number;
  daysUntilReset: number;
  isActive: boolean;
}

/**
 * Get user subscription from database
 */
export async function getUserSubscription(
  userId: string
): Promise<SubscriptionInfo> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: userId,
      status: "active",
    },
  });

  if (!subscription) {
    return {
      plan: null,
      status: null,
      monthlyUsageCount: 0,
      monthlyLimit: 0,
      daysUntilReset: 0,
      isActive: false,
    };
  }

  // Calculate days until reset (for monthly subscriptions)
  const now = new Date();
  const lastReset = new Date(subscription.lastResetDate);
  const nextReset = new Date(lastReset);
  nextReset.setMonth(nextReset.getMonth() + 1);
  const daysUntilReset = Math.ceil(
    (nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determine monthly limit
  let monthlyLimit = 0;
  if (subscription.plan === "monthly" || subscription.plan === "yearly") {
    monthlyLimit = 100;
  }

  // Check if month has passed and reset if needed
  if (now > nextReset) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        monthlyUsageCount: 0,
        lastResetDate: new Date(),
      },
    });
    return {
      plan: subscription.plan as any,
      status: subscription.status as any,
      monthlyUsageCount: 0,
      monthlyLimit,
      daysUntilReset: 30,
      isActive: true,
    };
  }

  return {
    plan: subscription.plan as any,
    status: subscription.status as any,
    monthlyUsageCount: subscription.monthlyUsageCount,
    monthlyLimit,
    daysUntilReset,
    isActive: subscription.status === "active",
  };
}

/**
 * Get subscription by email (for webhook matching)
 */
export async function getSubscriptionByEmail(email: string) {
  return await prisma.subscription.findFirst({
    where: { email: email },
    include: { user: true },
  });
}

/**
 * Create or update subscription (called from webhook)
 */
export async function createOrUpdateSubscription(
  email: string,
  plan: "monthly" | "yearly" | "pay-per-use",
  gumroadId: string
) {
  // First, try to find existing user by email
  let user = await prisma.user.findUnique({
    where: { email: email },
  });

  // If user doesn't exist, create one
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email,
        name: email.split("@")[0], // Use part of email as name
      },
    });
  }

  // Create or update subscription
  const subscription = await prisma.subscription.upsert({
    where: {
      userId_plan: {
        userId: user.id,
        plan: plan,
      },
    },
    create: {
      userId: user.id,
      email: email,
      plan: plan,
      status: "active",
      gumroadId: gumroadId,
      monthlyUsageCount: 0,
      lastResetDate: new Date(),
    },
    update: {
      status: "active",
      gumroadId: gumroadId,
      updatedAt: new Date(),
    },
  });

  return subscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(gumroadId: string) {
  return await prisma.subscription.updateMany({
    where: { gumroadId: gumroadId },
    data: { status: "cancelled" },
  });
}

/**
 * Mark subscription payment as failed
 */
export async function markPaymentFailed(gumroadId: string) {
  return await prisma.subscription.updateMany({
    where: { gumroadId: gumroadId },
    data: { status: "failed" },
  });
}

/**
 * Track resume generation and increment usage
 */
export async function trackGeneration(userId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: userId,
      status: "active",
    },
  });

  if (!subscription) {
    throw new Error("No active subscription found");
  }

  // Check if month has passed
  const now = new Date();
  const lastReset = new Date(subscription.lastResetDate);
  const nextReset = new Date(lastReset);
  nextReset.setMonth(nextReset.getMonth() + 1);

  let usageCount = subscription.monthlyUsageCount + 1;
  let lastResetDate = subscription.lastResetDate;

  if (now > nextReset) {
    usageCount = 1;
    lastResetDate = new Date();
  }

  // Update subscription
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      monthlyUsageCount: usageCount,
      lastResetDate: lastResetDate,
    },
  });

  // Log usage
  await prisma.usageLog.create({
    data: {
      userId: userId,
      generationCount: 1,
      generatedAt: new Date(),
    },
  });
}

/**
 * Check if user can generate resume
 */
export async function canGenerateResume(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  subscriptionInfo?: SubscriptionInfo;
}> {
  const subscriptionInfo = await getUserSubscription(userId);

  if (!subscriptionInfo.isActive) {
    return {
      allowed: false,
      reason: "No active subscription. Please subscribe to generate resumes.",
    };
  }

  // Check if user has exceeded monthly limit
  if (
    subscriptionInfo.monthlyLimit > 0 &&
    subscriptionInfo.monthlyUsageCount >= subscriptionInfo.monthlyLimit
  ) {
    return {
      allowed: false,
      reason: `Monthly limit reached (${subscriptionInfo.monthlyUsageCount}/${subscriptionInfo.monthlyLimit}). Your limit resets in ${subscriptionInfo.daysUntilReset} days.`,
      subscriptionInfo,
    };
  }

  return {
    allowed: true,
    subscriptionInfo,
  };
}
