import { motion } from "motion/react";

export default function PaymentStep({ options, selectedPayment, onSelect, fareEstimate, rideLabel }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="space-y-5">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-950">Payment</h3>
        <p className="mt-2 text-sm text-slate-500">Choose one.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const selected = option.id === selectedPayment;
          return (
            <motion.button key={option.id} type="button" whileTap={{ scale: 0.98 }} onClick={() => onSelect(option.id)} className={`rounded-[1.4rem] border px-4 py-4 text-left transition ${selected ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}>
              <span className="block text-base font-semibold">{option.label}</span>
            </motion.button>
          );
        })}
      </div>
      <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Ride</p>
            <p className="mt-1 text-base font-semibold text-slate-950">{rideLabel}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Fare</p>
            <p className="mt-1 text-base font-semibold text-slate-950">{fareEstimate ? `INR ${fareEstimate}` : "Fare loading"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
