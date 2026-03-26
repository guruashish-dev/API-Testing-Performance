const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const apiRoutes = require("./routes/apiRoutes");

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const localhostRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const vercelRegex = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools and configured frontend origins.
      if (!origin || allowedOrigins.includes(origin) || localhostRegex.test(origin) || vercelRegex.test(origin)) {
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

module.exports = app;