import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

const DODO_API_URL = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
  ? 'https://live.dodopayments.com'
  : 'https://test.dodopayments.com';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Syncing customer for:', session.user.email);

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
      });
    }

    // Fetch customers from Dodo
    console.log('Fetching customers from Dodo...');
    
    const response = await fetch(`${DODO_API_URL}/customers`, {
      headers: {
        'Authorization': `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dodo API error:', response.status, errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch customers from billing service',
      }, { status: 500 });
    }

    const customersData = await response.json();
    console.log('Dodo response:', JSON.stringify(customersData, null, 2));

    // Find customer by email - handle different response formats
    const customers = customersData.items || customersData.data || customersData;
    
    if (!Array.isArray(customers)) {
      console.error('Unexpected customers format:', typeof customers);
      return NextResponse.json({ 
        error: 'Unexpected response from billing service',
      }, { status: 500 });
    }

    const customer = customers.find(
      (c: any) => c.email?.toLowerCase() === session.user?.email?.toLowerCase()
    );

    if (!customer) {
      return NextResponse.json({ 
        error: 'No billing account found for your email. Please contact support.',
      }, { status: 404 });
    }

    const customerId = customer.customer_id || customer.id;
    console.log('Found customer:', customerId);

    // Update subscription with customer ID
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { customerId },
    });

    return NextResponse.json({
      success: true,
      message: 'Billing synced successfully',
      customerId,
    });

  } catch (error) {
    console.error('Sync customer error:', error);
    return NextResponse.json(
      { error: 'Failed to sync billing information' },
      { status: 500 }
    );
  }
}