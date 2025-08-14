// api/index.js
const serverless = require('serverless-http');
const app = require('../app');

let handler;
let dbConnected = false;

module.exports = async (req, res) => {
  try {
    // Initialize handler only once
    if (!handler) {
      handler = serverless(app);
    }
    
    // Handle the request
    return await handler(req, res);
  } catch (error) {
    console.error('Vercel function error:', error);
    
    // Return a proper error response
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
};
