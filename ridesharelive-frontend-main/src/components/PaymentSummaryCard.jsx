export default function PaymentSummaryCard({ metrics = [], isDark = true }) {
  return (
    <section className={`rounded-[1.75rem] border p-5 ${isDark ? "border-slate-800 bg-slate-950/92" : "border-slate-200 bg-white/96"}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Payments</p>
      <div className="mt-4 grid gap-3">
        {metrics.length === 0 ? (
          <div className={`rounded-[1.2rem] border px-4 py-6 text-center text-sm ${isDark ? "border-slate-800 bg-slate-900/80 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
            No payment metrics.
          </div>
        ) : metrics.map(([label, value]) => (
          <div key={label} className={`flex items-center justify-between rounded-[1.2rem] border px-4 py-3 ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-slate-50"}`}>
            <span className="text-sm text-slate-500">{label}</span>
            <span className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
