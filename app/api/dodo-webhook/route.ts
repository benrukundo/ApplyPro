import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { prisma } from '@/lib/prisma';
import {
  sendSubscriptionConfirmationEmail,
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
} from '@/lib/emailTemplates';

// Initialize webhook verifier
const getWebhook = () => {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!secret) {
    throw new Error('DODO_PAYMENTS_WEBHOOK_KEY is not set');
  }
  return new Webhook(secret);
};

// Dodo webhook event types
type DodoEventType =
  | 'payment.succeeded'
  | 'payment.failed'
  | 'payment.processing'
  | 'payment.cancelled'
  | 'subscription.active'
  | 'subscription.cancelled'
  | 'subscription.paused'
  | 'subscription.renewed'
  | 'subscription.past_due'
  | 'subscription.on_hold'
  | 'subscription.failed'
  | 'subscription.expired'
  | 'refund.succeeded'
  | 'refund.failed'
  | 'dispute.opened'
  | 'dispute.won'
  | 'dispute.lost';

interface DodoWebhookPayload {
  type: string;
  data: {
    payload_type: string;
    subscription_id?: string;
    payment_id?: string;
    customer_id?: string;
    customer?: {
      customer_id: string;
      email: string;
      name?: string;
    };
    product_id?: string;
    status?: string;
    billing?: {
      interval?: string;
    };
    metadata?: {
      user_id?: string;
      plan_type?: string;
      user_email?: string;
    };
    current_period_start?: string;
    current_period_end?: string;
    created_at?: string;
  };
}

// Map Dodo product ID to plan type
function getPlanFromProductId(productId: string): 'monthly' | 'yearly' | 'pay-per-use' | null {
  const productMap: Record<string, 'monthly' | 'yearly' | 'pay-per-use'> = {};
  
  if (process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY) {
    productMap[process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY] = 'monthly';
  }
  if (process.env.NEXT_PUBLIC_DODO_PRICE_YEARLY) {
    productMap[process.env.NEXT_PUBLIC_DODO_PRICE_YEARLY] = 'yearly';
  }
  if (process.env.NEXT_PUBLIC_DODO_PRICE_PAY_PER_USE) {
    productMap[process.env.NEXT_PUBLIC_DODO_PRICE_PAY_PER_USE] = 'pay-per-use';
  }
  
  return productMap[productId] || null;
}

// Format amount for display
function formatAmount(amount?: number, currency?: string): string {
  if (!amount) return '';
  const dollars = amount / 100;
  return `$${dollars.toFixed(2)}`;
}

