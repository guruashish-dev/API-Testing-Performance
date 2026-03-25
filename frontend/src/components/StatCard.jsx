export default function StatCard({ title, value, helper, tone = "default", trend = "" }) {
  const toneClasses = {
    default: "border-white/10",
    success: "border-success/30 bg-success/5",
    danger: "border-danger/30 bg-danger/5",
    accent: "border-accent/35 bg-accent/5",
  };

  return (
    <article className={`rounded-2xl border bg-panelSoft/80 p-5 shadow-soft transition hover:-translate-y-0.5 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-textMuted">{title}</p>
        {trend ? <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-textMuted">{trend}</span> : null}
      </div>
      <p className="mt-2 font-display text-3xl text-text">{value}</p>
      {helper ? <p className="mt-2 text-xs text-textMuted">{helper}</p> : null}
    </article>
  );
}
