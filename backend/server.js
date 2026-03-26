const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { startScheduler, stopScheduler } = require("./services/schedulerService");
const app = require("./app");

dotenv.config();

const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI;

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
