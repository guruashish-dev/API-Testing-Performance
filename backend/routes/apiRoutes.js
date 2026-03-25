const express = require("express");
const {
  testApi,
  addMonitoredApi,
  getHistory,
  getAnalytics,
} = require("../controllers/apiTestController");

const router = express.Router();

router.post("/test-api", testApi);
router.post("/monitored-apis", addMonitoredApi);
router.get("/history", getHistory);
router.get("/analytics", getAnalytics);

module.exports = router;
