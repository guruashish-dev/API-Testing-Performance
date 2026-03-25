const ApiTest = require("../models/ApiTest");
const MonitoredApi = require("../models/MonitoredApi");
const { executeApiTest } = require("../services/apiTestService");
const { validateUrl } = require("../utils/validateUrl");

function normalizeMethod(method = "GET") {
  return String(method).toUpperCase();
}

async function testApi(req, res) {
  try {
    const { url, method = "GET", headers = {}, body = null } = req.body;

    if (!url || !validateUrl(url)) {
      return res.status(400).json({
        message: "Invalid URL. Please provide a valid http/https endpoint.",
      });
    }

    const normalizedMethod = normalizeMethod(method);
    if (!["GET", "POST"].includes(normalizedMethod)) {
      return res.status(400).json({
        message: "Only GET and POST methods are supported.",
      });
    }

    const result = await executeApiTest({
      url,
      method: normalizedMethod,
      headers,
      body,
    });

    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to test API" });
  }
}

async function addMonitoredApi(req, res) {
  try {
    const { url, method = "GET", headers = {}, body = null } = req.body;

    if (!url || !validateUrl(url)) {
      return res.status(400).json({
        message: "Invalid URL. Please provide a valid http/https endpoint.",
      });
    }

    const normalizedMethod = normalizeMethod(method);

    const monitoredApi = await MonitoredApi.findOneAndUpdate(
      { url },
      {
        $set: {
          method: normalizedMethod,
          headers,
          body: normalizedMethod === "POST" ? body : null,
          isActive: true,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const initialResult = await executeApiTest({
      url: monitoredApi.url,
      method: monitoredApi.method,
      headers: monitoredApi.headers,
      body: monitoredApi.body,
      addedAsMonitored: true,
    });

    return res.status(201).json({ monitoredApi, initialResult });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to add monitored API" });
  }
}

async function getHistory(req, res) {
  try {
    const { status = "all", sort = "desc" } = req.query;

    const filter = {};
    if (status === "success") {
      filter.success = true;
    } else if (status === "failure") {
      filter.success = false;
    } else if (status === "slow") {
      filter.isSlow = true;
    }

    const history = await ApiTest.find(filter)
      .sort({ createdAt: sort === "asc" ? 1 : -1 })
      .lean();

    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch history" });
  }
}

async function getAnalytics(req, res) {
  try {
    const [
      totals,
      responseTimeTrend,
      methodPerformance,
      statusDistribution,
      slowAlerts,
      latestTests,
      allTests,
    ] = await Promise.all([
      ApiTest.aggregate([
        {
          $group: {
            _id: null,
            totalTests: { $sum: 1 },
            successCount: {
              $sum: {
                $cond: [{ $eq: ["$success", true] }, 1, 0],
              },
            },
            avgResponseTime: { $avg: "$responseTimeMs" },
          },
        },
      ]),
      ApiTest.aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M",
                date: "$createdAt",
              },
            },
            avgResponseTime: { $avg: "$responseTimeMs" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      ApiTest.aggregate([
        {
          $group: {
            _id: "$url",
            avgResponseTime: { $avg: "$responseTimeMs" },
            totalCalls: { $sum: 1 },
            successRate: {
              $avg: {
                $cond: ["$success", 1, 0],
              },
            },
          },
        },
        { $sort: { avgResponseTime: -1 } },
        { $limit: 10 },
      ]),
      ApiTest.aggregate([
        {
          $group: {
            _id: "$success",
            count: { $sum: 1 },
          },
        },
      ]),
      ApiTest.find({ isSlow: true }).sort({ createdAt: -1 }).limit(6).lean(),
      ApiTest.find().sort({ createdAt: -1 }).limit(8).lean(),
      ApiTest.find().sort({ createdAt: -1 }).limit(500).lean(),
    ]);

    const summary = totals[0] || { totalTests: 0, successCount: 0, avgResponseTime: 0 };
    const successRate = summary.totalTests
      ? Number(((summary.successCount / summary.totalTests) * 100).toFixed(2))
      : 0;

    const apiMap = new Map();
    allTests.forEach((item) => {
      if (!apiMap.has(item.url)) {
        apiMap.set(item.url, []);
      }
      apiMap.get(item.url).push(item);
    });

    const apiBreakdown = Array.from(apiMap.entries())
      .map(([url, tests]) => {
        const totalCalls = tests.length;
        const successCount = tests.filter((test) => test.success).length;
        const slowCount = tests.filter((test) => test.isSlow).length;
        const totalResponseTime = tests.reduce((sum, test) => sum + test.responseTimeMs, 0);
        const latestRun = tests[0] || null;

        return {
          url,
          totalCalls,
          successRate: totalCalls ? Number(((successCount / totalCalls) * 100).toFixed(2)) : 0,
          avgResponseTime: totalCalls ? Number((totalResponseTime / totalCalls).toFixed(2)) : 0,
          slowCount,
          lastStatusCode: latestRun?.statusCode || 0,
          lastCheckedAt: latestRun?.createdAt || null,
          trend: tests
            .slice(0, 20)
            .reverse()
            .map((test) => ({
              timestamp: new Date(test.createdAt).toLocaleTimeString(),
              responseTimeMs: test.responseTimeMs,
              statusCode: test.statusCode,
              success: test.success,
            })),
          recentRuns: tests.slice(0, 5).map((test) => ({
            _id: test._id,
            responseTimeMs: test.responseTimeMs,
            statusCode: test.statusCode,
            success: test.success,
            isSlow: test.isSlow,
            createdAt: test.createdAt,
          })),
        };
      })
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime);

    return res.status(200).json({
      summary: {
        totalTests: summary.totalTests,
        successRate,
        avgResponseTime: Number((summary.avgResponseTime || 0).toFixed(2)),
        slowAlerts: slowAlerts.length,
      },
      responseTimeTrend: responseTimeTrend.map((item) => ({
        timestamp: item._id,
        avgResponseTime: Number(item.avgResponseTime.toFixed(2)),
      })),
      methodPerformance: methodPerformance.map((item) => ({
        url: item._id,
        avgResponseTime: Number(item.avgResponseTime.toFixed(2)),
        totalCalls: item.totalCalls,
        successRate: Number((item.successRate * 100).toFixed(2)),
      })),
      statusDistribution: {
        success: statusDistribution.find((i) => i._id === true)?.count || 0,
        failure: statusDistribution.find((i) => i._id === false)?.count || 0,
      },
      apiBreakdown,
      slowAlerts,
      latestTests,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch analytics" });
  }
}

module.exports = {
  testApi,
  addMonitoredApi,
  getHistory,
  getAnalytics,
};
