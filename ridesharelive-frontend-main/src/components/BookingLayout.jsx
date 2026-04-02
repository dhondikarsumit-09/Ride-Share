import { motion } from "motion/react";

export default function BookingLayout({ leftContent, rightContent, footer }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_28px_80px_-48px_rgba(15,23,42,0.2)]"
    >
      <div className="grid xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
        <div className="relative min-h-[620px] bg-white px-5 py-6 pb-28 sm:px-6">{leftContent}</div>
        <aside className="border-t border-slate-200 bg-slate-50/50 px-5 py-6 sm:px-6 xl:border-l xl:border-t-0">{rightContent}</aside>
      </div>
      <div className="sticky bottom-0 border-t border-slate-200/80 bg-white/96 px-5 py-4 backdrop-blur sm:px-6">{footer}</div>
    </motion.section>
  );
}
