// src/routes/index.js
const express = require('express');
const prDist = require('./prDistributionRoute');
const authRoute = require('./authRoute');
const roleRoute = require('./roleRoute');  

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint for debugging
router.get('/test', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Test endpoint working',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

router.use('/pr-distributions', prDist);
router.use('/auth', authRoute);
router.use('/roles', roleRoute); 

module.exports = router;
