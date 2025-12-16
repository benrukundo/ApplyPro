import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'ApplyPro <support@applypro.org>';
const SUPPORT_EMAIL = 'support@applypro.org';

// Base email wrapper for consistent styling
function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ApplyPro</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f7fb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 32px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ApplyPro</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">AI-Powered Resume Tailoring</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 32px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                    Questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb; text-decoration: none;">${SUPPORT_EMAIL}</a>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} ApplyPro. All rights reserved.
                  </p>
                  <p style="margin: 12px 0 0 0;">
                    <a href="https://applypro.org/privacy" style="color: #9ca3af; font-size: 12px; text-decoration: none; margin-right: 16px;">Privacy Policy</a>
                    <a href="https://applypro.org/terms" style="color: #9ca3af; font-size: 12px; text-decoration: none;">Terms of Service</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Button component
function emailButton(text: string, url: string, color: string = '#2563eb'): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td align="center">
          <a href="${url}" style="display: inline-block; background-color: ${color}; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// ============================================
// EMAIL VERIFICATION
// ============================================
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const content = `
      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
        Verify Your Email Address
      </h2>
      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi ${name || 'there'},
      </p>
      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Thanks for signing up for ApplyPro! Please verify your email address by clicking the button below:
      </p>
      ${emailButton('Verify Email Address', verificationUrl)}
      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        This link will expire in 24 hours. If you didn't create an account with ApplyPro, you can safely ignore this email.
      </p>
      <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
      </p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email address - ApplyPro',
      html: emailWrapper(content),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
}

// ============================================
// WELCOME EMAIL
// ============================================
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const content = `
      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
        Welcome to ApplyPro! 🎉
      </h2>
      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi ${name || 'there'},
      </p>
      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        We're thrilled to have you on board! ApplyPro uses advanced AI to help you create perfectly tailored resumes and cover letters for every job application.
      </p>
      
      <div style="background-color: #f0f9ff; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 18px; font-weight: 600;">
          Here's what you can do:
        </h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: #2563eb; font-size: 18px; margin-right: 12px;">✓</span>
              <span style="color: #374151; font-size: 15px;">Get a free resume analysis and match score</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: #2563eb; font-size: 18px; margin-right: 12px;">✓</span>
              <span style="color: #374151; font-size: 15px;">Generate AI-tailored resumes for specific jobs</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: #2563eb; font-size: 18px; margin-right: 12px;">✓</span>
              <span style="color: #374151; font-size: 15px;">Create ATS-optimized versions that pass screening</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <span style="color: #2563eb; font-size: 18px; margin-right: 12px;">✓</span>
              <span style="color: #374151; font-size: 15px;">Get personalized cover letters in seconds</span>
            </td>
          </tr>
        </table>
      </div>

      ${emailButton('Start Tailoring Your Resume', 'https://applypro.org/generate')}
      
      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        Need help getting started? Check out our <a href="https://applypro.org/pricing" style="color: #2563eb; text-decoration: none;">pricing plans</a> or reply to this email with any questions.
      </p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to ApplyPro - Let\'s land your dream job! 🚀',
      html: emailWrapper(content),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: 'Failed to send welcome email' };
  }
}

