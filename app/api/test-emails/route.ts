import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import {
  sendWelcomeEmail,
  sendSubscriptionConfirmationEmail,
  sendUsageAlertEmail,
  sendLimitReachedEmail,
  sendSubscriptionCancelledEmail,
  sendPaymentFailedEmail,
} from '@/lib/emailTemplates';

export async function GET(request: NextRequest) {
  // Only allow in development or for admin
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const email = session.user.email;
  const name = session.user.name || 'Test User';

  let result;

  switch (type) {
    case 'welcome':
      result = await sendWelcomeEmail(email, name);
      break;
    case 'subscription':
      result = await sendSubscriptionConfirmationEmail(email, name, 'monthly', '$19.00');
      break;
    case 'usage':
      result = await sendUsageAlertEmail(email, name, 80, 100, 'monthly');
      break;
    case 'limit':
      result = await sendLimitReachedEmail(email, name, 'monthly');
      break;
    case 'cancelled':
      result = await sendSubscriptionCancelledEmail(email, name, 'January 16, 2026');
      break;
    case 'failed':
      result = await sendPaymentFailedEmail(email, name);
      break;
    default:
      return NextResponse.json({ 
        error: 'Invalid type',
        validTypes: ['welcome', 'subscription', 'usage', 'limit', 'cancelled', 'failed']
      }, { status: 400 });
  }

  return NextResponse.json({ 
    success: result.success, 
    type,
    sentTo: email,
    error: result.error 
  });
}
