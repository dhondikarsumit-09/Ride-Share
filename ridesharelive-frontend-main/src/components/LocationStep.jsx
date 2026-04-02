import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

function FieldShell({ children, focused }) {
  return (
    <motion.div
      animate={{
        boxShadow: focused ? "0 0 0 4px rgba(15,23,42,0.07)" : "0 0 0 0 rgba(15,23,42,0)",
        borderColor: focused ? "rgba(15,23,42,0.45)" : "rgba(226,232,240,1)",
      }}
      transition={{ duration: 0.18 }}
      className="rounded-[1.4rem] border bg-white"
    >
      {children}
    </motion.div>
  );
}

function SuggestionList({ items, onSelect }) {
  if (!items.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-[1.2rem] border border-slate-200 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)]"
    >
      {items.map((item) => (
        <button key={item} type="button" onClick={() => onSelect(item)} className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 last:border-b-0">
          {item}
        </button>
      ))}
    </motion.div>
  );
}

export default function LocationStep({
  pickup,
  drop,
  pickupLandmark,
  dropLandmark,
  pickupRef,
  requestingLocation,
  locationSuccess,
  suggestionsOpenFor,
  filteredPickupSuggestions,
  filteredDropSuggestions,
  mapSelectionTarget,
  loadingEstimate,
  pickupSummary,
  dropSummary,
  mapPinMode,
  onPickupChange,
  onDropChange,
  onPickupFocus,
  onDropFocus,
  onPickupLandmarkChange,
  onDropLandmarkChange,
  onRequestCurrentLocation,
  onPickupSuggestionSelect,
  onDropSuggestionSelect,
}) {
  const [focusedField, setFocusedField] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="space-y-5">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-950">Where to?</h3>
        <p className="mt-2 text-sm text-slate-500">{loadingEstimate ? "Checking route." : "Set pickup and destination."}</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="booking-pickup" className="mb-2 block text-sm font-semibold text-slate-700">Pickup</label>
          <FieldShell focused={focusedField === "pickup"}>
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-950" />
              <input
                ref={pickupRef}
                id="booking-pickup"
                type="text"
                value={pickup}
                onFocus={() => {
                  setFocusedField("pickup");
                  onPickupFocus();
                }}
                onBlur={() => window.setTimeout(() => setFocusedField(""), 120)}
                onChange={(event) => onPickupChange(event.target.value)}
                placeholder="Pickup location"
                className="w-full bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>
          </FieldShell>
          <SuggestionList items={suggestionsOpenFor === "pickup" && pickup.trim() ? filteredPickupSuggestions : []} onSelect={onPickupSuggestionSelect} />
        </div>

        <div className="relative">
          <label htmlFor="booking-drop" className="mb-2 block text-sm font-semibold text-slate-700">Destination</label>
          <FieldShell focused={focusedField === "drop"}>
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <input
                id="booking-drop"
                type="text"
                value={drop}
                onFocus={() => {
                  setFocusedField("drop");
                  onDropFocus();
                }}
                onBlur={() => window.setTimeout(() => setFocusedField(""), 120)}
                onChange={(event) => onDropChange(event.target.value)}
                placeholder="Where to?"
                className="w-full bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>
          </FieldShell>
          <SuggestionList items={suggestionsOpenFor === "drop" && drop.trim() ? filteredDropSuggestions : []} onSelect={onDropSuggestionSelect} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onRequestCurrentLocation}
          className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
            locationSuccess ? "bg-slate-100 text-slate-700" : "bg-slate-950 text-white shadow-[0_14px_24px_-18px_rgba(15,23,42,0.5)]"
          }`}
        >
          {requestingLocation ? "Locating..." : locationSuccess ? "Location added" : "Use My Location"}
        </motion.button>
        <button type="button" onClick={() => setNotesOpen((value) => !value)} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
          Add notes
        </button>
      </div>

      <AnimatePresence initial={false}>
        {notesOpen ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="grid gap-4 pt-1">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Pickup note</label>
                <FieldShell focused={focusedField === "pickup-landmark"}>
                  <div className="px-4 py-4">
                    <input type="text" value={pickupLandmark} onFocus={() => setFocusedField("pickup-landmark")} onBlur={() => setFocusedField("")} onChange={(event) => onPickupLandmarkChange(event.target.value)} placeholder="Gate, landmark, stop" className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" />
                  </div>
                </FieldShell>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Drop note</label>
                <FieldShell focused={focusedField === "drop-landmark"}>
                  <div className="px-4 py-4">
                    <input type="text" value={dropLandmark} onFocus={() => setFocusedField("drop-landmark")} onBlur={() => setFocusedField("")} onChange={(event) => onDropLandmarkChange(event.target.value)} placeholder="Office, school, stop" className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400" />
                  </div>
                </FieldShell>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {mapPinMode ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[{ title: "Pickup pin", data: pickupSummary }, { title: "Drop pin", data: dropSummary }].map((item) => (
            <div key={item.title} className="rounded-[1.2rem] bg-slate-50 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.title}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{item.data?.label || `Select ${mapSelectionTarget} on map`}</p>
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