// ============================================
// SUBSCRIPTION CONFIRMATION
// ============================================
export async function sendSubscriptionConfirmationEmail(
  email: string,
  name: string,
  plan: 'monthly' | 'yearly' | 'pay-per-use',
  amount: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const planDetails = {
      'monthly': {
        name: 'Pro Monthly',
        limit: '100 resumes per month',
        renewal: 'Renews monthly',
      },
      'yearly': {
        name: 'Pro Yearly',
        limit: '100 resumes per month',
        renewal: 'Renews annually',
      },
      'pay-per-use': {
        name: 'Resume Pack',
        limit: '3 resume credits',
        renewal: 'One-time purchase',
      },
    };

    const details = planDetails[plan];

    const content = `
      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
        Payment Confirmed! 🎉
      </h2>
      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi ${name || 'there'},
      </p>
      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Thank you for your purchase! Your subscription is now active and you're ready to create amazing, tailored resumes.
      </p>
      
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 16px 0; color: #166534; font-size: 18px; font-weight: 600;">
          Order Summary
        </h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; color: #374151; font-size: 15px;">Plan:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600; text-align: right;">${details.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; font-size: 15px;">Amount:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600; text-align: right;">${amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; font-size: 15px;">Includes:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600; text-align: right;">${details.limit}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; font-size: 15px;">Billing:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600; text-align: right;">${details.renewal}</td>
          </tr>
        </table>
      </div>

      ${emailButton('Start Creating Resumes', 'https://applypro.org/generate', '#16a34a')}
      
      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        You can manage your subscription anytime from your <a href="https://applypro.org/dashboard" style="color: #2563eb; text-decoration: none;">dashboard</a>.
      </p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Payment Confirmed - ${details.name} Activated`,
      html: emailWrapper(content),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send subscription confirmation email:', error);
    return { success: false, error: 'Failed to send subscription confirmation email' };
  }
}

// ============================================
// USAGE ALERT
// ============================================
export async function sendUsageAlertEmail(
  email: string,
  name: string,
  used: number,
  limit: number,
  plan: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const percentage = Math.round((used / limit) * 100);
    const remaining = limit - used;

    const content = `
      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
        Usage Alert: ${percentage}% Used
      </h2>
      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi ${name || 'there'},
      </p>
      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Just a heads up - you've used ${used} of your ${limit} resume generations this month.
      </p>
      
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <div style="margin-bottom: 16px;">
          <div style="background-color: #fef3c7; border-radius: 8px; height: 12px; overflow: hidden;">
            <div style="background-color: #f59e0b; height: 100%; width: ${percentage}%; border-radius: 8px;"></div>
          </div>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color: #92400e; font-size: 15px;">Used:</td>
            <td style="color: #92400e; font-size: 15px; font-weight: 600; text-align: right;">${used} resumes</td>
          </tr>
          <tr>
            <td style="color: #92400e; font-size: 15px;">Remaining:</td>
            <td style="color: #92400e; font-size: 15px; font-weight: 600; text-align: right;">${remaining} resumes</td>
          </tr>
        </table>
      </div>

      ${plan === 'pay-per-use' 
        ? emailButton('Get More Credits', 'https://applypro.org/pricing', '#f59e0b')
        : `<p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            Your limit resets at the beginning of your next billing cycle. Keep up the great work on your job search!
          </p>`
      }
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Usage Alert: ${remaining} resumes remaining`,
      html: emailWrapper(content),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send usage alert email:', error);
    return { success: false, error: 'Failed to send usage alert email' };
  }
}

