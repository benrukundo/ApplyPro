import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const event = body.sale_type || body.event;
    const email = body.email;
    const subscriptionId = body.subscription_id;
    const productId = body.product_id;

    // Determine plan based on product ID
    let plan: 'monthly' | 'yearly' = 'monthly';
    if (productId === process.env.GUMROAD_YEARLY_PRODUCT_ID) {
      plan = 'yearly';
    }

    console.log(`Subscription webhook received: ${event} for ${email}`);

    // Handle different subscription events
    switch (event) {
      case 'sale':
      case 'subscription_started':
      case 'subscription_restarted':
        // Send welcome email
        await sendSubscriptionEmail(email, 'welcome', plan);
        console.log(`Subscription activated for ${email} - Plan: ${plan}`);
        break;

      case 'subscription_ended':
      case 'subscription_cancelled':
        // Send cancellation email
        await sendSubscriptionEmail(email, 'cancelled', plan);
        console.log(`Subscription cancelled for ${email}`);
        break;

      case 'subscription_payment_failed':
        // Notify user of payment failure
        await sendSubscriptionEmail(email, 'payment_failed', plan);
        console.log(`Payment failed for ${email}`);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function sendSubscriptionEmail(
  email: string,
  type: 'welcome' | 'cancelled' | 'payment_failed',
  plan: string
) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY not configured');
    return;
  }

  const templates = {
    welcome: {
      subject: `Welcome to ApplyPro Pro ${plan === 'yearly' ? 'Yearly' : 'Monthly'}! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to ApplyPro Pro!</h1>
          <p>Thank you for subscribing to ApplyPro Pro ${plan}!</p>

          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">You now have access to:</h2>
            <ul style="color: #374151;">
              <li><strong>Unlimited AI-tailored resumes</strong> (fair use: 100/month)</li>
              <li>All 3 professional templates</li>
              <li>Unlimited job tracking</li>
              <li>Priority email support</li>
              <li>Early access to new features</li>
            </ul>
          </div>

          <p>Your subscription email is: <strong>${email}</strong></p>
          <p>Simply log in with this email to access all Pro features!</p>

          <a href="https://applypro.org/generate" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Start Creating Resumes Now →
          </a>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

          <p style="color: #6b7280; font-size: 14px;">
            Questions? Email us at <a href="mailto:support@applypro.org">support@applypro.org</a>
          </p>
          <p style="color: #6b7280; font-size: 12px;">
            To manage your subscription, visit your <a href="https://gumroad.com/library">Gumroad Library</a>
          </p>
        </div>
      `
    },
    cancelled: {
      subject: 'Your ApplyPro subscription has been cancelled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Subscription Cancelled</h1>
          <p>We're sorry to see you go!</p>
          <p>Your Pro features will remain active until the end of your current billing period.</p>
          <p>You can reactivate anytime at <a href="https://applypro.org/pricing">applypro.org/pricing</a></p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            We'd love to hear your feedback: <a href="mailto:support@applypro.org">support@applypro.org</a>
          </p>
        </div>
      `
    },
    payment_failed: {
      subject: 'Payment Failed - ApplyPro Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Payment Failed</h1>
          <p>We couldn't process your subscription payment.</p>
          <p>Please update your payment method in Gumroad to continue your Pro access.</p>
          <a href="https://gumroad.com/library" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Update Payment Method →
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Need help? Email <a href="mailto:support@applypro.org">support@applypro.org</a>
          </p>
        </div>
      `
    }
  };

  const template = templates[type];

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ApplyPro <noreply@send.applypro.org>',
        to: email,
        subject: template.subject,
        html: template.html
      })
    });

    if (!response.ok) {
      console.error('Failed to send email:', await response.text());
    } else {
      console.log(`Email sent successfully to ${email}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
