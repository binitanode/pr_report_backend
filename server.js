// server.js
const app = require('./app'); // <-- use app.js, not create new express()
const connectDB  = require('./src/configs/db');
const { PORT }   = require('./src/configs');

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