// ============================================
// SUBSCRIPTION CANCELLED
// ============================================
export async function sendSubscriptionCancelledEmail(
  email: string,
  name: string,
  endDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const content = `
      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
        Subscription Cancelled
      </h2>
      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi ${name || 'there'},
      </p>
      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        We're sorry to see you go. Your ApplyPro subscription has been cancelled.
      </p>
      
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="margin: 0; color: #991b1b; font-size: 15px;">
          <strong>Important:</strong> You'll continue to have access to your Pro features until <strong>${endDate}</strong>.
        </p>
      </div>

      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        We'd love to know why you decided to cancel. Your feedback helps us improve. Simply reply to this email with your thoughts.
      </p>

      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Changed your mind? You can resubscribe anytime:
      </p>

      ${emailButton('Resubscribe', 'https://applypro.org/pricing')}
      
      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        Thank you for being a part of ApplyPro. We wish you the best in your job search!
      </p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your ApplyPro subscription has been cancelled',
      html: emailWrapper(content),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send subscription cancelled email:', error);
    return { success: false, error: 'Failed to send subscription cancelled email' };
  }
}

// ============================================
// PAYMENT FAILED
// ============================================
export async function sendPaymentFailedEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const content = `
      <h2 style="margin: 0 0 16px 0; color: #dc2626; font-size: 24px; font-weight: 600;">
        Payment Failed
      </h2>
      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi ${name || 'there'},
      </p>
      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        We were unable to process your payment for your ApplyPro subscription. This could be due to insufficient funds, an expired card, or a temporary issue with your bank.
      </p>
      
      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="margin: 0; color: #991b1b; font-size: 15px;">
          <strong>Action Required:</strong> Please update your payment method to avoid any interruption to your service.
        </p>
      </div>

      ${emailButton('Update Payment Method', 'https://applypro.org/dashboard', '#dc2626')}
      
      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        If you believe this is an error or need assistance, please contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #2563eb; text-decoration: none;">${SUPPORT_EMAIL}</a>.
      </p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Action Required: Payment Failed for ApplyPro',
      html: emailWrapper(content),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send payment failed email:', error);
    return { success: false, error: 'Failed to send payment failed email' };
  }
}

// ============================================
// LIMIT REACHED
// ============================================
export async function sendLimitReachedEmail(
  email: string,
  name: string,
  plan: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isPPU = plan === 'pay-per-use';
    
    const content = `
      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
        ${isPPU ? 'All Credits Used' : 'Monthly Limit Reached'}
      </h2>
      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi ${name || 'there'},
      </p>
      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        ${isPPU 
          ? "You've used all 3 resume credits from your Resume Pack. Great progress on your job search!"
          : "You've reached your monthly limit of 100 resume generations. That's impressive dedication to your job search!"
        }
      </p>
      
      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; color: #0369a1; font-size: 16px; font-weight: 600;">
          ${isPPU ? 'Want to continue?' : 'Need more this month?'}
        </h3>
        <p style="margin: 0; color: #374151; font-size: 15px;">
          ${isPPU 
            ? 'Purchase another Resume Pack for 3 more credits, or upgrade to Pro for unlimited access.'
            : 'Your limit will reset at the start of your next billing cycle. If you need more resumes now, contact support for options.'
          }
        </p>
      </div>

      ${isPPU 
        ? emailButton('Get More Credits', 'https://applypro.org/pricing', '#0369a1')
        : ''
      }
      
      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        Keep up the great work! We're rooting for you to land that dream job. 🎯
      </p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: isPPU ? 'All Resume Credits Used - Get More' : 'Monthly Limit Reached',
      html: emailWrapper(content),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send limit reached email:', error);
    return { success: false, error: 'Failed to send limit reached email' };
  }
}

// ============================================
// RENEWAL REMINDER
// ============================================
export async function sendRenewalReminderEmail(
  email: string,
  name: string,
  plan: string,
  amount: string,
  renewalDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const content = `
      <h2 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: 600;">
        Subscription Renewal Reminder
      </h2>
      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Hi ${name || 'there'},
      </p>
      <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Just a friendly reminder that your ApplyPro subscription will automatically renew in 3 days.
      </p>
      
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 0; color: #374151; font-size: 15px;">Plan:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600; text-align: right;">${plan}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; font-size: 15px;">Amount:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600; text-align: right;">${amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #374151; font-size: 15px;">Renewal Date:</td>
            <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600; text-align: right;">${renewalDate}</td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        No action is needed if you want to continue enjoying ApplyPro. Your subscription will renew automatically.
      </p>

      <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
        Need to make changes? Manage your subscription from your <a href="https://applypro.org/dashboard" style="color: #2563eb; text-decoration: none;">dashboard</a>.
      </p>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Renewal Reminder: Your ${plan} renews on ${renewalDate}`,
      html: emailWrapper(content),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send renewal reminder email:', error);
    return { success: false, error: 'Failed to send renewal reminder email' };
  }
}
