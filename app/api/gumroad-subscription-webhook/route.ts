import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse form data (Gumroad sends form-encoded, not JSON)
    const formData = await request.formData();
    const body = Object.fromEntries(formData);

    // Extract and type-cast string values
    const email = String(body.email || '');
    const productPermalink = String(body.product_permalink || '');
    const saleType = String(body.sale_type || '');
    const subscriptionId = String(body.subscription_id || '');

    console.log('Gumroad webhook received:', {
      event: saleType,
      email: email,
      product: productPermalink,
      timestamp: new Date().toISOString()
    });

    if (!email) {
      console.error('No email in webhook payload');
      return NextResponse.json({ error: 'No email' }, { status: 400 });
    }

    // Determine product type and plan
    let isSubscription = false;
    let plan: 'monthly' | 'yearly' | 'pay-per-use' = 'pay-per-use';

    if (productPermalink === process.env.GUMROAD_MONTHLY_PERMALINK ||
        productPermalink === 'pro-monthly') {
      isSubscription = true;
      plan = 'monthly';
    } else if (productPermalink === process.env.GUMROAD_YEARLY_PERMALINK ||
               productPermalink === 'pro-yearly') {
      isSubscription = true;
      plan = 'yearly';
    } else if (productPermalink === process.env.GUMROAD_PRODUCT_PERMALINK ||
               productPermalink === 'ykchtv') {
      plan = 'pay-per-use';
    }

    console.log('Product identified:', { productPermalink, plan, isSubscription });

    // Handle subscription events
    if (isSubscription) {
      switch(saleType) {
        case 'sale':
        case 'subscription_started':
        case 'subscription_restarted':
          console.log(`Subscription ${plan} started for ${email}`);
          await sendSubscriptionEmail(email, 'welcome', plan);
          break;

        case 'subscription_ended':
        case 'subscription_cancelled':
          console.log(`Subscription ${plan} cancelled for ${email}`);
          await sendSubscriptionEmail(email, 'cancelled', plan);
          break;

        case 'subscription_payment_failed':
          console.log(`Payment failed for ${email}`);
          await sendSubscriptionEmail(email, 'payment_failed', plan);
          break;

        default:
          console.log(`Unhandled subscription event: ${saleType}`);
      }
    } else {
      // Handle pay-per-use purchase (license key delivery already handled by existing webhook)
      console.log(`Pay-per-use purchase by ${email} - license delivery handled by existing webhook`);
    }

    return NextResponse.json({
      success: true,
      product: productPermalink,
      plan: plan,
      isSubscription: isSubscription
    });

  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Webhook processing failed', details: errorMessage },
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
      subject: `🎉 Welcome to ApplyPro Pro ${plan === 'yearly' ? 'Yearly' : 'Monthly'}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ApplyPro Pro!</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">ApplyPro</h1>
              <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 18px;">Your AI Resume Assistant</p>
            </div>

            <!-- Main content -->
            <div style="padding: 40px 30px;">

              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px;">🎉 Welcome to ApplyPro Pro!</h2>

              <p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin: 0 0 20px 0;">
                Thank you for subscribing to <strong>ApplyPro Pro ${plan === 'yearly' ? 'Yearly' : 'Monthly'}</strong>!
                You now have unlimited access to AI-powered resume generation.
              </p>

              <!-- Quick start -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">🚀 Get Started in 3 Easy Steps:</h3>

                <div style="margin-bottom: 15px;">
                  <strong style="color: #1e40af; font-size: 18px;">1.</strong>
                  <span style="color: #374151; margin-left: 10px;">Go to
                    <a href="https://applypro.org/login" style="color: #2563eb; text-decoration: none; font-weight: 600;">applypro.org/login</a>
                  </span>
                </div>

                <div style="margin-bottom: 15px;">
                  <strong style="color: #1e40af; font-size: 18px;">2.</strong>
                  <span style="color: #374151; margin-left: 10px;">Log in with this email:</span>
                  <div style="background-color: #dbeafe; padding: 10px; margin: 10px 0 10px 30px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 14px; color: #1e40af; font-weight: bold;">
                    ${email}
                  </div>
                </div>

                <div style="margin-bottom: 0;">
                  <strong style="color: #1e40af; font-size: 18px;">3.</strong>
                  <span style="color: #374151; margin-left: 10px;">Create a password if this is your first time</span>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://applypro.org/login"
                   style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Start Creating Resumes Now →
                </a>
              </div>

              <!-- Features -->
              <div style="background-color: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">✨ What You Can Do:</h3>
                <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px; margin: 0;">
                  <li><strong>Unlimited AI-tailored resumes</strong> (fair use: 100/month)</li>
                  <li>All 3 professional templates (Modern, Traditional, ATS-Optimized)</li>
                  <li>Unlimited job application tracking</li>
                  <li>Priority email support</li>
                  <li>Early access to new features</li>
                  <li>Download resumes in PDF and DOCX formats</li>
                </ul>
              </div>

              <!-- Pro tip -->
              <div style="border: 2px solid #fbbf24; background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #92400e; margin: 0; line-height: 1.6;">
                  <strong>💡 Pro Tip:</strong> Upload your current resume, paste a job description, and let our AI tailor your resume in seconds.
                  The AI will optimize keywords, format for ATS systems, and highlight relevant experience!
                </p>
              </div>

              <!-- Help -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Need Help?</h3>
                <p style="color: #6b7280; line-height: 1.6; margin: 0;">
                  • Visit: <a href="https://applypro.org/dashboard" style="color: #2563eb;">applypro.org/dashboard</a><br>
                  • Email: <a href="mailto:support@applypro.org" style="color: #2563eb;">support@applypro.org</a><br>
                  • Manage subscription: <a href="https://gumroad.com/library" style="color: #2563eb;">Gumroad Library</a>
                </p>
              </div>

              <!-- Fair use -->
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>📋 Fair Use Policy:</strong> 100 resume generations/month.
                  Need more? <a href="mailto:support@applypro.org" style="color: #2563eb;">Contact us</a> for business plans.
                </p>
              </div>

              <p style="color: #4b5563; line-height: 1.6; margin: 30px 0 0 0;">
                Happy job hunting! 🎯<br>
                <strong>Team ApplyPro</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                You're receiving this because you subscribed to ApplyPro Pro.
              </p>
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                © 2025 ApplyPro. All rights reserved.
              </p>
              <p style="margin: 15px 0 0 0;">
                <a href="https://applypro.org" style="color: #2563eb; text-decoration: none; font-size: 14px;">Visit ApplyPro</a>
              </p>
            </div>

          </div>
        </body>
        </html>
      `
    },
    cancelled: {
      subject: 'Your ApplyPro subscription has been cancelled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #1f2937;">Subscription Cancelled</h1>
          <p style="color: #4b5563; line-height: 1.6;">We're sorry to see you go!</p>
          <p style="color: #4b5563; line-height: 1.6;">Your Pro features will remain active until the end of your current billing period.</p>
          <p style="color: #4b5563; line-height: 1.6;">You can reactivate anytime at <a href="https://applypro.org/pricing" style="color: #2563eb;">applypro.org/pricing</a></p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            We'd love to hear your feedback: <a href="mailto:support@applypro.org" style="color: #2563eb;">support@applypro.org</a>
          </p>
        </div>
      `
    },
    payment_failed: {
      subject: 'Payment Failed - ApplyPro Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #dc2626;">Payment Failed</h1>
          <p style="color: #4b5563; line-height: 1.6;">We couldn't process your subscription payment.</p>
          <p style="color: #4b5563; line-height: 1.6;">Please update your payment method in Gumroad to continue your Pro access.</p>
          <div style="margin: 30px 0;">
            <a href="https://gumroad.com/library" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Update Payment Method →
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Need help? Email <a href="mailto:support@applypro.org" style="color: #2563eb;">support@applypro.org</a>
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

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Failed to send email:', responseData);
    } else {
      console.log(`${type} email sent successfully to ${email}`, responseData);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
