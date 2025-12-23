import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const DODO_API_URL = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
  ? 'https://api.dodopayments.com'
  : 'https://test.dodopayments.com';

export async function POST(request: NextRequest) {
  console.log('=== DODO CHECKOUT REQUEST ===');
  
  try {
    // Check if API key is configured
    if (!process.env.DODO_PAYMENTS_API_KEY) {
      console.error('DODO_PAYMENTS_API_KEY is not set');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Verify authentication
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.id ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, planType } = body;

    console.log('Request body:', { productId, planType });
    console.log('Environment:', process.env.DODO_PAYMENTS_ENVIRONMENT);
    console.log('API URL:', DODO_API_URL);

    if (!productId) {
      console.error('No product ID provided');
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    if (!planType || !['monthly', 'yearly', 'pay-per-use'].includes(planType)) {
      console.error('Invalid plan type:', planType);
      return NextResponse.json({ error: 'Valid plan type required' }, { status: 400 });
    }

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

    // Add billing information for subscriptions
    if (isSubscription) {
      payload.billing = {
        city: 'Not Provided',
        country: 'US',
        state: 'Not Provided',
        street: 'Not Provided',
        zipcode: '00000',
      };
    }

    console.log('Sending to Dodo:', JSON.stringify(payload, null, 2));

    // Create checkout session with Dodo
    const response = await fetch(`${DODO_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('Dodo response status:', response.status);
    console.log('Dodo response body:', responseText);

    if (!response.ok) {
      console.error('Dodo API error:', response.status, responseText);
      
      let errorMessage = 'Failed to create checkout';
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const data = JSON.parse(responseText);
    
    console.log('Checkout created successfully:', {
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
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Add GET for testing
export async function GET() {
  return NextResponse.json({
    status: 'Dodo checkout endpoint active',
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT,
    apiKeySet: !!process.env.DODO_PAYMENTS_API_KEY,
    monthlyProductId: process.env.NEXT_PUBLIC_DODO_PRICE_MONTHLY || 'NOT SET',
    yearlyProductId: process.env.NEXT_PUBLIC_DODO_PRICE_YEARLY || 'NOT SET',
    payPerUseProductId: process.env.NEXT_PUBLIC_DODO_PRICE_PAY_PER_USE || 'NOT SET',
  });
}