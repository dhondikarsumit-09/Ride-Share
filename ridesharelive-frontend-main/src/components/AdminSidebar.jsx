import { motion } from "motion/react";

export default function AdminSidebar({
  items,
  activeItem,
  onSelect,
  isDark = true,
  collapsed = false,
  onClose,
}) {
  return (
    <aside className={`flex h-full flex-col rounded-[1.9rem] border p-4 ${isDark ? "border-slate-800 bg-slate-950/92" : "border-slate-200 bg-white/96"}`}>
      <div className="flex items-center justify-between px-2">
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Operations</p>
          {!collapsed ? <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Control tower</p> : null}
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className={`rounded-full border px-2 py-1 text-xs ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}>
            Close
          </button>
        ) : null}
      </div>
      <nav className="mt-4 space-y-1">
        {items.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            whileHover={{ x: 2 }}
            onClick={() => onSelect(item.id)}
            className={`flex w-full items-center justify-between rounded-[1.1rem] px-3 py-3 text-left text-sm font-medium transition ${
              activeItem === item.id
                ? isDark
                  ? "bg-cyan-400/10 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.2)]"
                  : "bg-sky-50 text-sky-700 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.15)]"
                : isDark
                  ? "text-slate-300 hover:bg-slate-900"
                  : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className={`h-2 w-2 rounded-full ${activeItem === item.id ? (isDark ? "bg-cyan-300" : "bg-sky-500") : isDark ? "bg-slate-700" : "bg-slate-300"}`} />
              <span>{item.label}</span>
            </span>
            {item.badge ? (
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${activeItem === item.id ? (isDark ? "bg-cyan-400/10 text-cyan-100" : "bg-sky-100 text-sky-700") : isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                {item.badge}
              </span>
            ) : null}
          </motion.button>
        ))}
      </nav>
      <div className={`mt-auto rounded-[1.3rem] border px-3 py-3 text-xs ${isDark ? "border-slate-800 bg-slate-900/80 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
        Live queues sync over WebSocket. Actions persist to admin APIs.
      </div>
    </aside>
  );
}
