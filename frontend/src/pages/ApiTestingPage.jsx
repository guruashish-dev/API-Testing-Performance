import { useState } from "react";
import toast from "react-hot-toast";
import JsonResponseViewer from "../components/JsonResponseViewer";
import Loader from "../components/Loader";
import { useDashboard } from "../context/DashboardContext";
import { addMonitoredApi, runApiTest } from "../services/dashboardService";

function safeJsonParse(value, fallback) {
  if (!value.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error("Invalid JSON format");
  }
}

const initialState = {
  url: "",
  method: "GET",
  headersText: "{}",
  bodyText: "{}",
};

const quickPresets = [
  {
    label: "JSON Placeholder Post",
    value: {
      url: "https://jsonplaceholder.typicode.com/posts/1",
      method: "GET",
      headersText: "{}",
      bodyText: "{}",
    },
  },
  {
    label: "GitHub Public API",
    value: {
      url: "https://api.github.com",
      method: "GET",
      headersText: "{}",
      bodyText: "{}",
    },
  },
];

export default function ApiTestingPage() {
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addingMonitor, setAddingMonitor] = useState(false);
  const { refreshAnalytics, refreshHistory } = useDashboard();

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildPayload = () => {
    if (!form.url.trim()) {
      throw new Error("URL is required");
    }

    const headers = safeJsonParse(form.headersText, {});
    const body = form.method === "POST" ? safeJsonParse(form.bodyText, {}) : null;

    return {
      url: form.url.trim(),
      method: form.method,
      headers,
      body,
    };
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = buildPayload();
      const data = await runApiTest(payload);
      setResult(data);
      toast.success("API request completed");
      await Promise.all([refreshAnalytics(), refreshHistory()]);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const onMonitor = async () => {
    setAddingMonitor(true);
    try {
      const payload = buildPayload();
      const data = await addMonitoredApi(payload);
      setResult(data.initialResult);
      toast.success("API added to monitoring and tested");
      await Promise.all([refreshAnalytics(), refreshHistory()]);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to add monitored API");
    } finally {
      setAddingMonitor(false);
    }
  };

  const applyPreset = (preset) => {
    setForm(preset.value);
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-panelSoft/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">API Testing Panel</h2>
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-1 text-[11px] text-accent">
            Secure Request Sandbox
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="rounded-lg border border-white/15 bg-black/25 px-3 py-1 text-xs text-textMuted transition hover:border-accent/40 hover:text-text"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-2 block text-sm text-textMuted">URL</label>
          <input
            name="url"
            value={form.url}
            onChange={onChange}
            placeholder="https://api.example.com/v1/resource"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-textMuted">Method</label>
          <select
            name="method"
            value={form.method}
            onChange={onChange}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-textMuted">Headers (JSON)</label>
          <textarea
            name="headersText"
            value={form.headersText}
            onChange={onChange}
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring"
          />
        </div>

        {form.method === "POST" ? (
          <div>
            <label className="mb-2 block text-sm text-textMuted">Body (JSON)</label>
            <textarea
              name="bodyText"
              value={form.bodyText}
              onChange={onChange}
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-accent/40 transition focus:ring"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
          <button
            type="button"
            onClick={onMonitor}
            disabled={addingMonitor}
            className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {addingMonitor ? "Adding..." : "Add & Auto Test"}
          </button>
        </div>

        {(loading || addingMonitor) && <Loader label="Running API check" />}

        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-textMuted">
          Enterprise tip: use Add & Auto Test for endpoints that should be continuously tracked in the monitoring pipeline.
        </div>
      </form>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-panelSoft/80 p-5">
        <h2 className="text-lg font-semibold">Response Output</h2>
        {result ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs text-textMuted">Status Code</p>
                <p className={result.success ? "text-success" : "text-danger"}>{result.statusCode || "ERR"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                <p className="text-xs text-textMuted">Response Time</p>
                <p className={result.isSlow ? "text-accent" : "text-text"}>{result.responseTimeMs} ms</p>
              </div>
            </div>
            <JsonResponseViewer payload={result.responseData || { error: result.errorMessage || "No data" }} />
          </>
        ) : (
          <p className="text-sm text-textMuted">Run a test to inspect full response details.</p>
        )}
      </div>
    </section>
  );
}
