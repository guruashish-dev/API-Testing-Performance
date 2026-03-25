export default function Loader({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-3 text-sm text-textMuted">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent/40 border-t-accent" />
      <span>{label}...</span>
    </div>
  );
}
