const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const apiRoutes = require("./routes/apiRoutes");
const { startScheduler, stopScheduler } = require("./services/schedulerService");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools and configured frontend origins.
      if (!origin || allowedOrigins.includes(origin) || localhostRegex.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS: Origin not allowed"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "api-monitor-backend" });
});

app.use("/api", apiRoutes);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    message: error.message || "Unexpected server error",
  });
});

async function startServer() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it in backend/.env");
  }

  await mongoose.connect(MONGODB_URI);

  app.listen(PORT, () => {
    startScheduler();
    console.log(`Backend server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  stopScheduler();
  process.exit(1);
});

process.on("SIGINT", () => {
  stopScheduler();
  process.exit(0);
});
