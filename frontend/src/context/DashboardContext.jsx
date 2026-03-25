import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { fetchAnalytics, fetchHistory } from "../services/dashboardService";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const refreshAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
      return data;
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const refreshHistory = useCallback(async (params = {}) => {
    setLoadingHistory(true);
    try {
      const data = await fetchHistory(params);
      setHistory(data);
      return data;
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      analytics,
      history,
      loadingAnalytics,
      loadingHistory,
      refreshAnalytics,
      refreshHistory,
      setHistory,
      setAnalytics,
    }),
    [
      analytics,
      history,
      loadingAnalytics,
      loadingHistory,
      refreshAnalytics,
      refreshHistory,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
