import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

const DODO_API_URL = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
  ? 'https://live.dodopayments.com'
  : 'https://test.dodopayments.com';

// GET: Fetch customer ID from Dodo by email and update subscription
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // If already has customer ID, return it
    if (subscription.customerId) {
      return NextResponse.json({
        message: 'Customer ID already exists',
        customerId: subscription.customerId,
        subscriptionId: subscription.id,
      });
    }

    // Try to fetch customer from Dodo by listing customers
    console.log('Fetching customers from Dodo...');

    const response = await fetch(`${DODO_API_URL}/customers?email=${encodeURIComponent(session.user.email)}`, {
      headers: {
        'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dodo API error:', response.status, errorText);
      return NextResponse.json({
        error: 'Failed to fetch customer from Dodo',
        details: errorText
      }, { status: 500 });
    }

    const customers = await response.json();
    console.log('Dodo customers response:', JSON.stringify(customers, null, 2));

    // Find customer by email
    const customer = Array.isArray(customers)
      ? customers.find((c: any) => c.email === session.user.email)
      : customers.items?.find((c: any) => c.email === session.user.email);

    if (!customer) {
      return NextResponse.json({
        error: 'Customer not found in Dodo',
        email: session.user.email,
        hint: 'The customer may not exist yet in Dodo, or email does not match'
      }, { status: 404 });
    }

    const customerId = customer.customer_id || customer.id;

    // Update subscription with customer ID
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { customerId },
    });

    return NextResponse.json({
      success: true,
      message: 'Customer ID synced successfully',
      customerId,
      subscriptionId: subscription.id,
    });

  } catch (error) {
    console.error('Sync customer error:', error);
    return NextResponse.json(
      { error: 'Failed to sync customer ID' },
      { status: 500 }
    );
  }
}

// POST: Manually set customer ID
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    // Update user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { customerId },
    });

    return NextResponse.json({
      success: true,
      message: 'Customer ID updated',
      subscriptionId: subscription.id,
      customerId,
    });

  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer ID' },
      { status: 500 }
    );
  }
}
