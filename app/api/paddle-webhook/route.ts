import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { createSubscription, cancelSubscription } from "@/lib/subscription-db";

// Paddle webhook signature verification
function verifyPaddleWebhook(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  
  try {
    // Paddle uses ts;h1= format for signature
    const parts = signature.split(';');
    const tsMatch = parts.find(p => p.startsWith('ts='));
    const h1Match = parts.find(p => p.startsWith('h1='));
    
    if (!tsMatch || !h1Match) return false;
    
    const timestamp = tsMatch.replace('ts=', '');
    const hash = h1Match.replace('h1=', '');
    
    // Recreate the signed payload
    const signedPayload = `${timestamp}:${rawBody}`;
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    );
  } catch (error) {
    console.error('Webhook verification error:', error);
    return false;
  }
}

// Map Paddle product IDs to plans
const PRODUCT_TO_PLAN: Record<string, 'monthly' | 'yearly' | 'pay-per-use'> = {
  // Replace these with your actual Paddle product/price IDs
  'pri_monthly_xxxxx': 'monthly',
  'pri_yearly_xxxxx': 'yearly',
  'pri_payperuse_xxxxx': 'pay-per-use',
};

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('paddle-signature');
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production' && webhookSecret) {
      if (!verifyPaddleWebhook(rawBody, signature, webhookSecret)) {
        console.error('Invalid Paddle webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;
    const data = event.data;

    console.log('Paddle webhook received:', eventType);

    switch (eventType) {
      // One-time payment completed
      case 'transaction.completed': {
        const email = data.customer?.email;
        const productId = data.items?.[0]?.price?.id;
        const transactionId = data.id;
        
        if (!email || !productId) {
          console.error('Missing email or product in transaction');
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.error('User not found for email:', email);
          // Still return 200 to acknowledge receipt
          return NextResponse.json({ received: true }, { status: 200 });
        }

        // Determine plan from product ID
        const plan = PRODUCT_TO_PLAN[productId] || 'pay-per-use';

        // Create subscription
        await createSubscription({
          userId: user.id,
          email,
          plan,
          paymentId: transactionId,
        });

        console.log(`Subscription created: ${plan} for ${email}`);
        break;
      }

      // Subscription started
      case 'subscription.created':
      case 'subscription.activated': {
        const email = data.customer?.email;
        const subscriptionId = data.id;
        const priceId = data.items?.[0]?.price?.id;
        
        if (!email) {
          console.error('Missing email in subscription event');
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          console.error('User not found for email:', email);
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const plan = PRODUCT_TO_PLAN[priceId] || 'monthly';

        await createSubscription({
          userId: user.id,
          email,
          plan,
          paymentId: subscriptionId,
        });

        console.log(`Subscription activated: ${plan} for ${email}`);
        break;
      }

      // Subscription renewed
      case 'subscription.updated': {
        const email = data.customer?.email;
        const status = data.status;
        
        if (status === 'active' && email) {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // Reset monthly usage on renewal
            await prisma.subscription.updateMany({
              where: { userId: user.id, status: 'active' },
              data: { monthlyUsageCount: 0, lastResetDate: new Date() },
            });
            console.log(`Subscription renewed for ${email}`);
          }
        }
        break;
      }

      // Subscription cancelled
      case 'subscription.canceled': {
        const email = data.customer?.email;
        
        if (!email) {
          return NextResponse.json({ received: true }, { status: 200 });
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (user) {
          await cancelSubscription(user.id);
          console.log(`Subscription cancelled for ${email}`);
        }
        break;
      }

      // Payment failed
      case 'subscription.payment_failed':
      case 'transaction.payment_failed': {
        const email = data.customer?.email;
        
        if (email) {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            await prisma.subscription.updateMany({
              where: { userId: user.id, status: 'active' },
              data: { status: 'failed' },
            });
            console.log(`Payment failed for ${email}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Paddle event: ${eventType}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
    
  } catch (error) {
    console.error('Paddle webhook error:', error);
    // Return 200 to prevent Paddle from retrying
    return NextResponse.json({ received: true }, { status: 200 });
  }
}

// Paddle may send GET requests for verification
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
