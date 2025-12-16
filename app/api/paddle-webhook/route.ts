import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { 
  sendSubscriptionConfirmationEmail, 
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail 
} from '@/lib/emailTemplates';

// Paddle webhook events we care about
type PaddleEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.paused'
  | 'subscription.resumed'
  | 'subscription.past_due'
  | 'transaction.completed'
  | 'transaction.payment_failed';

interface PaddleWebhookEvent {
  event_type: PaddleEventType;
  event_id: string;
  occurred_at: string;
  data: {
    id: string;
    status: string;
    customer_id: string;
    items: Array<{
      price: {
        id: string;
        product_id: string;
        unit_price?: {
          amount: string;
          currency_code: string;
        };
      };
      quantity: number;
    }>;
    custom_data?: {
      user_id?: string;
      plan_type?: string;
    };
    billing_cycle?: {
      interval: string;
      frequency: number;
    };
    current_billing_period?: {
      starts_at: string;
      ends_at: string;
    };
    scheduled_change?: {
      action: string;
      effective_at: string;
    } | null;
  };
}

// Verify Paddle webhook signature
function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  try {
    // Paddle sends signature as: ts=timestamp;h1=hash
    const parts = signature.split(';');
    const tsMatch = parts.find(p => p.startsWith('ts='));
    const h1Match = parts.find(p => p.startsWith('h1='));

    if (!tsMatch || !h1Match) return false;

    const timestamp = tsMatch.replace('ts=', '');
    const expectedHash = h1Match.replace('h1=', '');

    // Build signed payload
    const signedPayload = `${timestamp}:${rawBody}`;

    // Calculate HMAC
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(signedPayload);
    const calculatedHash = hmac.digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(calculatedHash),
      Buffer.from(expectedHash)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Map Paddle price ID to plan type
function getPlanFromPriceId(priceId: string): 'monthly' | 'yearly' | 'pay-per-use' | null {
  const priceMap: Record<string, 'monthly' | 'yearly' | 'pay-per-use'> = {
    [process.env.NEXT_PUBLIC_PADDLE_PRICE_MONTHLY!]: 'monthly',
    [process.env.NEXT_PUBLIC_PADDLE_PRICE_YEARLY!]: 'yearly',
    [process.env.NEXT_PUBLIC_PADDLE_PRICE_PAY_PER_USE!]: 'pay-per-use',
  };
  return priceMap[priceId] || null;
}

export async function POST(request: NextRequest) {
  console.log('=== PADDLE WEBHOOK RECEIVED ===');

  try {
    const rawBody = await request.text();
    const signature = request.headers.get('paddle-signature');
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    // Verify signature in production (skip in development if secret not set)
    if (webhookSecret && webhookSecret !== 'whsec_sandbox_will_be_created') {
      const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event: PaddleWebhookEvent = JSON.parse(rawBody);

    console.log('Event Type:', event.event_type);
    console.log('Event ID:', event.event_id);
    console.log('Data:', JSON.stringify(event.data, null, 2));

    const { event_type, data } = event;

    // Get user ID from custom_data (passed during checkout)
    const userId = data.custom_data?.user_id;

    if (!userId) {
      console.error('No user_id in custom_data');
      // Still return 200 to acknowledge receipt
      return NextResponse.json({ received: true, warning: 'No user_id' });
    }

    // Get price ID and plan type
    const priceId = data.items?.[0]?.price?.id;
    const plan = priceId ? getPlanFromPriceId(priceId) : null;

    switch (event_type) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.resumed': {
        if (!plan) {
          console.error('Unknown price ID:', priceId);
          break;
        }

        // Determine limits based on plan
        const monthlyLimit = plan === 'pay-per-use' ? 3 : 100;

        // Create or update subscription
        await prisma.subscription.upsert({
          where: { paddleId: data.id },
          create: {
            userId,
            paddleId: data.id,
            plan,
            status: 'active',
            monthlyUsageCount: 0,
            monthlyLimit,
            lastResetDate: new Date(),
            currentPeriodEnd: data.current_billing_period?.ends_at
              ? new Date(data.current_billing_period.ends_at)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          update: {
            plan,
            status: 'active',
            monthlyLimit,
            currentPeriodEnd: data.current_billing_period?.ends_at
              ? new Date(data.current_billing_period.ends_at)
              : undefined,
          },
        });

        // Send confirmation email for new subscriptions
        if (event_type === 'subscription.created') {
          try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.email) {
              const priceAmount = data.items?.[0]?.price?.unit_price?.amount;
              const amount = priceAmount ? `$${(parseInt(priceAmount) / 100).toFixed(2)}` : '';
              await sendSubscriptionConfirmationEmail(user.email, user.name || '', plan, amount);
              console.log(`Subscription confirmation email sent to ${user.email}`);
            }
          } catch (emailError) {
            console.error('Failed to send subscription confirmation email:', emailError);
            // Don't fail the webhook if email fails
          }
        }

        console.log(`Subscription ${event_type} for user ${userId}, plan: ${plan}`);
        break;
      }

      case 'subscription.canceled': {
        // Check if cancellation is immediate or at end of period
        const effectiveAt = data.scheduled_change?.effective_at;

        await prisma.subscription.updateMany({
          where: { paddleId: data.id },
          data: {
            status: effectiveAt ? 'active' : 'cancelled', // Keep active until period ends
            cancelledAt: new Date(),
          },
        });

        // Send cancellation email
        try {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user?.email) {
            const endDate = effectiveAt 
              ? new Date(effectiveAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
              : 'immediately';
            await sendSubscriptionCancelledEmail(user.email, user.name || '', endDate);
            console.log(`Subscription cancelled email sent to ${user.email}`);
          }
        } catch (emailError) {
          console.error('Failed to send subscription cancelled email:', emailError);
        }

        console.log(`Subscription canceled for user ${userId}`);
        break;
      }

      case 'subscription.paused': {
        await prisma.subscription.updateMany({
          where: { paddleId: data.id },
          data: { status: 'paused' },
        });

        console.log(`Subscription paused for user ${userId}`);
        break;
      }

      case 'subscription.past_due': {
        await prisma.subscription.updateMany({
          where: { paddleId: data.id },
          data: { status: 'past_due' },
        });

        console.log(`Subscription past due for user ${userId}`);
        break;
      }

      case 'transaction.completed': {
        // For pay-per-use, this creates a new "subscription" with 3 credits
        if (plan === 'pay-per-use') {
          // Check if this is a one-time purchase (not a subscription renewal)
          const existingSub = await prisma.subscription.findFirst({
            where: { paddleId: data.id },
          });

          if (!existingSub) {
            await prisma.subscription.create({
              data: {
                userId,
                paddleId: data.id,
                plan: 'pay-per-use',
                status: 'active',
                monthlyUsageCount: 0,
                monthlyLimit: 3,
                lastResetDate: new Date(),
                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
              },
            });

            // Send confirmation email for pay-per-use purchase
            try {
              const user = await prisma.user.findUnique({ where: { id: userId } });
              if (user?.email) {
                const priceAmount = data.items?.[0]?.price?.unit_price?.amount;
                const amount = priceAmount ? `$${(parseInt(priceAmount) / 100).toFixed(2)}` : '$9.00';
                await sendSubscriptionConfirmationEmail(user.email, user.name || '', 'pay-per-use', amount);
                console.log(`Pay-per-use confirmation email sent to ${user.email}`);
              }
            } catch (emailError) {
              console.error('Failed to send pay-per-use confirmation email:', emailError);
            }

            console.log(`Pay-per-use pack created for user ${userId}`);
          }
        }
        break;
      }

      case 'transaction.payment_failed': {
        await prisma.subscription.updateMany({
          where: { paddleId: data.id },
          data: { status: 'failed' },
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

        console.log(`Payment failed for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event_type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Paddle webhook endpoint active' });
}
