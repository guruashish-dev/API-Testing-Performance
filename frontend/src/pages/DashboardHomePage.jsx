import { useEffect, useMemo, useState } from "react";
import { useDashboard } from "../context/DashboardContext";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";

export default function DashboardHomePage() {
  const { analytics, loadingAnalytics, refreshAnalytics } = useDashboard();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const latestIncident = useMemo(() => analytics?.slowAlerts?.[0] || null, [analytics]);

  useEffect(() => {
    refreshAnalytics().catch(() => {});
  }, [refreshAnalytics]);

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const intervalRef = setInterval(() => {
      refreshAnalytics().catch(() => {});
    }, 15000);

    return () => clearInterval(intervalRef);
  }, [autoRefresh, refreshAnalytics]);

  const summary = analytics?.summary || {
    totalTests: 0,
    successRate: 0,
    avgResponseTime: 0,
    slowAlerts: 0,
  };

  if (loadingAnalytics && !analytics) {
    return <Loader label="Loading dashboard" />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-panelSoft/75 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-textMuted">Operations Control</p>
          <h2 className="text-lg font-semibold">Global Endpoint Health</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refreshAnalytics().catch(() => {})}
            className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-xs text-text transition hover:border-white/30"
          >
            Refresh now
          </button>
          <button
            type="button"
            onClick={() => setAutoRefresh((prev) => !prev)}
            className={`rounded-lg border px-3 py-2 text-xs transition ${
              autoRefresh
                ? "border-success/40 bg-success/15 text-success"
                : "border-white/15 bg-black/20 text-textMuted"
            }`}
          >
            Auto refresh: {autoRefresh ? "On" : "Off"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total APIs Tested" value={summary.totalTests} helper="Across all historical runs" trend="+12% weekly" />
        <StatCard
          title="Success Rate"
          value={`${summary.successRate}%`}
          helper="HTTP 2xx responses"
          tone="success"
          trend="SLO aligned"
        />
        <StatCard
          title="Avg Response Time"
          value={`${summary.avgResponseTime} ms`}
          helper="Mean latency across tests"
          tone="accent"
          trend="Latency index"
        />
        <StatCard
          title="Slow API Alerts"
          value={summary.slowAlerts}
          helper="Threshold exceeded (>1000ms)"
          tone={summary.slowAlerts > 0 ? "danger" : "default"}
          trend={summary.slowAlerts > 0 ? "Action needed" : "Stable"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-panelSoft/80 p-5">
          <h2 className="text-lg font-semibold">Latest Tests</h2>
          <div className="mt-4 space-y-3">
            {analytics?.latestTests?.length ? (
              analytics.latestTests.map((item) => (
                <article
                  key={item._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="max-w-[720px] truncate text-sm text-text">{item.url}</p>
                    <p className="text-xs text-textMuted">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="rounded bg-white/10 px-2 py-1">{item.method}</span>
                    <span className={item.success ? "text-success" : "text-danger"}>{item.statusCode || "ERR"}</span>
                    <span className={item.isSlow ? "text-accent animate-pulseSlow" : "text-textMuted"}>
                      {item.responseTimeMs} ms
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-textMuted">No tests yet. Start from API Testing.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-accent/20 bg-gradient-to-b from-accent/10 to-transparent p-5">
          <h2 className="font-semibold text-accent">Incident Briefing</h2>
          {latestIncident ? (
            <div className="mt-3 space-y-2 text-sm">
              <p className="rounded bg-black/25 px-3 py-2 text-text">{latestIncident.url}</p>
              <p className="text-textMuted">Latest response time: <span className="text-accent">{latestIncident.responseTimeMs}ms</span></p>
              <p className="text-textMuted">Detected at: {new Date(latestIncident.createdAt).toLocaleString()}</p>
            </div>
          ) : (
            <p className="mt-3 text-textMuted">No active incidents. All monitored endpoints are healthy.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
        <h2 className="text-lg font-semibold text-accent">Slow API Alerts</h2>
        <div className="mt-4 space-y-3">
          {analytics?.slowAlerts?.length ? (
            analytics.slowAlerts.map((item) => (
              <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-black/25 px-3 py-2 text-sm">
                <p className="max-w-[900px] truncate text-textMuted">{item.url}</p>
                <p className="text-accent">{item.responseTimeMs}ms</p>
              </div>
            ))
          ) : (
            <p className="text-textMuted">No slow API alerts at the moment.</p>
          )}
        </div>
      </div>
    </section>
  );
}
