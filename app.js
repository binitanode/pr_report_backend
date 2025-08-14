// app.js
const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/errors/errorHandler');
const routes = require('./src/routes');
const notFound = require('./src/errors/notFound');

// Initialize Firebase Admin (will use environment variables on Vercel)
try {
  require('./src/configs/firebaseAdmin');
} catch (error) {
  console.log('Firebase Admin initialization skipped:', error.message);
}

const app = express();

// Basic middleware
app.use(cors({
  origin:["pr-report-new.vercel.app"],
  allowedHeaders: ['Content-Type', 'Authorization','Authorization-Token'],
}));
app.use(express.json({ limit: '10mb' }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// All API routes prefixed with /api
app.use('/api', routes);

// Global error handler (must come after routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
