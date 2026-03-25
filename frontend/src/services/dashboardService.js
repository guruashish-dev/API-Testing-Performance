import apiClient from "./apiClient";

export const runApiTest = async (payload) => {
  const { data } = await apiClient.post("/test-api", payload);
  return data;
};

export const addMonitoredApi = async (payload) => {
  const { data } = await apiClient.post("/monitored-apis", payload);
  return data;
};

export const fetchHistory = async (params = {}) => {
  const { data } = await apiClient.get("/history", { params });
  return data;
};

export const fetchAnalytics = async () => {
  const { data } = await apiClient.get("/analytics");
  return data;
};
