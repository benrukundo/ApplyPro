// Subscription management with rate limiting and fair use protection

export interface Subscription {
  email: string;
  plan: 'free' | 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  subscriptionId?: string;
  startDate: number;
  endDate?: number;
  cancelAtPeriodEnd?: boolean;
}

export interface UsageRecord {
  email: string;
  count: number;
  month: number;
  year: number;
  lastGeneration: number;
}

// Fair use limits
const MONTHLY_GENERATION_LIMIT = 100; // Pro users: 100 resumes per month
const COOLDOWN_PERIOD = 30000; // 30 seconds between generations
const DAILY_ALERT_THRESHOLD = 50; // Alert admin if user generates 50+ in one day
const DAILY_SUSPEND_THRESHOLD = 150; // Auto-suspend if 150+ in one day

const isBrowser = typeof window !== 'undefined';

// Check if user has active subscription
export function hasActiveSubscription(email: string): boolean {
  const sub = getSubscription(email);
  return sub.status === 'active' && (sub.plan === 'monthly' || sub.plan === 'yearly');
}

// Get user's subscription details
export function getSubscription(email: string): Subscription {
  if (!isBrowser) {
    return {
      email,
      plan: 'free',
      status: 'active',
      startDate: Date.now()
    };
  }

  try {
    const subs = JSON.parse(localStorage.getItem('subscriptions') || '{}');
    return subs[email] || {
      email,
      plan: 'free',
      status: 'active',
      startDate: Date.now()
    };
  } catch {
    return {
      email,
      plan: 'free',
      status: 'active',
      startDate: Date.now()
    };
  }
}

// Save subscription
export function saveSubscription(subscription: Subscription): void {
  if (!isBrowser) return;

  try {
    const subs = JSON.parse(localStorage.getItem('subscriptions') || '{}');
    subs[subscription.email] = subscription;
    localStorage.setItem('subscriptions', JSON.stringify(subs));
  } catch (error) {
    console.error('Error saving subscription:', error);
  }
}

// Get monthly usage
export function getMonthlyUsage(email: string): number {
  if (!isBrowser) return 0;

  try {
    const usageRecords = JSON.parse(localStorage.getItem('usage_records') || '{}');
    const record: UsageRecord = usageRecords[email];

    if (!record) return 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Reset if different month
    if (record.month !== currentMonth || record.year !== currentYear) {
      return 0;
    }

    return record.count;
  } catch {
    return 0;
  }
}

// Get daily usage (for abuse detection)
export function getDailyUsage(email: string): number {
  if (!isBrowser) return 0;

  try {
    const dailyRecords = JSON.parse(localStorage.getItem('daily_usage') || '{}');
    const today = new Date().toDateString();
    const key = `${email}_${today}`;
    return dailyRecords[key] || 0;
  } catch {
    return 0;
  }
}

// Track generation (call after successful resume generation)
export function trackGeneration(email: string): void {
  if (!isBrowser) return;

  try {
    // Update monthly usage
    const usageRecords = JSON.parse(localStorage.getItem('usage_records') || '{}');
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (!usageRecords[email] ||
      usageRecords[email].month !== currentMonth ||
      usageRecords[email].year !== currentYear) {
      usageRecords[email] = {
        email,
        count: 0,
        month: currentMonth,
        year: currentYear,
        lastGeneration: 0
      };
    }

    usageRecords[email].count++;
    usageRecords[email].lastGeneration = Date.now();
    localStorage.setItem('usage_records', JSON.stringify(usageRecords));

    // Update daily usage (for abuse detection)
    const dailyRecords = JSON.parse(localStorage.getItem('daily_usage') || '{}');
    const today = new Date().toDateString();
    const key = `${email}_${today}`;
    dailyRecords[key] = (dailyRecords[key] || 0) + 1;
    localStorage.setItem('daily_usage', JSON.stringify(dailyRecords));
  } catch (error) {
    console.error('Error tracking generation:', error);
  }
}

