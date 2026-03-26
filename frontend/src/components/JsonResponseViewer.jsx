import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import toast from "react-hot-toast";

export default function JsonResponseViewer({ payload }) {
  const formatted = JSON.stringify(payload ?? {}, null, 2);

  const onCopy = async () => {
    await navigator.clipboard.writeText(formatted);
    toast.success("Response copied");
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Response JSON</h3>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg border border-accent/40 bg-accent/15 px-3 py-1 text-xs text-accent transition hover:bg-accent/25"
        >
          Copy response
        </button>
      </div>
      <SyntaxHighlighter
        language="json"
        style={oneDark}
        wrapLongLines
        wrapLines
        customStyle={{
          margin: 0,
          borderRadius: "10px",
          maxHeight: "360px",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#050607",
        }}
      >
        {formatted}
      </SyntaxHighlighter>
    </div>
  );
}
