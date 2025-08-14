// src/config/db.js
const mongoose = require("mongoose");

async function connectDB() {
  try {
    const isLive = process.env.MONGODB_SERVER === "live";
    const uri = isLive
      ? process.env.MONGODB_URI_DEV
      : process.env.MONGODB_URI_DEV; // adjust if you have a LIVE URI env

    console.log("MONGO connecting =>", isLive ? "live" : "local");

    await mongoose.connect(uri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // serverSelectionTimeoutMS: 10000,
    });

    console.log("Mongo connected:", isLive ? "live" : "local");

    // DO NOT send profiling commands on managed/shared clusters
    // const db = mongoose.connection.db;
    // await db.command({ profile: 0, slowms: 5000000 });

    return mongoose.connection;
  } catch (err) {
    console.error("Mongo connect error:", err);
    throw err; // let caller decide; avoids nodemon crash loop from process.exit(1)
  }
}

module.exports = connectDB;
