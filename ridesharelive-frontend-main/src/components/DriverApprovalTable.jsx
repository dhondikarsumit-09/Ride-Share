export default function DriverApprovalTable({
  rows,
  onApprove,
  onReject,
  onViewKyc,
  isDark = true,
  loading = false,
  emptyLabel = "No pending approvals",
}) {
  return (
    <section className={`rounded-[1.75rem] border p-5 ${isDark ? "border-slate-800 bg-slate-950/92" : "border-slate-200 bg-white/96"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Driver approvals</p>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-700"}`}>{rows.length} pending</span>
      </div>
      <div className={`mt-4 overflow-hidden rounded-[1.2rem] border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y text-sm ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
            <thead className={isDark ? "bg-slate-900/80 text-left text-slate-400" : "bg-slate-50 text-left text-slate-500"}>
              <tr>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">KYC</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className={isDark ? "divide-y divide-slate-800 text-slate-200" : "divide-y divide-slate-200 text-slate-700"}>
              {loading ? (
                [...Array.from({ length: 4 })].map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td colSpan={5} className="px-4 py-4">
                      <div className={`h-10 animate-pulse rounded-xl ${isDark ? "bg-slate-900" : "bg-slate-100"}`} />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className={`transition ${isDark ? "hover:bg-slate-900/80" : "hover:bg-slate-50"}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.email}</p>
                    </td>
                    <td className="px-4 py-3">{row.city || "-"}</td>
                    <td className="px-4 py-3">{row.vehicleLabel || "-"}</td>
                    <td className="px-4 py-3">{row.kycStatus || "Pending"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => onViewKyc?.(row)} className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${isDark ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"}`}>View KYC</button>
                        <button type="button" onClick={() => onApprove?.(row)} className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">Approve</button>
                        <button type="button" onClick={() => onReject?.(row)} className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-200">Reject</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
