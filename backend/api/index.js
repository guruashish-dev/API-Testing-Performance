const mongoose = require("mongoose");
const app = require("../app");

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
      })
      .then((instance) => instance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = async function handler(req, res) {
  // Keep platform health checks responsive even when MongoDB is unavailable.
  if (req.url === "/health") {
    return app(req, res);
  }

  if (!MONGODB_URI) {
    return res.status(500).json({ message: "MONGODB_URI is missing" });
  }

  try {
    await connectToDatabase();
  } catch (error) {
    cached.promise = null;
    return res.status(503).json({
      message: "Database connection failed. In MongoDB Atlas, allow network access (0.0.0.0/0) and verify DB user/password.",
    });
  }

  return app(req, res);
};