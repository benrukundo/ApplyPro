// test-dodo.js
// Run with: node test-dodo.js

const API_KEY = '0TnhOywBWhlE_xj0.pODY_KWrHKjGsLXZ9x3v5_MCPjr6o_3Da4Vvp-61rDbLY9qP'; // Replace with your Dodo API key
const PRODUCT_ID = 'pdt_0NUighuWKRa5a5ohrz0cJ';

async function testDodoAPI() {
  console.log('Testing Dodo Payments API...\n');
  
  const payload = {
    billing: {
      city: 'Test',
      country: 'US',
      state: 'CA',
      street: '123 Test St',
      zipcode: 12345,
    },
    customer: {
      email: 'test@example.com',
      name: 'Test User',
    },
    product_cart: [
      {
        product_id: PRODUCT_ID,
        quantity: 1,
      },
    ],
    payment_link: true,
  };

  console.log('Request payload:', JSON.stringify(payload, null, 2));
  console.log('\nSending to: https://test.dodopayments.com/payments\n');

  try {
    const response = await fetch('https://test.dodopayments.com/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.text();
    
    console.log('Response status:', response.status);
    console.log('Response body:', data);
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! Payment link created.');
    } else {
      console.log('\n❌ FAILED. Check the error above.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testDodoAPI();
