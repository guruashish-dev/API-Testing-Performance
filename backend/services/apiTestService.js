const axios = require("axios");
const ApiTest = require("../models/ApiTest");
const { DEFAULT_TIMEOUT_MS, SLOW_API_THRESHOLD_MS } = require("../utils/constants");

async function executeApiTest(payload) {
  const {
    url,
    method = "GET",
    headers = {},
    body = null,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    addedAsMonitored = false,
  } = payload;

  const startedAt = Date.now();
  let statusCode = 0;
  let responseData = null;
  let errorMessage = "";

  try {
    const response = await axios({
      url,
      method,
      headers,
      data: method === "POST" ? body : undefined,
      timeout: timeoutMs,
      validateStatus: () => true,
    });

    statusCode = response.status;
    responseData = response.data;
  } catch (error) {
    errorMessage = error.code === "ECONNABORTED" ? "Request timed out" : error.message;
    if (error.response) {
      statusCode = error.response.status;
      responseData = error.response.data;
    }
  }

  const responseTimeMs = Date.now() - startedAt;
  const success = statusCode >= 200 && statusCode < 300;
  const isSlow = responseTimeMs > SLOW_API_THRESHOLD_MS;

  const savedResult = await ApiTest.create({
    url,
    method,
    requestHeaders: headers,
    requestBody: method === "POST" ? body : null,
    statusCode,
    responseTimeMs,
    isSlow,
    success,
    responseData,
    errorMessage,
    addedAsMonitored,
  });

  return savedResult;
}

module.exports = {
  executeApiTest,
};
