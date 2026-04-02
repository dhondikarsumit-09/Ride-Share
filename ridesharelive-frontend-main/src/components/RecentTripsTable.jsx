export default function RecentTripsTable({ rides, isDark = true }) {
  return (
    <section className={`rounded-[1.75rem] border p-5 ${isDark ? "border-slate-800 bg-slate-950/92" : "border-slate-200 bg-white/96"}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Recent trips</p>
      <div className={`mt-4 overflow-hidden rounded-[1.2rem] border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <table className={`min-w-full divide-y text-left text-sm ${isDark ? "divide-slate-800" : "divide-slate-200"}`}>
          <thead className={isDark ? "bg-slate-900/80 text-slate-400" : "bg-slate-50 text-slate-500"}>
            <tr>
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Fare</th>
              <th className="px-4 py-3 font-medium">Payment</th>
            </tr>
          </thead>
          <tbody className={isDark ? "divide-y divide-slate-800 bg-slate-950/60 text-slate-200" : "divide-y divide-slate-200 bg-white text-slate-700"}>
            {rides.length > 0 ? rides.slice(0, 5).map((ride) => (
              <tr key={ride.id} className={`transition ${isDark ? "hover:bg-slate-900/80" : "hover:bg-slate-50"}`}>
                <td className="px-4 py-3">{ride.pickupLocation} to {ride.dropLocation}</td>
                <td className="px-4 py-3">{ride.status}</td>
                <td className="px-4 py-3">INR {ride.fare}</td>
                <td className="px-4 py-3">{ride.paymentMode}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="px-4 py-6 text-center text-slate-500">No recent trips</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
