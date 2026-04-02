import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { fetchRouteSummary, geocodePlace, resolvePickupCoordinate, reverseGeocodeCoordinate } from "../utils/routing";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

const DEFAULT_CENTER = [20.5937, 78.9629];
const userIcon = new L.DivIcon({ className: "rideshare-map-marker rideshare-map-marker--user", html: '<span class="rideshare-map-marker__dot"></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
const pickupIcon = new L.DivIcon({ className: "rideshare-map-marker rideshare-map-marker--pickup", html: '<span class="rideshare-map-marker__dot"></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
const dropIcon = new L.DivIcon({ className: "rideshare-map-marker rideshare-map-marker--drop", html: '<span class="rideshare-map-marker__dot"></span>', iconSize: [18, 18], iconAnchor: [9, 9] });

function MapViewport({ points, center }) {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(points, { padding: [40, 40] });
      return;
    }
    map.setView(center, 11);
  }, [center, map, points]);
  return null;
}

function MapSelectionHandler({ enabled, onSelect }) {
  useMapEvents({
    click(event) {
      if (!enabled || !onSelect) return;
      onSelect({ lat: event.latlng.lat, lon: event.latlng.lng });
    },
  });
  return null;
}

function toPointArray(selection) {
  if (!selection || typeof selection.lat !== "number" || typeof selection.lon !== "number") return null;
  return [selection.lat, selection.lon];
}

export default function CompactMap({
  pickup,
  drop,
  pickupCoordinate,
  dropCoordinate,
  currentLocation,
  onMapLocationSelect,
  onRouteResolved,
  selectionTarget = "drop",
  theme = "light",
  heightClass = "h-[300px] sm:h-[340px] lg:h-[360px]",
}) {
  const [pickupPoint, setPickupPoint] = useState(null);
  const [dropPoint, setDropPoint] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [selectionStatus, setSelectionStatus] = useState("");

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const loadRoute = async () => {
      const normalizedPickup = pickup?.trim();
      const normalizedDrop = drop?.trim();
      if ((!normalizedPickup && !pickupCoordinate) || (!normalizedDrop && !dropCoordinate)) {
        setPickupPoint(toPointArray(pickupCoordinate));
        setDropPoint(toPointArray(dropCoordinate));
        setRoutePath([]);
        onRouteResolved?.(null);
        return;
      }

      try {
        const nextPickup =
          pickupCoordinate ||
          resolvePickupCoordinate(normalizedPickup, currentLocation) ||
          (normalizedPickup ? await geocodePlace(normalizedPickup, controller.signal, { referenceLocation: currentLocation }) : null);

        const nextDrop =
          dropCoordinate ||
          (normalizedDrop ? await geocodePlace(normalizedDrop, controller.signal, { referenceLocation: nextPickup || currentLocation }) : null);

        if (!active) return;
        setPickupPoint(toPointArray(nextPickup));
        setDropPoint(toPointArray(nextDrop));

        if (nextPickup && nextDrop) {
          try {
            const route = await fetchRouteSummary(nextPickup, nextDrop, controller.signal);
            if (active && Array.isArray(route.path) && route.path.length > 1) {
              setRoutePath(route.path);
              onRouteResolved?.({
                pickup: nextPickup,
                drop: nextDrop,
                distanceKm: route.distanceKm,
                durationMin: route.durationMin,
                path: route.path,
              });
            } else if (active) {
              setRoutePath([[nextPickup.lat, nextPickup.lon], [nextDrop.lat, nextDrop.lon]]);
              onRouteResolved?.({
                pickup: nextPickup,
                drop: nextDrop,
                distanceKm: null,
                durationMin: null,
                path: [[nextPickup.lat, nextPickup.lon], [nextDrop.lat, nextDrop.lon]],
              });
            }
          } catch {
            if (active) {
              setRoutePath([[nextPickup.lat, nextPickup.lon], [nextDrop.lat, nextDrop.lon]]);
              onRouteResolved?.({
                pickup: nextPickup,
                drop: nextDrop,
                distanceKm: null,
                durationMin: null,
                path: [[nextPickup.lat, nextPickup.lon], [nextDrop.lat, nextDrop.lon]],
              });
            }
          }
        } else {
          setRoutePath([]);
          onRouteResolved?.(null);
        }
      } catch {
        if (active) {
          setPickupPoint(toPointArray(pickupCoordinate));
          setDropPoint(toPointArray(dropCoordinate));
          setRoutePath([]);
          onRouteResolved?.(null);
        }
      }
    };

    loadRoute();
    return () => {
      active = false;
      controller.abort();
    };
  }, [currentLocation, drop, dropCoordinate, onRouteResolved, pickup, pickupCoordinate]);

  const center = useMemo(() => {
    if (pickupPoint) return pickupPoint;
    if (dropPoint) return dropPoint;
    if (currentLocation?.lat && currentLocation?.lon) return [currentLocation.lat, currentLocation.lon];
    return DEFAULT_CENTER;
  }, [currentLocation, dropPoint, pickupPoint]);

  const viewportPoints = useMemo(() => {
    if (routePath.length > 1) return routePath;
    if (pickupPoint && dropPoint) return [pickupPoint, dropPoint];
    return [pickupPoint, dropPoint].filter(Boolean);
  }, [dropPoint, pickupPoint, routePath]);

  const tileUrl = theme === "dark" ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const handleMapSelect = async ({ lat, lon }) => {
    if (!onMapLocationSelect) return;
    try {
      const selection = await reverseGeocodeCoordinate(lat, lon);
      onMapLocationSelect({ ...selection, target: selectionTarget });
      setSelectionStatus(`${selectionTarget === "pickup" ? "Pickup" : "Drop"} pinned`);
      window.setTimeout(() => setSelectionStatus(""), 1800);
    } catch {
      setSelectionStatus("Try another point");
      window.setTimeout(() => setSelectionStatus(""), 1600);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="relative overflow-hidden rounded-[1.6rem] bg-white">
      {selectionStatus ? (
        <div className="absolute left-4 top-4 z-[500] rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm">
          {selectionStatus}
        </div>
      ) : null}
      <div className={`${heightClass} w-full`}>
        <MapContainer center={center} zoom={11} zoomControl={false} attributionControl={false} className="h-full w-full">
          <TileLayer url={tileUrl} />
          <MapViewport points={viewportPoints} center={center} />
          <MapSelectionHandler enabled={Boolean(onMapLocationSelect)} onSelect={handleMapSelect} />
          {currentLocation?.lat && currentLocation?.lon ? <Marker position={[currentLocation.lat, currentLocation.lon]} icon={userIcon}><Tooltip direction="top" offset={[0, -8]}>You</Tooltip></Marker> : null}
          {pickupPoint ? <Marker position={pickupPoint} icon={pickupIcon}><Tooltip direction="top" offset={[0, -8]}>Pickup</Tooltip></Marker> : null}
          {dropPoint ? <Marker position={dropPoint} icon={dropIcon}><Tooltip direction="top" offset={[0, -8]}>Drop</Tooltip></Marker> : null}
          {routePath.length > 1 ? <Polyline positions={routePath} pathOptions={{ color: "#0f172a", weight: 5, opacity: 0.85 }} /> : null}
        </MapContainer>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 flex gap-2">
        {pickupPoint ? <span className="rounded-full bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm">Pickup</span> : null}
        {dropPoint ? <span className="rounded-full bg-white/88 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700 shadow-sm">Drop</span> : null}
      </div>
    </motion.div>
  );
}
