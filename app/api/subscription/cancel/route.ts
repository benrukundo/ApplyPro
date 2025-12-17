import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { sendSubscriptionCancelledEmail } from '@/lib/emailTemplates';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (!subscription.paddleId) {
      return NextResponse.json(
        { error: 'Subscription cannot be cancelled - no payment provider ID' },
        { status: 400 }
      );
    }

    // Get user info for email
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });

    // For pay-per-use, just mark as cancelled (no recurring billing)
    if (subscription.plan === 'pay-per-use') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });

      // Send cancellation email
      if (user?.email) {
        try {
          await sendSubscriptionCancelledEmail(user.email, user.name || '', 'immediately');
          console.log(`Cancellation email sent to ${user.email}`);
        } catch (emailError) {
          console.error('Failed to send cancellation email:', emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Your Resume Pack has been cancelled. Unused credits are no longer available.',
        effectiveDate: 'immediately',
      });
    }

    // For monthly/yearly subscriptions, call Paddle API to cancel
    const paddleApiKey = process.env.PADDLE_API_KEY;
    if (!paddleApiKey) {
      console.error('PADDLE_API_KEY not configured');
      return NextResponse.json(
        { error: 'Payment service configuration error' },
        { status: 500 }
      );
    }

    // Determine Paddle API URL based on environment
    const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox';
    const paddleBaseUrl = paddleEnv === 'production'
      ? 'https://api.paddle.com'
      : 'https://sandbox-api.paddle.com';

    // Call Paddle API to cancel subscription
    const response = await fetch(
      `${paddleBaseUrl}/subscriptions/${subscription.paddleId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paddleApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          effective_from: 'next_billing_period',
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Paddle cancellation error:', response.status, errorData);
      
      if (response.status === 404 || response.status === 409) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'cancelled',
            cancelledAt: new Date(),
          },
        });

        // Send cancellation email
        if (user?.email) {
          try {
            await sendSubscriptionCancelledEmail(user.email, user.name || '', 'immediately');
            console.log(`Cancellation email sent to ${user.email}`);
          } catch (emailError) {
            console.error('Failed to send cancellation email:', emailError);
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Subscription cancelled.',
          effectiveDate: 'immediately',
        });
      }

      return NextResponse.json(
        { error: 'Failed to cancel subscription. Please try again or contact support.' },
        { status: 500 }
      );
    }

    const paddleResponse = await response.json();
    console.log('Paddle cancellation response:', paddleResponse);

    const currentPeriodEnd = subscription.currentPeriodEnd || new Date();
    
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelledAt: new Date(),
      },
    });

    const formattedDate = currentPeriodEnd.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Send cancellation email
    if (user?.email) {
      try {
        await sendSubscriptionCancelledEmail(user.email, user.name || '', formattedDate);
        console.log(`Cancellation email sent to ${user.email}`);
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Your subscription has been cancelled. You'll continue to have access until ${formattedDate}.`,
      effectiveDate: formattedDate,
      accessUntil: currentPeriodEnd.toISOString(),
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'An error occurred while cancelling your subscription' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}
