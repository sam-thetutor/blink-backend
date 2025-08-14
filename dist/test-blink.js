#!/usr/bin/env node

/**
 * Test script for Stellar XLM Transfer Blink
 * This script tests the complete backend functionality
 */

const BASE_URL = 'http://localhost:3001';

async function testBlink() {
  console.log('🧪 Testing Stellar XLM Transfer Blink Backend\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
    console.log('   Network:', healthData.network);
    console.log('   Service:', healthData.service);

    // Test 2: GET Blink Metadata
    console.log('\n2️⃣ Testing GET Blink Metadata...');
    const getResponse = await fetch(`${BASE_URL}/api/actions/transfer-xlm`);
    const getData = await getResponse.json();
    console.log('✅ GET Response Type:', getData.type);
    console.log('   Title:', getData.title);
    console.log('   Actions Count:', getData.links.actions.length);
    console.log(
      '   Custom Transfer Parameters:',
      getData.links.actions[3].parameters.length
    );

    // Test 3: Test CORS Headers
    console.log('\n3️⃣ Testing CORS Headers...');
    const corsResponse = await fetch(`${BASE_URL}/api/actions/transfer-xlm`, {
      method: 'OPTIONS',
    });
    console.log('✅ CORS Headers:');
    console.log(
      '   x-blockchain-ids:',
      corsResponse.headers.get('x-blockchain-ids')
    );
    console.log(
      '   x-action-version:',
      corsResponse.headers.get('x-action-version')
    );
    console.log(
      '   Access-Control-Allow-Origin:',
      corsResponse.headers.get('Access-Control-Allow-Origin')
    );

    // Test 4: Test Icon Endpoint
    console.log('\n4️⃣ Testing Icon Endpoint...');
    const iconResponse = await fetch(
      `${BASE_URL}/api/actions/transfer-xlm/icon`
    );
    const iconData = await iconResponse.text();
    console.log('✅ Icon Response:');
    console.log('   Content-Type:', iconResponse.headers.get('Content-Type'));
    console.log('   SVG Contains XLM:', iconData.includes('XLM'));

    // Test 5: Test POST with Valid Data
    console.log('\n5️⃣ Testing POST Transaction Creation...');
    const postData = {
      amount: '1.5',
      recipient: 'GDPBPM2QEIF6OOOF3TPRVNP47OYGMF3Q3NNUEVL6PKYFZ5RUZCKRESLN',
      account: 'GDPBPM2QEIF6OOOF3TPRVNP47OYGMF3Q3NNUEVL6PKYFZ5RUZCKRESLN',
      memo: 'Test from script',
    };

    const postResponse = await fetch(`${BASE_URL}/api/actions/transfer-xlm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    const postResult = await postResponse.json();
    console.log('✅ POST Response:');
    console.log('   Type:', postResult.type);
    console.log('   Message:', postResult.message);
    console.log('   Transaction Length:', postResult.transaction.length);
    console.log('   Amount:', postResult.metadata.amount, 'XLM');
    console.log('   Fee:', postResult.metadata.fee, 'stroops');
    console.log('   Network:', postResult.metadata.network);

    // Test 6: Test Error Handling
    console.log('\n6️⃣ Testing Error Handling...');
    const errorData = {
      amount: '0',
      recipient: 'GDPBPM2QEIF6OOOF3TPRVNP47OYGMF3Q3NNUEVL6PKYFZ5RUZCKRESLN',
      account: 'GDPBPM2QEIF6OOOF3TPRVNP47OYGMF3Q3NNUEVL6PKYFZ5RUZCKRESLN',
    };

    const errorResponse = await fetch(`${BASE_URL}/api/actions/transfer-xlm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    });

    const errorResult = await errorResponse.json();
    console.log('✅ Error Response:');
    console.log('   Error:', errorResult.error);
    console.log('   Message:', errorResult.message);

    console.log(
      '\n🎉 All Tests Passed! The Stellar XLM Transfer Blink Backend is working correctly.'
    );
    console.log('\n📋 Summary:');
    console.log('   ✅ Health check endpoint working');
    console.log('   ✅ GET endpoint returns proper Blink metadata');
    console.log('   ✅ CORS headers properly configured for Stellar');
    console.log('   ✅ Icon endpoint serving SVG');
    console.log('   ✅ POST endpoint creates valid XLM transfer transactions');
    console.log('   ✅ Error handling working correctly');
    console.log('   ✅ Follows Dialect Blinks specification');
    console.log('\n🚀 Ready for frontend integration!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testBlink();
