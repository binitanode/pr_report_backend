const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:7777';
const TEST_GRID_ID = 'test-grid-123'; // Replace with an actual grid_id from your database
const TEST_EMAIL = 'test@example.com'; // Replace with an actual email

// Test cases
async function testVerifyUrl() {
  console.log('🧪 Testing verifyURL functionality...\n');
  
  try {
    // Test 1: Verify URL without email (should work for public reports)
    console.log('📋 Test 1: Verify URL without email');
    try {
      const response1 = await axios.get(`${BASE_URL}/api/pr-distributions/verifyPRReportUrl?grid_id=${TEST_GRID_ID}`);
      console.log('✅ Success:', response1.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Verify URL with email
    console.log('📋 Test 2: Verify URL with email');
    try {
      const response2 = await axios.get(`${BASE_URL}/api/pr-distributions/verifyPRReportUrl?grid_id=${TEST_GRID_ID}&email=${TEST_EMAIL}`);
      console.log('✅ Success:', response2.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Verify URL with invalid grid_id
    console.log('📋 Test 3: Verify URL with invalid grid_id');
    try {
      const response3 = await axios.get(`${BASE_URL}/api/pr-distributions/verifyPRReportUrl?grid_id=invalid-grid-id`);
      console.log('✅ Success:', response3.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 4: Verify URL without grid_id
    console.log('📋 Test 4: Verify URL without grid_id');
    try {
      const response4 = await axios.get(`${BASE_URL}/api/pr-distributions/verifyPRReportUrl`);
      console.log('✅ Success:', response4.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('🚨 Test execution failed:', error.message);
  }
}

// Run tests
testVerifyUrl();

