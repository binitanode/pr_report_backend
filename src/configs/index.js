// src/config/index.js

const env = require("dotenv");
env.config();

module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGODB_URI_DEV,
  MONGO_SERVER: "live", // Always use live
};