// Check cooldown period
export function checkCooldown(email: string): {
  allowed: boolean;
  waitTime?: number;
} {
  if (!isBrowser) return { allowed: true };

  try {
    const usageRecords = JSON.parse(localStorage.getItem('usage_records') || '{}');
    const record: UsageRecord = usageRecords[email];

    if (!record || !record.lastGeneration) {
      return { allowed: true };
    }

    const now = Date.now();
    const timeSinceLastGen = now - record.lastGeneration;

    if (timeSinceLastGen < COOLDOWN_PERIOD) {
      const waitTime = Math.ceil((COOLDOWN_PERIOD - timeSinceLastGen) / 1000);
      return {
        allowed: false,
        waitTime
      };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

// Check for abuse
export function checkForAbuse(email: string): {
  suspended: boolean;
  shouldAlert: boolean;
  dailyUsage: number;
} {
  const dailyUsage = getDailyUsage(email);

  return {
    suspended: dailyUsage >= DAILY_SUSPEND_THRESHOLD,
    shouldAlert: dailyUsage >= DAILY_ALERT_THRESHOLD,
    dailyUsage
  };
}

// Main function: Check if user can generate resume
export function canGenerateResume(email: string): {
  allowed: boolean;
  reason?: string;
  remainingGenerations?: number;
  waitTime?: number;
} {
  // Check for abuse/suspension first
  const abuseCheck = checkForAbuse(email);
  if (abuseCheck.suspended) {
    return {
      allowed: false,
      reason: `Unusual activity detected (${abuseCheck.dailyUsage} resumes today). Please contact support@applypro.org to restore access.`
    };
  }

  // Check cooldown period
  const cooldownCheck = checkCooldown(email);
  if (!cooldownCheck.allowed) {
    return {
      allowed: false,
      reason: `Please wait ${cooldownCheck.waitTime} seconds before generating another resume. This ensures optimal quality.`,
      waitTime: cooldownCheck.waitTime
    };
  }

  // Check subscription
  const sub = getSubscription(email);

  if (sub.plan === 'monthly' || sub.plan === 'yearly') {
    if (sub.status !== 'active') {
      return {
        allowed: false,
        reason: 'Your subscription has expired. Please renew to continue generating resumes.'
      };
    }

    // Check monthly fair use limit
    const monthlyUsage = getMonthlyUsage(email);

    if (monthlyUsage >= MONTHLY_GENERATION_LIMIT) {
      return {
        allowed: false,
        reason: `You've reached your fair use limit of ${MONTHLY_GENERATION_LIMIT} resumes this month. Your limit resets on the 1st of next month. Need more? Contact support@applypro.org for business plans with higher limits.`
      };
    }

    return {
      allowed: true,
      remainingGenerations: MONTHLY_GENERATION_LIMIT - monthlyUsage
    };
  }

  // Fall back to pay-per-use license check
  const licenses = JSON.parse(localStorage.getItem('used_licenses') || '{}');
  const emailLicenses = licenses[email] || [];

  // Check for valid licenses with remaining uses
  for (const license of emailLicenses) {
    if (license.uses < 3) {
      return {
        allowed: true,
        remainingGenerations: 3 - license.uses
      };
    }
  }

  return {
    allowed: false,
    reason: 'No resume generations remaining. Purchase more resumes or subscribe to Pro for unlimited access (fair use: 100/month).'
  };
}

// Get subscription display info
export function getSubscriptionInfo(email: string): {
  plan: string;
  displayName: string;
  features: string[];
  isUnlimited: boolean;
  monthlyLimit?: number;
  currentUsage?: number;
} {
  const sub = getSubscription(email);
  const monthlyUsage = getMonthlyUsage(email);

  if (sub.plan === 'monthly') {
    return {
      plan: 'monthly',
      displayName: 'Pro Monthly',
      features: [
        `${MONTHLY_GENERATION_LIMIT} resume generations per month`,
        'All 3 professional templates',
        'Unlimited job tracking',
        'Priority email support',
        'Early access to new features'
      ],
      isUnlimited: true,
      monthlyLimit: MONTHLY_GENERATION_LIMIT,
      currentUsage: monthlyUsage
    };
  }

  if (sub.plan === 'yearly') {
    return {
      plan: 'yearly',
      displayName: 'Pro Yearly',
      features: [
        `${MONTHLY_GENERATION_LIMIT} resume generations per month`,
        'All 3 professional templates',
        'Unlimited job tracking',
        'Priority email support',
        'Early access to new features',
        'Save 35% vs monthly ($149/year)'
      ],
      isUnlimited: true,
      monthlyLimit: MONTHLY_GENERATION_LIMIT,
      currentUsage: monthlyUsage
    };
  }

  return {
    plan: 'free',
    displayName: 'Free',
    features: [
      'Free ATS Checker',
      'Resume Score Dashboard',
      'Job Tracker (25 applications)'
    ],
    isUnlimited: false
  };
}

// Get usage statistics for display
export function getUsageStats(email: string): {
  monthlyUsage: number;
  monthlyLimit: number;
  dailyUsage: number;
  percentUsed: number;
  daysUntilReset: number;
} {
  const monthlyUsage = getMonthlyUsage(email);
  const dailyUsage = getDailyUsage(email);
  const sub = getSubscription(email);

  const isPro = sub.plan === 'monthly' || sub.plan === 'yearly';
  const limit = isPro ? MONTHLY_GENERATION_LIMIT : 0;

  // Calculate days until reset
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    monthlyUsage,
    monthlyLimit: limit,
    dailyUsage,
    percentUsed: limit > 0 ? Math.round((monthlyUsage / limit) * 100) : 0,
    daysUntilReset
  };
}
