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

    // Create checkout session with Dodo
    const response = await fetch(`${DODO_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      },
      body: JSON.stringify({
        customer: {
          email: session.user.email,
          name: session.user.name || session.user.email,
        },
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
        payment_link: true,
        return_url: `${process.env.DODO_PAYMENTS_RETURN_URL}?user_id=${session.user.id}&plan=${planType}`,
        metadata: {
          user_id: session.user.id,
          plan_type: planType,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Dodo checkout error:', error);
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({
      checkoutUrl: data.payment_link,
      paymentId: data.payment_id,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
