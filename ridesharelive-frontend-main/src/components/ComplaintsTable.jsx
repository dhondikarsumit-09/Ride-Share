export default function ComplaintsTable({ rows, onResolve, onEscalate, onAssign, isDark = true, loading = false }) {
  return (
    <section className={`rounded-[1.75rem] border p-5 ${isDark ? "border-slate-800 bg-slate-950/92" : "border-slate-200 bg-white/96"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Complaints</p>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-700"}`}>{rows.length} items</span>
      </div>
      <div className="mt-4 space-y-2">
        {loading ? (
          [...Array.from({ length: 4 })].map((_, index) => (
            <div key={`complaint-skeleton-${index}`} className={`h-20 animate-pulse rounded-[1.2rem] ${isDark ? "bg-slate-900" : "bg-slate-100"}`} />
          ))
        ) : rows.length === 0 ? (
          <div className={`rounded-[1.2rem] border px-4 py-6 text-center text-sm ${isDark ? "border-slate-800 bg-slate-900/80 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
            No complaints found.
          </div>
        ) : rows.map((row) => (
          <div key={row.id} className={`rounded-[1.2rem] border px-4 py-3 text-sm ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`font-medium ${isDark ? "text-slate-100" : "text-slate-900"}`}>{row.subject}</p>
                  <span className="rounded-full bg-rose-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-300">{row.status}</span>
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">{row.severity}</span>
                </div>
                <p className="mt-1 text-slate-500">{row.owner}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => onResolve?.(row)} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">Resolve</button>
                <button type="button" onClick={() => onEscalate?.(row)} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">Escalate</button>
                <button type="button" onClick={() => onAssign?.(row)} className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "border-slate-700 bg-slate-950 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}>Assign</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
