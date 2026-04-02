import { AnimatePresence, motion } from "motion/react";

export default function AlertPanel({
  alerts,
  onAcknowledge,
  onResolve,
  onEscalate,
  onOpen,
  isDark = true,
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Alerts</p>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-700"}`}>{alerts.length} live</span>
      </div>
      <AnimatePresence initial={false}>
        {alerts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`rounded-[1.4rem] border p-4 text-sm ${isDark ? "border-slate-800 bg-slate-950/92 text-slate-400" : "border-slate-200 bg-white/96 text-slate-500"}`}
          >
            No live alerts.
          </motion.div>
        ) : alerts.map((alert, index) => (
          <motion.article
            key={alert.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, boxShadow: alert.severity === "CRITICAL" ? ["0 0 0 rgba(251,191,36,0)", "0 0 0 1px rgba(251,191,36,0.18)", "0 0 0 rgba(251,191,36,0)"] : "none" }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, delay: index * 0.04, boxShadow: { duration: 1.8, repeat: Infinity } }}
            className={`rounded-[1.4rem] border p-4 ${alert.severity === "CRITICAL" ? (isDark ? "border-amber-500/20 bg-amber-500/10" : "border-amber-200 bg-amber-50") : (isDark ? "border-slate-800 bg-slate-950/92" : "border-slate-200 bg-white/96")}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{alert.title}</p>
                <p className="mt-1 text-sm text-slate-500">{alert.subtitle}</p>
              </div>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${alert.severity === "CRITICAL" ? "bg-rose-500/15 text-rose-300" : isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-700"}`}>{alert.severity}</span>
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => onOpen?.(alert)} className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${isDark ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"}`}>Details</button>
              <button type="button" onClick={() => onEscalate?.(alert)} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-200">Escalate</button>
              <button type="button" onClick={() => onResolve?.(alert)} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">Resolve</button>
              <button type="button" onClick={() => onAcknowledge?.(alert)} className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${isDark ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"}`}>Acknowledge</button>
            </div>
          </motion.article>
        ))}
      </AnimatePresence>
    </section>
  );
}
