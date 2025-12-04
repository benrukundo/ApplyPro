# ApplyPro Subscription System Setup Guide

## Overview

This document explains the complete subscription system implementation with rate limiting, fair use policies, and monetization via Gumroad.

## Architecture

### Three-Tier Pricing Model

1. **Free Plan** - $0
   - Free ATS Resume Checker
   - Resume Score Dashboard
   - Job Application Tracker (up to 25 apps)
   - No resume generation

2. **Pay-Per-Use** - $4.99 per 3 resumes
   - 3 AI-tailored resume generations
   - All 3 professional templates
   - PDF & DOCX downloads
   - ATS optimization included
   - No subscription required
   - Credits never expire

3. **Pro Monthly** - $19.99/month
   - 100 AI-tailored resumes per month (fair use)
   - All 3 professional templates
   - Unlimited job tracking
   - Priority email support
   - Early access to new features
   - Cancel anytime

4. **Pro Yearly** - $199/year (17% savings)
   - Same as Pro Monthly
   - Billed annually
   - Most popular option

### Rate Limiting & Fair Use

```
Cooldown Period: 30 seconds between generations
Monthly Limit (Pro): 100 resumes/month
Daily Alert Threshold: 50+ resumes in 24 hours
Daily Suspend Threshold: 150+ resumes in 24 hours
```

## File Structure

### New Files Created

```
lib/subscription.ts (320 lines)
├─ Subscription interface (email, plan, status, dates)
├─ UsageRecord interface (monthly tracking)
├─ Rate limiting functions
│  ├─ checkCooldown() - 30-second cooldown enforcement
│  ├─ checkForAbuse() - Detect 150+ resumes/day
│  └─ canGenerateResume() - Main permission function
├─ Usage tracking
│  ├─ trackGeneration() - Record after successful generation
│  ├─ getMonthlyUsage() - Current month's count
│  └─ getDailyUsage() - Today's count
└─ Display functions
   ├─ getSubscriptionInfo() - Plan details
   └─ getUsageStats() - Dashboard statistics

app/pricing/page.tsx (380 lines)
├─ Pricing cards (Free, Pay-Per-Use, Pro)
├─ Feature comparison table
├─ Fair use policy explanation
└─ 6 FAQ items

app/api/gumroad-subscription-webhook/route.ts (150 lines)
├─ Handle subscription_started
├─ Handle subscription_ended
├─ Handle subscription_payment_failed
└─ Send transactional emails via Resend

.env.example
└─ Configuration template
```

## Setup Instructions

### Step 1: Create Gumroad Products

