// scripts/test-features.js
// Run with: node scripts/test-features.js

const BASE_URL = 'https://www.applypro.org';

async function testEndpoint(name, url, validator) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (validator(data)) {
      console.log(`✅ ${name}: PASSED`);
      return true;
    } else {
      console.log(`❌ ${name}: FAILED - Invalid response`);
      console.log('   Response:', JSON.stringify(data).slice(0, 200));
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: FAILED - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n🧪 ApplyPro Feature Tests\n');
  console.log('='.repeat(50));
  
  const results = [];

  // Test 1: Search API
  results.push(await testEndpoint(
    'Search API - Basic',
    `${BASE_URL}/api/examples/search?q=software`,
    (data) => data.results && Array.isArray(data.results) && data.total !== undefined
  ));

  results.push(await testEndpoint(
    'Search API - With Level Filter',
    `${BASE_URL}/api/examples/search?q=engineer&level=MID`,
    (data) => data.results && Array.isArray(data.results)
  ));

  // Test 2: Skills API
  results.push(await testEndpoint(
    'Skills API - Technical',
    `${BASE_URL}/api/skills?category=technical`,
    (data) => data.popular && Array.isArray(data.popular) && data.popular.length > 0
  ));

  results.push(await testEndpoint(
    'Skills API - Soft Skills',
    `${BASE_URL}/api/skills?category=soft`,
    (data) => data.popular && data.popular.some(s => 
      s.toLowerCase().includes('leadership') || s.toLowerCase().includes('communication')
    )
  ));

  results.push(await testEndpoint(
    'Skills API - Languages',
    `${BASE_URL}/api/skills?category=languages`,
    (data) => data.popular && data.popular.some(s => 
      s.toLowerCase().includes('english') || s.toLowerCase().includes('spanish')
    )
  ));

  results.push(await testEndpoint(
    'Skills API - Certifications',
    `${BASE_URL}/api/skills?category=certifications`,
    (data) => data.popular && data.popular.some(s => 
      s.toLowerCase().includes('aws') || s.toLowerCase().includes('pmp')
    )
  ));

  results.push(await testEndpoint(
    'Skills API - Search',
    `${BASE_URL}/api/skills?q=java&category=technical`,
    (data) => data.results && Array.isArray(data.results)
  ));

  // Test 3: Analytics API
  results.push(await testEndpoint(
    'Analytics Summary API',
    `${BASE_URL}/api/analytics/summary?days=30`,
    (data) => data.summary && data.summary.totalViews !== undefined
  ));

  // Test 4: Example Prefill API
  results.push(await testEndpoint(
    'Example Prefill API',
    `${BASE_URL}/api/examples/prefill?template=software-engineer&category=information-technology`,
    (data) => data.success && data.data && data.data.title
  ));

  // Summary
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the issues above.\n');
  }
}

runTests();
