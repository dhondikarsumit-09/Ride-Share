import { motion } from "motion/react";

export default function EarningsCard({ label, value, tone = "default", delay = 0, isDark = true }) {
  const toneClasses = {
    default: isDark ? "border-slate-800 bg-slate-950/92 text-slate-50" : "border-slate-200 bg-white/96 text-slate-900",
    success: isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" : "border-emerald-200 bg-emerald-50 text-emerald-700",
    cyan: isDark ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-200" : "border-sky-200 bg-sky-50 text-sky-700",
    amber: isDark ? "border-amber-500/20 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay }}
      className={`rounded-[1.5rem] border p-4 ${toneClasses[tone] || toneClasses.default}`}
    >
      <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </motion.article>
  );
}
