import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { apiRequest } from "../api";
import BookingPanel from "../components/BookingPanel";
import LiveUpdateToast from "../components/LiveUpdateToast";
import RideHistory from "../components/RideHistory";
import RideStatus from "../components/RideStatus";

function sortByNewest(left, right) {
  const leftTime = new Date(left?.createdAt || left?.bookedAt || left?.requestedAt || 0).getTime();
  const rightTime = new Date(right?.createdAt || right?.bookedAt || right?.requestedAt || 0).getTime();
  return rightTime - leftTime;
}

function ActivityButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 5.5v4.5l3 1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="10" r="6.5" />
      </svg>
      Activity
    </button>
  );
}

export default function UserDashboard({ session }) {
  const token = localStorage.getItem("token") || session?.token || "";
  const previousRideCountRef = useRef(0);
  const initializedRef = useRef(false);
  const [liveToast, setLiveToast] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [rides, setRides] = useState([]);
  const [theme, setTheme] = useState(() => (document.documentElement.dataset.theme === "dark-theme" ? "dark" : "light"));
  const [activityOpen, setActivityOpen] = useState(false);

  const fetchRides = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const response = await apiRequest("/rides/history", "GET", null, token);
      const nextRides = Array.isArray(response) ? response : [];
      setRides(nextRides);
      if (!initializedRef.current) {
        initializedRef.current = true;
        previousRideCountRef.current = nextRides.length;
        return;
      }
      if (nextRides.length > previousRideCountRef.current) {
        setLiveToast({ id: Date.now(), message: "New ride update received.", tone: "success" });
      }
      previousRideCountRef.current = nextRides.length;
    } catch (requestError) {
      return requestError;
    }
  }, [token]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme === "dark-theme" ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {}
    );
  }, []);

  const orderedRides = [...rides].sort(sortByNewest);
  const activeRide = orderedRides.find((ride) => ride.status && ride.status !== "COMPLETED" && ride.status !== "CANCELLED") || null;

  return (
    <section className="dashboard-view">
      <LiveUpdateToast toast={liveToast} />
      <div className="mx-auto max-w-7xl space-y-5 px-1 pb-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[1.75rem] border border-slate-200 bg-white px-5 py-4 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.14)] sm:px-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[2rem] font-black tracking-tight text-slate-950">Ride</h1>
              <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Book a ride
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ActivityButton onClick={() => setActivityOpen(true)} />
              <div className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700">
                {String(localStorage.getItem("name") || "P").slice(0, 1)}
              </div>
            </div>
          </div>
        </motion.header>

        <motion.div key="ride-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <BookingPanel onBooked={fetchRides} currentLocation={currentLocation} onCurrentLocationChange={setCurrentLocation} theme={theme} />
        </motion.div>

        {activeRide ? <RideStatus ride={activeRide} onComplete={fetchRides} /> : null}

        <AnimatePresence>
          {activityOpen ? (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActivityOpen(false)}
                className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]"
              />
              <motion.aside
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.22 }}
                className="fixed right-4 top-4 z-50 h-[calc(100vh-2rem)] w-[min(440px,calc(100vw-2rem))] overflow-auto rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">Recent activity</h2>
                    <p className="mt-1 text-sm text-slate-500">Latest rides and updates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivityOpen(false)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Close
                  </button>
                </div>
                <RideHistory rides={orderedRides} title="Recent rides" emptyMessage="No rides yet." autoRefresh={false} />
              </motion.aside>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
