import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Webhook } from 'standardwebhooks';

const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY || '';

interface DodoWebhookPayload {
  type: string;
  data: {
    payload_type?: string;
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

export async function POST(request: NextRequest) {
  console.log('=== DODO WEBHOOK RECEIVED ===');

  try {
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    // Verify webhook signature
    if (webhookSecret) {
      try {
        const wh = new Webhook(webhookSecret);
        wh.verify(body, {
          'webhook-id': headers['webhook-id'] || '',
          'webhook-timestamp': headers['webhook-timestamp'] || '',
          'webhook-signature': headers['webhook-signature'] || '',
        });
        console.log('Webhook signature verified');
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload: DodoWebhookPayload = JSON.parse(body);
    console.log('Webhook type:', payload.type);
    console.log('Webhook data:', JSON.stringify(payload.data, null, 2));

    const eventType = payload.type;
    const data = payload.data;

    // Extract customer ID from various places in the payload
    const customerId = data.customer_id || data.customer?.customer_id;

    switch (eventType) {
      case 'subscription.active':
      case 'subscription.created': {
        const userId = data.metadata?.user_id;
        const planType = data.metadata?.plan_type;
        const subscriptionId = data.subscription_id;

        if (!userId || !planType || !subscriptionId) {
          console.error('Missing required fields:', { userId, planType, subscriptionId });
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Determine plan details
        const isPayPerUse = planType === 'pay-per-use';
        const monthlyLimit = isPayPerUse ? 3 : 100;

        // Check for existing subscription to prevent duplicates
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            paddleId: subscriptionId,
          },
        });

        if (existingSubscription) {
          // Update existing subscription
          await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              status: 'active',
              customerId: customerId,
              currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
            },
          });
          console.log('Updated existing subscription:', subscriptionId);
        } else {
          // Create new subscription
          await prisma.subscription.create({
            data: {
              userId,
              plan: planType,
              status: 'active',
              paddleId: subscriptionId,
              customerId: customerId,
              monthlyLimit,
              monthlyUsageCount: 0,
              currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : null,
            },
          });
          console.log('Created new subscription:', subscriptionId);
        }
        break;
      }

      case 'subscription.updated': {
        const subscriptionId = data.subscription_id;
        if (!subscriptionId) {
          console.error('No subscription_id in update event');
          return NextResponse.json({ error: 'Missing subscription_id' }, { status: 400 });
        }

        await prisma.subscription.updateMany({
          where: { paddleId: subscriptionId },
          data: {
            status: data.status || 'active',
            customerId: customerId,
            currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : undefined,
          },
        });
        console.log('Updated subscription:', subscriptionId);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.canceled': {
        const subscriptionId = data.subscription_id;
        if (!subscriptionId) {
          console.error('No subscription_id in cancel event');
          return NextResponse.json({ error: 'Missing subscription_id' }, { status: 400 });
        }

        await prisma.subscription.updateMany({
          where: { paddleId: subscriptionId },
          data: {
            status: 'cancelled',
          },
        });
        console.log('Cancelled subscription:', subscriptionId);
        break;
      }

      case 'subscription.renewed': {
        const subscriptionId = data.subscription_id;
        if (!subscriptionId) {
          console.error('No subscription_id in renewal event');
          return NextResponse.json({ error: 'Missing subscription_id' }, { status: 400 });
        }

        await prisma.subscription.updateMany({
          where: { paddleId: subscriptionId },
          data: {
            status: 'active',
            monthlyUsageCount: 0,
            currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : undefined,
            lastResetDate: new Date(),
          },
        });
        console.log('Renewed subscription:', subscriptionId);
        break;
      }

      case 'subscription.on_hold':
      case 'subscription.past_due': {
        const subscriptionId = data.subscription_id;
        if (!subscriptionId) {
          return NextResponse.json({ error: 'Missing subscription_id' }, { status: 400 });
        }

        await prisma.subscription.updateMany({
          where: { paddleId: subscriptionId },
          data: {
            status: 'past_due',
          },
        });
        console.log('Subscription on hold:', subscriptionId);
        break;
      }

      case 'payment.succeeded': {
        const paymentId = data.payment_id;
        const userId = data.metadata?.user_id;
        const planType = data.metadata?.plan_type;

        if (planType === 'pay-per-use' && userId) {
          const existing = await prisma.subscription.findFirst({
            where: { paddleId: paymentId },
          });

          if (!existing) {
            await prisma.subscription.create({
              data: {
                userId,
                plan: 'pay-per-use',
                status: 'active',
                paddleId: paymentId,
                customerId: customerId,
                monthlyLimit: 3,
                monthlyUsageCount: 0,
              },
            });
            console.log('Created pay-per-use subscription from payment:', paymentId);
          }
        }
        break;
      }

      case 'payment.failed': {
        console.log('Payment failed:', data.payment_id);
        break;
      }

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Dodo webhook endpoint active' });
}
