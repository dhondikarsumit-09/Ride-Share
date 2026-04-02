import { motion } from "motion/react";
import CountUpNumber from "./CountUpNumber";

function defaultFormatter(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: value >= 100 ? 0 : 1 }).format(value);
}

export default function OverviewStatCard({
  label,
  value,
  tone = "default",
  delay = 0,
  isDark = true,
  delta,
  sparkline = [],
  formatter = defaultFormatter,
  suffix,
}) {
  const tones = {
    default: isDark ? "border-slate-800 bg-slate-950/92 text-slate-50" : "border-slate-200 bg-white/96 text-slate-900",
    cyan: isDark ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-200" : "border-sky-200 bg-sky-50 text-sky-700",
    green: isDark ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" : "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: isDark ? "border-amber-500/20 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-50 text-amber-700",
    rose: isDark ? "border-rose-500/20 bg-rose-500/10 text-rose-200" : "border-rose-200 bg-rose-50 text-rose-700",
  };
  const chartPoints = sparkline.length > 1 ? sparkline : [0, Number(value) || 0];
  const max = Math.max(...chartPoints, 1);
  const min = Math.min(...chartPoints, 0);
  const range = Math.max(max - min, 1);
  const path = chartPoints
    .map((point, index) => {
      const x = (index / (chartPoints.length - 1 || 1)) * 100;
      const y = 100 - ((point - min) / range) * 100;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const deltaTone = delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : isDark ? "text-slate-400" : "text-slate-500";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay }}
      className={`rounded-[1.5rem] border p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${tones[tone] || tones.default}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
          <p className="mt-2 text-2xl font-semibold">
            <CountUpNumber value={Number(value) || 0} formatter={(next) => `${formatter(next)}${suffix || ""}`} />
          </p>
        </div>
        <div className="h-10 w-20">
          <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
            <path
              d={path}
              fill="none"
              stroke={isDark ? "rgba(103,232,249,0.85)" : "rgba(14,165,233,0.85)"}
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
      <p className={`mt-3 text-xs font-medium ${deltaTone}`}>
        {typeof delta === "number" ? `${delta > 0 ? "+" : ""}${delta.toFixed(1)}% vs yesterday` : "Live metric"}
      </p>
    </motion.article>
  );
}
