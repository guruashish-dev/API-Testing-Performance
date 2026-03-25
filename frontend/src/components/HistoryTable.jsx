function statusChip(test) {
  if (test.isSlow) {
    return <span className="rounded-full bg-accent/20 px-2 py-1 text-xs text-accent">Slow</span>;
  }
  if (test.success) {
    return <span className="rounded-full bg-success/20 px-2 py-1 text-xs text-success">Success</span>;
  }
  return <span className="rounded-full bg-danger/20 px-2 py-1 text-xs text-danger">Failure</span>;
}

export default function HistoryTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-panelSoft/70">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 text-textMuted">
          <tr>
            <th className="px-4 py-3 font-medium">URL</th>
            <th className="px-4 py-3 font-medium">Method</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Response Time</th>
            <th className="px-4 py-3 font-medium">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={item._id} className="border-b border-white/5 hover:bg-white/5">
              <td className="max-w-xs truncate px-4 py-3">{item.url}</td>
              <td className="px-4 py-3">{item.method}</td>
              <td className="px-4 py-3">{statusChip(item)}</td>
              <td className={item.success ? "px-4 py-3 text-success" : "px-4 py-3 text-danger"}>{item.statusCode || "ERR"}</td>
              <td className="px-4 py-3">{item.responseTimeMs} ms</td>
              <td className="px-4 py-3 text-textMuted">{new Date(item.createdAt).toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-textMuted">
                No records found for the selected filter.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
