import { motion } from "motion/react";

export default function RideRequestCard({ request, onAccept, onReject, accepting, disabled, isDark = true }) {
  if (!request) {
    return (
      <article className={`rounded-[1.75rem] border p-5 ${isDark ? "border-slate-800 bg-slate-950/92" : "border-slate-200 bg-white/96"}`}>
        <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Incoming request</p>
        <div className={`mt-4 rounded-[1.4rem] border border-dashed p-5 text-sm ${isDark ? "border-slate-700 bg-slate-900/70 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
          No request in queue.
        </div>
      </article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0, boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 0 1px rgba(34,211,238,0.18)", "0 0 0 rgba(34,211,238,0)"] }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1], boxShadow: { duration: 1.8, repeat: Infinity } }}
      className={`rounded-[1.75rem] border p-5 ${isDark ? "border-cyan-400/20 bg-slate-950/92" : "border-sky-200 bg-white/96"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Incoming request</p>
          <h3 className={`mt-2 text-xl font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{request.riderName || "Rider nearby"}</h3>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isDark ? "bg-amber-400/15 text-amber-300" : "bg-amber-50 text-amber-700"}`}>
          New
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className={`rounded-[1.3rem] border p-4 ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-slate-50"}`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Pickup</p>
          <p className={`mt-2 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{request.pickupLocation}</p>
        </div>
        <div className={`rounded-[1.3rem] border p-4 ${isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-200 bg-slate-50"}`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Drop</p>
          <p className={`mt-2 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{request.dropLocation}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className={`rounded-[1.2rem] px-4 py-3 ${isDark ? "bg-slate-900/80" : "bg-slate-50"}`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Distance</p>
          <p className={`mt-1 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{request.distanceKm || 6} km</p>
        </div>
        <div className={`rounded-[1.2rem] px-4 py-3 ${isDark ? "bg-slate-900/80" : "bg-slate-50"}`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Fare</p>
          <p className={`mt-1 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>INR {request.fare}</p>
        </div>
        <div className={`rounded-[1.2rem] px-4 py-3 ${isDark ? "bg-slate-900/80" : "bg-slate-50"}`}>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Pay</p>
          <p className={`mt-1 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{request.paymentMode}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAccept}
          disabled={accepting || disabled}
          className="rounded-[1.2rem] bg-[linear-gradient(135deg,#06b6d4,#22c55e)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-24px_rgba(34,211,238,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {accepting ? "Accepting..." : "Accept Ride"}
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ x: [-1, 1, -1, 0] }}
          transition={{ duration: 0.22 }}
          onClick={onReject}
          className={`rounded-[1.2rem] border px-5 py-3 text-sm font-semibold ${isDark ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : "border-rose-200 bg-rose-50 text-rose-700"}`}
        >
          Reject
        </motion.button>
      </div>
    </motion.article>
  );
}