export async function POST(request: NextRequest) {
  console.log('=== DODO WEBHOOK RECEIVED ===');
  console.log('Timestamp:', new Date().toISOString());

  try {
    const rawBody = await request.text();
    
    // Get webhook headers
    const webhookId = request.headers.get('webhook-id') || '';
    const webhookSignature = request.headers.get('webhook-signature') || '';
    const webhookTimestamp = request.headers.get('webhook-timestamp') || '';

    // Verify webhook signature in production
    if (process.env.DODO_PAYMENTS_WEBHOOK_KEY && 
        process.env.DODO_PAYMENTS_WEBHOOK_KEY !== 'your_webhook_secret_here') {
      try {
        const webhook = getWebhook();
        const webhookHeaders = {
          'webhook-id': webhookId,
          'webhook-signature': webhookSignature,
          'webhook-timestamp': webhookTimestamp,
        };
        webhook.verify(rawBody, webhookHeaders);
        console.log('Webhook signature verified');
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      console.log('Skipping webhook verification (development mode)');
    }

    const payload: DodoWebhookPayload = JSON.parse(rawBody);
    
    console.log('Event Type:', payload.type);
    console.log('Data:', JSON.stringify(payload.data, null, 2));

    const { type, data } = payload;

    // Get user ID from metadata
    const userId = data.metadata?.user_id;
    if (!userId) {
      console.warn('No user_id in metadata, checking if we can find user by email');
      
      // Try to find user by email if available
      const userEmail = data.customer?.email || data.metadata?.user_email;
      if (userEmail) {
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (user) {
          console.log('Found user by email:', user.id);
          // Continue processing with found user
          await processWebhookEvent(type, data, user.id);
          return NextResponse.json({ received: true });
        }
      }
      
      console.warn('Could not identify user for webhook');
      return NextResponse.json({ received: true, warning: 'No user_id found' });
    }

    await processWebhookEvent(type, data, userId);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function processWebhookEvent(
  type: DodoEventType,
  data: DodoWebhookPayload['data'],
  userId: string
) {
  // Get plan type from product ID or metadata
  const plan = data.product_id 
    ? getPlanFromProductId(data.product_id) 
    : (data.metadata?.plan_type as 'monthly' | 'yearly' | 'pay-per-use' | null);

  console.log(`Processing ${type} for user ${userId}, plan: ${plan}`);

  switch (type) {
    // ============================================
    // ONE-TIME PAYMENT SUCCESS (Pay-per-use)
    // ============================================
    case 'payment.succeeded': {
      if (plan === 'pay-per-use') {
        // Check if we already processed this payment
        const existingPurchase = await prisma.subscription.findFirst({
          where: { 
            paddleId: data.payment_id,
            plan: 'pay-per-use',
          },
        });

        if (existingPurchase) {
          console.log('Pay-per-use purchase already processed:', data.payment_id);
          break;
        }

        // Create new pay-per-use subscription with 3 credits
        await prisma.subscription.create({
          data: {
            userId,
            paddleId: data.payment_id || `dodo_ppu_${Date.now()}`,
            plan: 'pay-per-use',
            status: 'active',
            monthlyUsageCount: 0,
            monthlyLimit: 3,
            lastResetDate: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
          },
        });

        // Send confirmation email
        try {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user?.email) {
            const amount = formatAmount(data.amount, data.currency) || '$4.99';
            await sendSubscriptionConfirmationEmail(user.email, user.name || '', 'pay-per-use', amount);
            console.log(`Pay-per-use confirmation email sent to ${user.email}`);
          }
        } catch (emailError) {
          console.error('Failed to send pay-per-use confirmation email:', emailError);
        }

        console.log(`Pay-per-use pack created for user ${userId}`);
      }
      break;
    }

    // ============================================
    // SUBSCRIPTION ACTIVE (New subscription)
    // ============================================
    case 'subscription.active': {
      if (!plan || plan === 'pay-per-use') {
        console.log('Skipping subscription.active for pay-per-use or unknown plan');
        break;
      }

      const monthlyLimit = 100;
      const currentPeriodEnd = data.billing?.current_period_end
        ? new Date(data.billing.current_period_end)
        : new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);

        // Upsert subscription
      await prisma.subscription.upsert({
        where: { paddleId: data.subscription_id || `dodo_sub_${userId}_${plan}` },
        create: {
          userId,
          paddleId: data.subscription_id || `dodo_sub_${Date.now()}`,
          customerId: data.customer_id, // Store customer ID
          plan,
          status: 'active',
          monthlyUsageCount: 0,
          monthlyLimit,
          lastResetDate: new Date(),
          currentPeriodEnd,
        },
        update: {
          status: 'active',
          customerId: data.customer_id, // Update customer ID if provided
          plan,
          monthlyLimit,
          currentPeriodEnd,
        },
      });

      // Send confirmation email
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
          const amount = plan === 'monthly' ? '$19' : '$149';
          await sendSubscriptionConfirmationEmail(user.email, user.name || '', plan, amount);
          console.log(`Subscription confirmation email sent to ${user.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send subscription confirmation email:', emailError);
      }

      console.log(`Subscription activated for user ${userId}, plan: ${plan}`);
      break;
    }

    // ============================================
    // SUBSCRIPTION RENEWED
    // ============================================
    case 'subscription.renewed': {
      if (!plan || plan === 'pay-per-use') break;

      const currentPeriodEnd = data.billing?.current_period_end
        ? new Date(data.billing.current_period_end)
        : new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);

      await prisma.subscription.updateMany({
        where: { paddleId: data.subscription_id },
        data: {
          status: 'active',
          monthlyUsageCount: 0, // Reset usage on renewal
          lastResetDate: new Date(),
          currentPeriodEnd,
        },
      });

      console.log(`Subscription renewed for user ${userId}`);
      break;
    }

    // ============================================
    // SUBSCRIPTION CANCELLED
    // ============================================
    case 'subscription.cancelled': {
      const subscription = await prisma.subscription.findFirst({
        where: { paddleId: data.subscription_id },
      });

      await prisma.subscription.updateMany({
        where: { paddleId: data.subscription_id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });

      // Send cancellation email
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
          const endDate = data.billing?.current_period_end
            ? new Date(data.billing.current_period_end).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : 'immediately';
          await sendSubscriptionCancelledEmail(user.email, user.name || '', endDate);
          console.log(`Subscription cancelled email sent to ${user.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send subscription cancelled email:', emailError);
      }

      console.log(`Subscription cancelled for user ${userId}`);
      break;
    }

    // ============================================
    // SUBSCRIPTION PAUSED / ON HOLD
    // ============================================
    case 'subscription.paused':
    case 'subscription.on_hold': {
      await prisma.subscription.updateMany({
        where: { paddleId: data.subscription_id },
        data: { status: 'paused' },
      });

      console.log(`Subscription paused for user ${userId}`);
      break;
    }

    // ============================================
    // SUBSCRIPTION PAST DUE / FAILED
    // ============================================
    case 'subscription.past_due':
    case 'subscription.failed': {
      await prisma.subscription.updateMany({
        where: { paddleId: data.subscription_id },
        data: { status: type === 'subscription.past_due' ? 'past_due' : 'failed' },
      });

      // Send payment failed email
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
          await sendPaymentFailedEmail(user.email, user.name || '');
          console.log(`Payment failed email sent to ${user.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send payment failed email:', emailError);
      }

      console.log(`Subscription ${type} for user ${userId}`);
      break;
    }

    // ============================================
    // PAYMENT FAILED
    // ============================================
    case 'payment.failed': {
      // Update subscription status if linked to a subscription
      if (data.subscription_id) {
        await prisma.subscription.updateMany({
          where: { paddleId: data.subscription_id },
          data: { status: 'failed' },
        });
      }

      // Send payment failed email
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.email) {
          await sendPaymentFailedEmail(user.email, user.name || '');
          console.log(`Payment failed email sent to ${user.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send payment failed email:', emailError);
      }

      console.log(`Payment failed for user ${userId}`);
      break;
    }

    // ============================================
    // REFUND SUCCEEDED
    // ============================================
    case 'refund.succeeded': {
      // Deactivate the subscription/purchase on refund
      await prisma.subscription.updateMany({
        where: { 
          OR: [
            { paddleId: data.payment_id },
            { paddleId: data.subscription_id },
          ],
        },
        data: { status: 'cancelled' },
      });

      console.log(`Refund processed for user ${userId}`);
      break;
    }

    // ============================================
    // SUBSCRIPTION EXPIRED
    // ============================================
    case 'subscription.expired': {
      await prisma.subscription.updateMany({
        where: { paddleId: data.subscription_id },
        data: { status: 'cancelled' },
      });

      console.log(`Subscription expired for user ${userId}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${type}`);
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'Dodo webhook endpoint active',
    timestamp: new Date().toISOString(),
  });
}
