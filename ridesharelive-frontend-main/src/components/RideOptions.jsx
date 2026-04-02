import { motion } from "motion/react";

const OPTIONS = [
  {
    id: "economy",
    label: "Economy",
    subtitle: "Best price",
    etaBoost: "3 min away",
    accent: "from-amber-400 via-orange-400 to-rose-400",
  },
  {
    id: "premium",
    label: "Premium",
    subtitle: "Quiet + comfort",
    etaBoost: "5 min away",
    accent: "from-sky-400 via-cyan-400 to-teal-400",
  },
  {
    id: "xl",
    label: "XL",
    subtitle: "More seats",
    etaBoost: "6 min away",
    accent: "from-slate-700 via-slate-800 to-black",
  },
];

export default function RideOptions({ value, onChange }) {
  return (
    <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
      {OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <motion.button
            key={option.id}
            type="button"
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(option.id)}
            className={`relative min-w-[220px] snap-start overflow-hidden rounded-[1.65rem] border px-4 py-4 text-left transition md:min-w-0 ${
              active
                ? "border-white/70 bg-white/75 shadow-[0_26px_60px_-28px_rgba(14,116,144,0.28)] backdrop-blur-xl"
                : "border-white/60 bg-white/55 hover:border-slate-300 hover:bg-white/75"
            }`}
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${option.accent}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_34%)]" />
            <div className="flex items-start justify-between gap-3">
              <div className="relative z-10">
                <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                <p className="mt-1 text-xs text-slate-500">{option.subtitle}</p>
              </div>
              {active ? (
                <span className="relative z-10 rounded-full border border-emerald-200 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Selected
                </span>
              ) : null}
            </div>
            <p className="relative z-10 mt-5 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {option.etaBoost}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
