require('../src/configs/firebaseAdmin');
// app.js
const express = require('express');
const cors = require('cors');
const errorHandler = require('../src/errors/errorHandler');
const routes = require('../src/routes');
const notFound = require('../src/errors/notFound');
const connectDB  = require('../src/configs/db');
const { PORT }   = require('../src/configs');
// Initialize Firebase Admin (will use environment variables on Vercel)


// server.js


const app = express();
app.use(cors({
  origin:'*',
}));

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`🚀 Server listening on port ${PORT}`)
    );
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();

// Basic middleware

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
