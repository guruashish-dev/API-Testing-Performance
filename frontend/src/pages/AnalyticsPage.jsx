import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import Loader from "../components/Loader";
import { useDashboard } from "../context/DashboardContext";

const chartColors = {
  accent: "#ffd54a",
  success: "#41d392",
  danger: "#ff6b6b",
  axis: "#93a0b2",
};

export default function AnalyticsPage() {
  const { analytics, loadingAnalytics, refreshAnalytics } = useDashboard();
  const [expandedApi, setExpandedApi] = useState("");

  useEffect(() => {
    refreshAnalytics().catch(() => {});
  }, [refreshAnalytics]);

  const apiBreakdown = analytics?.apiBreakdown || [];
  const selectedApi = useMemo(
    () => apiBreakdown.find((item) => item.url === expandedApi) || apiBreakdown[0] || null,
    [apiBreakdown, expandedApi]
  );

  const onBarClick = (state) => {
    if (state?.activeLabel) {
      setExpandedApi(state.activeLabel);
    }
  };

  if (loadingAnalytics && !analytics) {
    return <Loader label="Loading analytics" />;
  }

  const statusData = [
    { name: "Success", value: analytics?.statusDistribution?.success || 0, color: chartColors.success },
    { name: "Failure", value: analytics?.statusDistribution?.failure || 0, color: chartColors.danger },
  ];

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <article className="rounded-2xl border border-white/10 bg-panelSoft/80 p-4">
        <h3 className="mb-4 text-lg font-semibold">Response Time Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.responseTimeTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b313d" />
              <XAxis dataKey="timestamp" stroke={chartColors.axis} tick={{ fontSize: 11 }} />
              <YAxis stroke={chartColors.axis} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgResponseTime" stroke={chartColors.accent} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-white/10 bg-panelSoft/80 p-4">
        <h3 className="mb-4 text-lg font-semibold">Success vs Failure</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={100}>
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-white/10 bg-panelSoft/80 p-4 xl:col-span-2">
        <h3 className="mb-4 text-lg font-semibold">API Performance Comparison</h3>
        <div className="h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.methodPerformance || []} onClick={onBarClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2b313d" />
              <XAxis dataKey="url" stroke={chartColors.axis} tick={{ fontSize: 10 }} interval={0} angle={-15} height={70} />
              <YAxis stroke={chartColors.axis} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgResponseTime" fill={chartColors.accent} />
              <Bar dataKey="successRate" fill={chartColors.success} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-textMuted">Tip: click a bar or API row below to expand advanced analysis.</p>
      </article>

      <article className="rounded-2xl border border-white/10 bg-panelSoft/80 p-4 xl:col-span-2">
        <h3 className="mb-4 text-lg font-semibold">Per API Advanced Analysis</h3>

        {apiBreakdown.length ? (
          <div className="space-y-3">
            {apiBreakdown.map((api) => {
              const isExpanded = selectedApi?.url === api.url;
              return (
                <div key={api.url} className="rounded-xl border border-white/10 bg-black/20">
                  <button
                    type="button"
                    onClick={() => setExpandedApi(api.url)}
                    className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text">{api.url}</p>
                      <p className="text-xs text-textMuted">Last check: {api.lastCheckedAt ? new Date(api.lastCheckedAt).toLocaleString() : "N/A"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="rounded bg-white/10 px-2 py-1">Calls: {api.totalCalls}</span>
                      <span className="rounded bg-success/15 px-2 py-1 text-success">Success: {api.successRate}%</span>
                      <span className="rounded bg-accent/15 px-2 py-1 text-accent">Avg: {api.avgResponseTime}ms</span>
                    </div>
                  </button>

                  {isExpanded ? (
                    <div className="grid gap-4 border-t border-white/10 p-4 lg:grid-cols-2">
                      <div className="h-64 rounded-xl border border-white/10 bg-black/25 p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={api.trend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2b313d" />
                            <XAxis dataKey="timestamp" stroke={chartColors.axis} tick={{ fontSize: 10 }} />
                            <YAxis stroke={chartColors.axis} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="responseTimeMs"
                              stroke={chartColors.accent}
                              strokeWidth={2}
                              dot={{ r: 2 }}
                              name="Response Time (ms)"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                        <p className="mb-3 text-sm font-semibold">Recent Runs</p>
                        <div className="space-y-2">
                          {(api.recentRuns || []).map((run) => (
                            <div
                              key={run._id}
                              className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs"
                            >
                              <span className="text-textMuted">{new Date(run.createdAt).toLocaleString()}</span>
                              <span className={run.success ? "text-success" : "text-danger"}>{run.statusCode || "ERR"}</span>
                              <span className={run.isSlow ? "text-accent" : "text-text"}>{run.responseTimeMs}ms</span>
                            </div>
                          ))}
                          {!api.recentRuns?.length ? <p className="text-xs text-textMuted">No recent runs found.</p> : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-textMuted">No API-level data available yet.</p>
        )}
      </article>
    </section>
  );
}
