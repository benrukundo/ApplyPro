import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const DODO_API_URL = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
  ? 'https://api.dodopayments.com'
  : 'https://test.dodopayments.com';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, planType } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    if (!planType || !['monthly', 'yearly', 'pay-per-use'].includes(planType)) {
      return NextResponse.json({ error: 'Valid plan type required' }, { status: 400 });
    }

    // Determine if this is a subscription or one-time payment
    const isSubscription = planType !== 'pay-per-use';

    // Build the request payload
    const payload: Record<string, any> = {
      customer: {
        email: session.user.email,
        name: session.user.name || session.user.email?.split('@')[0] || 'Customer',
      },
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.applypro.org'}/dashboard?payment=success&plan=${planType}`,
      metadata: {
        user_id: session.user.id,
        plan_type: planType,
        user_email: session.user.email,
      },
    };

    console.log('Creating Dodo checkout:', {
      productId,
      planType,
      userId: session.user.id,
      isSubscription,
    });

    // Create checkout session with Dodo
    const response = await fetch(`${DODO_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dodo checkout error:', response.status, errorText);
      
      let errorMessage = 'Failed to create checkout';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        // Use default error message
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const data = await response.json();
    
    console.log('Dodo checkout created:', {
      paymentId: data.payment_id,
      hasPaymentLink: !!data.payment_link,
    });

    return NextResponse.json({ 
      checkoutUrl: data.payment_link,
      paymentId: data.payment_id,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