1. Go to [gumroad.com](https://gumroad.com)
2. Create three products:

#### Product A: Pay-Per-Use
- Name: "3 Resume Generations"
- Price: $4.99
- Type: One-time purchase
- Save the Product ID

#### Product B: Pro Monthly Subscription
- Name: "ApplyPro Pro - Monthly"
- Price: $19.99
- Type: Subscription
- Billing: Monthly
- Save the Product ID

#### Product C: Pro Yearly Subscription
- Name: "ApplyPro Pro - Yearly"
- Price: $199
- Type: Subscription
- Billing: Yearly
- Save the Product ID

### Step 2: Configure Environment Variables

Update `.env.local`:

```bash
# Gumroad Product IDs
NEXT_PUBLIC_GUMROAD_PRODUCT_ID=pay_per_use_product_id
NEXT_PUBLIC_GUMROAD_MONTHLY_PRODUCT_ID=monthly_subscription_id
NEXT_PUBLIC_GUMROAD_YEARLY_PRODUCT_ID=yearly_subscription_id
GUMROAD_YEARLY_PRODUCT_ID=yearly_subscription_id

# Resend Email API
RESEND_API_KEY=re_your_resend_api_key_here
```

### Step 3: Configure Gumroad Webhooks

1. In Gumroad dashboard, go to Settings → Webhooks
2. Add webhook endpoint: `https://applypro.org/api/gumroad-subscription-webhook`
3. Enable events:
   - sale
   - subscription_started
   - subscription_restarted
   - subscription_ended
   - subscription_cancelled
   - subscription_payment_failed

### Step 4: Set Up Resend Email Service

1. Go to [resend.com](https://resend.com)
2. Create account and verify domain
3. Generate API key
4. Add to `.env.local` as `RESEND_API_KEY`
5. Verify sender email: `noreply@send.applypro.org`

### Step 5: Deploy Environment Variables to Vercel

1. Go to Vercel dashboard
2. Select ApplyPro project
3. Settings → Environment Variables
4. Add:
   - `NEXT_PUBLIC_GUMROAD_PRODUCT_ID`
   - `NEXT_PUBLIC_GUMROAD_MONTHLY_PRODUCT_ID`
   - `NEXT_PUBLIC_GUMROAD_YEARLY_PRODUCT_ID`
   - `GUMROAD_YEARLY_PRODUCT_ID`
   - `RESEND_API_KEY`
5. Deploy

## Integration with Generate Page

To enable rate limiting on the `/generate` page, update `app/generate/page.tsx`:

```typescript
'use client';
import { getCurrentUser } from '@/lib/auth';
import { canGenerateResume, hasActiveSubscription, getUsageStats, trackGeneration } from '@/lib/subscription';

export default function GeneratePage() {
  const user = getCurrentUser();

  // Check if user can generate
  const check = canGenerateResume(user.email);

  if (!check.allowed) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Generation Blocked</h2>
        <p>{check.reason}</p>
        {check.waitTime && <p>Please wait {check.waitTime} seconds</p>}
        <a href="/pricing" className="text-blue-600">Upgrade to Pro →</a>
      </div>
    );
  }

  // After successful generation:
  const handleGenerateSuccess = async () => {
    // ... your generation logic ...

    // Track the generation
    trackGeneration(user.email);

    // ... rest of success handling ...
  };

  // Show usage stats for Pro users
  if (hasActiveSubscription(user.email)) {
    const stats = getUsageStats(user.email);
    return (
      <div>
        <div className="bg-blue-50 p-4 mb-6">
          <p>Pro: {stats.monthlyUsage}/{stats.monthlyLimit} resumes used</p>
          <p>Resets in {stats.daysUntilReset} days</p>
        </div>
        {/* Rest of generate page */}
      </div>
    );
  }

  return (/* Default generate page */);
}
```

## Integration with Dashboard

Add subscription info card to `app/dashboard/page.tsx`:

```typescript
import { getSubscription, getUsageStats } from '@/lib/subscription';
import { getCurrentUser } from '@/lib/auth';

const user = getCurrentUser();
const subscription = getSubscription(user.email);
const usageStats = getUsageStats(user.email);

// Add to dashboard grid:
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="font-bold text-lg mb-4">Your Plan</h3>

  {subscription.plan === 'free' ? (
    <>
      <p className="text-2xl font-bold text-gray-900 mb-4">Free</p>
      <a href="/pricing" className="bg-blue-600 text-white px-4 py-2 rounded">
        Upgrade to Pro
      </a>
    </>
  ) : (
    <>
      <p className="text-2xl font-bold text-blue-600 mb-4">
        {subscription.plan === 'monthly' ? 'Pro Monthly' : 'Pro Yearly'}
      </p>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Usage This Month</span>
          <span>{usageStats.monthlyUsage} / {usageStats.monthlyLimit}</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${usageStats.percentUsed}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Resets in {usageStats.daysUntilReset} days
        </p>
      </div>

      <a
        href="https://gumroad.com/library"
        target="_blank"
        className="text-blue-600 text-sm font-semibold"
      >
        Manage Subscription →
      </a>
    </>
  )}
</div>
```

## Testing the System

### Local Testing

1. **Test Free Plan:**
   ```bash
   localStorage.setItem('subscriptions', JSON.stringify({
     'test@example.com': {
       email: 'test@example.com',
       plan: 'free',
       status: 'active',
       startDate: Date.now()
     }
   }))
   ```

2. **Test Pro Plan:**
   ```bash
   localStorage.setItem('subscriptions', JSON.stringify({
     'pro@example.com': {
       email: 'pro@example.com',
       plan: 'monthly',
       status: 'active',
       startDate: Date.now()
     }
   }))
   ```

3. **Test Rate Limiting:**
   ```bash
   // Simulate multiple generations
   for (let i = 0; i < 5; i++) {
     trackGeneration('test@example.com');
   }

   // Check usage
   getMonthlyUsage('test@example.com'); // → 5
   getDailyUsage('test@example.com'); // → 5
   ```

4. **Test Cooldown:**
   ```bash
   trackGeneration('test@example.com');
   canGenerateResume('test@example.com');
   // → { allowed: false, reason: "Please wait 30 seconds", waitTime: 30 }
   ```

### Production Testing

1. Create test Gumroad products
2. Subscribe using test email
3. Verify webhook hits the endpoint
4. Verify email is received
5. Test generation with subscribed account
6. Verify usage tracking works

## Monitoring & Analytics

### Key Metrics to Track

```
- Daily active users
- Free vs Pro conversions
- Monthly recurring revenue (MRR)
- Churn rate
- Average resumes generated per user
- Fair use limit violations
- Webhook success/failure rates
```

### Logs to Monitor

- Check `console.log` for webhook events
- Monitor Resend email delivery
- Track `trackGeneration()` calls
- Alert on abuse detection (150+ resumes/day)

## Security Considerations

### Rate Limiting

- 30-second cooldown prevents API abuse
- 150/day auto-suspend prevents scraping
- Usage tied to user email (localStorage-based)

### Data Protection

- Subscription data stored in localStorage (client-side)
- No sensitive data sent to third parties
- Webhook signature validation recommended (add to webhook handler)

### Future Improvements

1. **Webhook Signature Validation:**
   ```typescript
   // Add to webhook handler
   const signature = request.headers.get('X-Gumroad-Signature');
   const verified = verifySignature(body, signature);
   if (!verified) return new Response('Unauthorized', { status: 401 });
   ```

2. **Server-Side Subscription Storage:**
   - Move from localStorage to database
   - Sync with Gumroad via webhook
   - Enable subscription sharing across devices

3. **Advanced Analytics:**
   - Track conversion funnel
   - Analyze usage patterns
   - Identify churn risk users

## Troubleshooting

### Webhooks Not Working

1. Verify endpoint is accessible: `https://applypro.org/api/gumroad-subscription-webhook`
2. Check Gumroad webhook logs
3. Verify event types are enabled
4. Check server logs for webhook processing errors

### Emails Not Sending

1. Verify Resend API key is correct
2. Verify sender domain is verified
3. Check Resend dashboard for failures
4. Verify `RESEND_API_KEY` is in environment

### Rate Limiting Issues

1. Check browser console for cooldown messages
2. Verify `trackGeneration()` is called after success
3. Check localStorage for usage_records
4. Test with `getDailyUsage()` directly

## Support

For questions or issues:
- Email: support@applypro.org
- Documentation: See inline code comments
- Gumroad: https://gumroad.com/applypro

---

**Last Updated:** December 2024
**Version:** 1.0
**Status:** Ready for Production
