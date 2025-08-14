// src/config/db.js
const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  try {
    // If already connected, return existing connection
    if (isConnected) {
      return mongoose.connection;
    }

    // Always use live environment
    const uri = process.env.MONGODB_URI_DEV;
    console.log("MONGO connecting => live");

    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });

    isConnected = true;
    console.log("Mongo connected: live");

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    return mongoose.connection;
  } catch (err) {
    console.error("Mongo connect error:", err);
    isConnected = false;
    throw err;
  }
}

module.exports = connectDB;
