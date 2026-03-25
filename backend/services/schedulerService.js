const MonitoredApi = require("../models/MonitoredApi");
const { executeApiTest } = require("./apiTestService");
const { AUTO_TEST_INTERVAL_SECONDS } = require("../utils/constants");

let schedulerRef = null;

async function runCycle() {
  const targets = await MonitoredApi.find({ isActive: true }).lean();

  await Promise.allSettled(
    targets.map((api) =>
      executeApiTest({
        url: api.url,
        method: api.method,
        headers: api.headers,
        body: api.body,
        addedAsMonitored: true,
      })
    )
  );
}

function startScheduler() {
  if (!AUTO_TEST_INTERVAL_SECONDS || AUTO_TEST_INTERVAL_SECONDS <= 0) {
    return;
  }

  const intervalMs = AUTO_TEST_INTERVAL_SECONDS * 1000;
  schedulerRef = setInterval(() => {
    runCycle().catch(() => {
      // Intentionally suppress errors to keep scheduler alive.
    });
  }, intervalMs);
}

function stopScheduler() {
  if (schedulerRef) {
    clearInterval(schedulerRef);
    schedulerRef = null;
  }
}

module.exports = {
  runCycle,
  startScheduler,
  stopScheduler,
};
