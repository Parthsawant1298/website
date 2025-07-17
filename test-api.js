// test-api.js
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🚀 Testing analyze-all-reviews API...');
    
    const response = await fetch('http://localhost:3000/api/admin/analyze-all-reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log('❌ API Response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error body:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ API Test Error:', error);
  }
}

testAPI();
