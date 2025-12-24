// test-dodo2.js - Testing /checkouts endpoint
const API_KEY = '0TnhOywBWhlE_xj0.pODY_KWrHKjGsLXZ9x3v5_MCPjr6o_3Da4Vvp-61rDbLY9qP';
const BASE_URL = 'https://test.dodopayments.com';
const PRODUCT_ID = 'pdt_0NUighuWKRa5a5ohrz0cJ';

async function createCheckout(productId) {
  console.log(`=== CREATING CHECKOUT FOR: ${productId} ===\n`);
  
  const payload = {
    customer: {
      email: 'test@example.com',
      name: 'Test User',
    },
    product_cart: [
      {
        product_id: productId,
        quantity: 1,
      },
    ],
    return_url: 'https://www.applypro.org/dashboard?payment=success',
    metadata: {
      user_id: 'test_user_123',
      plan_type: 'monthly',
    },
  };

  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/checkouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('\nStatus:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! Checkout URL:', data.checkout_url);
    } else {
      console.log('\n❌ FAILED');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createCheckout(PRODUCT_ID);
