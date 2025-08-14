// api/index.js
const serverless = require('serverless-http');
const app = require('../src/app');
const dbConnect = require('../src/configs/db'); // <-- we'll create this

let handler; // cache serverless handler between invocations

module.exports = async (req, res) => {
  // Ensure DB is connected before handling the request
  await dbConnect();
  if (!handler) handler = serverless(app);
  return handler(req, res);
};
