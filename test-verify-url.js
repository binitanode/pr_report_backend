// Test script to verify health endpoint
const app = require('./app');

// Test the health endpoint
const testHealth = () => {
  const req = {
    method: 'GET',
    path: '/api/health',
    headers: {}
  };
  
  const res = {
    status: (code) => {
      console.log(`Response status: ${code}`);
      return res;
    },
    json: (data) => {
      console.log('Response data:', data);
    }
  };
  
  app(req, res, () => {});
};

console.log('Testing health endpoint...');
testHealth();

