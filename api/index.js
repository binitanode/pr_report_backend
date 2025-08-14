// api/index.js
const serverless = require('serverless-http'); // npm i serverless-http
const app = require('../src/app');

module.exports = (req, res) => serverless(app)(req, res);
