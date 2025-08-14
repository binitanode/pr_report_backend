// src/app.js
const express      = require('express');
const cors         = require('cors');
const errorHandler = require('./src/errors/errorHandler'); // <-- fix path
const routes       = require('./src/routes');
const notFound = require('./src/errors/notFound');
require('./src/configs/firebaseAdmin'); 

const app = express();
app.use(cors({
  allowedHeaders: ['Content-Type', 'Authorization','Authorization-Token'],
}));
app.use(express.json({ limit: '10mb' }));

// All API routes prefixed with /api
app.use('/api', routes);

// Global error handler (must come after routes)
app.use(notFound)
app.use(errorHandler);

module.exports = app;
