import { useEffect, useState } from "react";
import HistoryTable from "../components/HistoryTable";
import Loader from "../components/Loader";
import { useDashboard } from "../context/DashboardContext";

export default function HistoryPage() {
  const { history, loadingHistory, refreshHistory } = useDashboard();
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    refreshHistory({ status: statusFilter, sort: sortOrder }).catch(() => {});
  }, [refreshHistory, statusFilter, sortOrder]);

  const filteredRows = history.filter((item) =>
    item.url.toLowerCase().includes(searchText.trim().toLowerCase())
  );

  const exportCsv = () => {
    const headers = ["URL", "Method", "Status", "Response Time (ms)", "Timestamp"];
    const rows = filteredRows.map((item) => [
      item.url,
      item.method,
      item.success ? "Success" : "Failure",
      item.responseTimeMs,
      new Date(item.createdAt).toISOString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `api-history-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-panelSoft/80 p-4">
        <h2 className="text-lg font-semibold">API Test History</h2>
        <div className="flex flex-wrap gap-2">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search URL..."
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="slow">Slow APIs</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-accent/35 bg-accent/15 px-3 py-2 text-sm text-accent transition hover:bg-accent/25"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loadingHistory ? <Loader label="Loading history" /> : <HistoryTable rows={filteredRows} />}
    </section>
  );
}
