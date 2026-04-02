import { MapContainer, Marker, Popup, TileLayer, CircleMarker, Polyline } from "react-leaflet";

const INDIA_CENTER = [20.5937, 78.9629];

function buildRouteLine(ride) {
  if (typeof ride.driverLat !== "number" || typeof ride.driverLon !== "number") {
    return [];
  }
  return [
    [ride.driverLat, ride.driverLon],
    [ride.driverLat + 0.03, ride.driverLon + 0.04],
  ];
}

export default function LiveRideMapCard({ mapData, isDark = true }) {
  const hasMapData = Boolean(mapData?.drivers?.length || mapData?.rides?.length || mapData?.sosAlerts?.length);

  return (
    <section className={`relative overflow-hidden rounded-[1.75rem] border p-5 ${isDark ? "border-slate-800 bg-slate-950/92" : "border-slate-200 bg-white/96"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Live operations</p>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className={`rounded-full px-2 py-1 ${isDark ? "bg-slate-900 text-slate-300" : "bg-slate-100 text-slate-700"}`}>{mapData?.drivers?.length || 0} drivers</span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-300">{mapData?.rides?.length || 0} rides</span>
          <span className="rounded-full bg-rose-500/10 px-2 py-1 text-rose-300">{mapData?.sosAlerts?.length || 0} SOS</span>
        </div>
      </div>
      <div className={`mt-4 overflow-hidden rounded-[1.4rem] border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        {!hasMapData ? (
          <div className={`grid h-72 place-items-center text-sm ${isDark ? "bg-slate-900 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
            Live map data unavailable.
          </div>
        ) : (
          <div className="h-72">
            <MapContainer center={INDIA_CENTER} zoom={5} scrollWheelZoom={false} className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {(mapData?.drivers || []).map((driver) => (
                <CircleMarker
                  key={`driver-${driver.id}`}
                  center={[driver.latitude, driver.longitude]}
                  radius={7}
                  pathOptions={{ color: driver.online ? "#22d3ee" : "#94a3b8", fillOpacity: 0.7 }}
                >
                  <Popup>{driver.name} {driver.zone ? `• ${driver.zone}` : ""}</Popup>
                </CircleMarker>
              ))}
              {(mapData?.rides || []).map((ride) => (
                <Polyline key={`ride-${ride.id}`} positions={buildRouteLine(ride)} pathOptions={{ color: "#22c55e", weight: 3, opacity: 0.8 }}>
                  <Popup>{ride.pickup} → {ride.destination}</Popup>
                </Polyline>
              ))}
              {(mapData?.sosAlerts || []).map((alert, index) => (
                <Marker key={alert.id} position={[20.6 + index * 0.12, 78.9 + index * 0.15]}>
                  <Popup>{alert.title}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>
    </section>
  );
}
