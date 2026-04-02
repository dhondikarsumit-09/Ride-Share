import openLocationCodePackage from "open-location-code";

const INDIA_COUNTRY_CODE = "in";
const LIVE_PICKUP_LABEL = "Current Live Location";
const { OpenLocationCode } = openLocationCodePackage;
const openLocationCode = new OpenLocationCode();
const KNOWN_LOCATION_OVERRIDES = [
  {
    keys: ["multai", "multai mp", "multai madhya pradesh"],
    lat: 21.77095,
    lon: 78.2543497,
    label: "Multai, Betul, Madhya Pradesh",
    village: "Multai",
    landmark: "Multai",
    nearbyVillageNames: ["Chandora Khurd", "Parmandal", "Jaulkhera"],
    sourceType: "city",
    sourceProvider: "local-catalog",
  },
  {
    keys: ["chandora khurd", "chandora khurd multai", "chandora khurd betul"],
    lat: 21.7923049,
    lon: 78.2726596,
    label: "Chandora Khurd, Multai, Betul",
    village: "Chandora Khurd",
    landmark: "Chandora Khurd",
    nearbyVillageNames: ["Multai", "Parmandal", "Jaulkhera"],
    sourceType: "village",
    sourceProvider: "local-catalog",
  },
  {
    keys: ["parmandal", "parmandal multai", "parmandal betul"],
    lat: 21.8060822,
    lon: 78.2421162,
    label: "Parmandal, Multai, Betul",
    village: "Parmandal",
    landmark: "Parmandal",
    nearbyVillageNames: ["Multai", "Chandora Khurd", "Jaulkhera"],
    sourceType: "village",
    sourceProvider: "local-catalog",
  },
  {
    keys: ["jaulkhera", "jaulkhera multai", "jaulkhera betul"],
    lat: 21.7364,
    lon: 78.3005,
    label: "Jaulkhera, Multai, Betul",
    village: "Jaulkhera",
    landmark: "Jaulkhera",
    nearbyVillageNames: ["Multai", "Chandora Khurd", "Parmandal"],
    sourceType: "village",
    sourceProvider: "local-catalog",
  },
];

function normalizeCoordinate(lat, lon) {
  const nextLat = Number(lat);
  const nextLon = Number(lon);
  if (!Number.isFinite(nextLat) || !Number.isFinite(nextLon)) {
    return null;
  }
  return { lat: nextLat, lon: nextLon };
}

function parseCoordinateInput(query) {
  const match = String(query || "")
    .trim()
    .match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) {
    return null;
  }
  return normalizeCoordinate(match[1], match[2]);
}

function dedupeStrings(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function normalizeLocationKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/,\s*india$/, "")
    .replace(/,\s*madhya pradesh$/, "")
    .replace(/,\s*betul$/, "")
    .replace(/,\s*multai$/, "")
    .trim();
}

function extractNearbyVillageNames(address = {}) {
  return dedupeStrings([
    address.hamlet,
    address.village,
    address.suburb,
    address.locality,
    address.town,
    address.city_district,
    address.county,
    address.state_district,
  ]).slice(0, 4);
}

function buildLandmark(address = {}) {
  return dedupeStrings([
    address.house_number ? `${address.house_number} ${address.road || ""}` : "",
    address.road,
    address.neighbourhood,
    address.allotments,
    address.farm,
    address.isolated_dwelling,
    address.industrial,
    address.commercial,
    address.amenity,
    address.shop,
    address.tourism,
    address.leisure,
    address.aeroway,
    address.highway,
  ])[0] || "";
}

function buildVillageLabel(address = {}) {
  return dedupeStrings([
    address.hamlet,
    address.village,
    address.locality,
    address.suburb,
    address.town,
    address.city,
    address.county,
    address.state_district,
    address.state,
  ])[0] || "";
}

function formatCoordinateLabel(coordinate) {
  return `${coordinate.lat.toFixed(5)}, ${coordinate.lon.toFixed(5)}`;
}

function encodePlusCode(lat, lon) {
  try {
    return openLocationCode.encode(lat, lon, 10);
  } catch {
    return "";
  }
}

function decodePlusCode(query, referenceLocation) {
  const normalized = String(query || "").trim().toUpperCase();
  if (!normalized.includes("+")) {
    return null;
  }

  try {
    if (openLocationCode.isFull(normalized)) {
      const decoded = openLocationCode.decode(normalized);
      return normalizeCoordinate(decoded.latitudeCenter, decoded.longitudeCenter);
    }
    if (referenceLocation && openLocationCode.isShort(normalized)) {
      const recovered = openLocationCode.recoverNearest(
        normalized,
        referenceLocation.lat,
        referenceLocation.lon
      );
      const decoded = openLocationCode.decode(recovered);
      return normalizeCoordinate(decoded.latitudeCenter, decoded.longitudeCenter);
    }
  } catch {
    return null;
  }

  return null;
}

function scoreGeocodeResult(result) {
  const type = String(result?.type || result?.addresstype || "").toLowerCase();
  const displayName = String(result?.display_name || "").toLowerCase();
  let score = 0;

  if (type.includes("village") || type.includes("hamlet") || type.includes("locality") || type.includes("farm")) {
    score += 6;
  }
  if (type.includes("highway") || type.includes("road") || type.includes("track")) {
    score += 4;
  }
  if (displayName.includes(", india")) {
    score += 4;
  }
  if (type.includes("town") || type.includes("city") || type.includes("municipality")) {
    score += 3;
  }

  return score;
}

function buildLocationSelection(coordinate, details = {}) {
  const normalized = normalizeCoordinate(coordinate?.lat, coordinate?.lon);
  if (!normalized) {
    return null;
  }

  const address = details.address || {};
  const landmark = String(details.landmark || buildLandmark(address) || "").trim();
  const village = String(details.village || buildVillageLabel(address) || "").trim();
  const nearbyVillageNames = dedupeStrings(details.nearbyVillageNames || extractNearbyVillageNames(address));
  const labelParts = [landmark, village].filter(Boolean);
  const label =
    String(details.label || "").trim() ||
    labelParts.join(", ") ||
    String(details.displayName || "").trim() ||
    formatCoordinateLabel(normalized);

  return {
    lat: normalized.lat,
    lon: normalized.lon,
    label,
    displayName: String(details.displayName || details.label || label).trim(),
    village,
    landmark,
    nearbyVillageNames,
    plusCode: String(details.plusCode || encodePlusCode(normalized.lat, normalized.lon)).trim(),
    addressLine: String(details.addressLine || details.displayName || label).trim(),
    sourceType: String(details.sourceType || "").trim(),
    sourceProvider: String(details.sourceProvider || "").trim(),
  };
}

function resolveKnownLocation(query) {
  const normalizedQuery = normalizeLocationKey(query);
  if (!normalizedQuery) {
    return null;
  }

  const match = KNOWN_LOCATION_OVERRIDES.find((item) =>
    item.keys.some((key) => normalizedQuery === key || normalizedQuery.startsWith(`${key},`))
  );

  if (!match) {
    return null;
  }

  return buildLocationSelection(match, {
    label: match.label,
    displayName: match.label,
    village: match.village,
    landmark: match.landmark,
    nearbyVillageNames: match.nearbyVillageNames,
    sourceType: match.sourceType,
    sourceProvider: match.sourceProvider,
  });
}

async function searchNominatim(query, signal) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", INDIA_COUNTRY_CODE);
  url.searchParams.set("q", query);

  const response = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Unable to search location.");
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      const coordinate = normalizeCoordinate(item?.lat, item?.lon);
      if (!coordinate) {
        return null;
      }
      return {
        ...buildLocationSelection(coordinate, {
          label: item?.display_name || query,
          displayName: item?.display_name || query,
          address: item?.address || {},
          sourceType: item?.type || item?.addresstype || "",
          sourceProvider: "nominatim",
        }),
        raw: item,
        score: scoreGeocodeResult(item),
      };
    })
    .filter(Boolean);
}

async function searchPhoton(query, signal) {
  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", `${query}, India`);
  url.searchParams.set("limit", "6");

  const response = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Unable to search location.");
  }

  const data = await response.json();
  const features = Array.isArray(data?.features) ? data.features : [];
  return features
    .map((feature) => {
      const coordinates = feature?.geometry?.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        return null;
      }
      const coordinate = normalizeCoordinate(coordinates[1], coordinates[0]);
      if (!coordinate) {
        return null;
      }
      const properties = feature?.properties || {};
      const village = properties.city || properties.district || properties.county || "";
      return {
        ...buildLocationSelection(coordinate, {
          label: properties.name || properties.street || query,
          displayName: [properties.name, village, properties.state].filter(Boolean).join(", "),
          village,
          landmark: properties.street || properties.name || "",
          sourceType: properties.osm_value || properties.type || "",
          sourceProvider: "photon",
        }),
        raw: feature,
        score: 2,
      };
    })
    .filter(Boolean);
}

export async function reverseGeocodeCoordinate(lat, lon, signal) {
  const normalized = normalizeCoordinate(lat, lon);
  if (!normalized) {
    return null;
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("lat", String(normalized.lat));
  url.searchParams.set("lon", String(normalized.lon));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to resolve destination.");
  }

  const data = await response.json();
  return buildLocationSelection(normalized, {
    displayName: data?.display_name || "",
    addressLine: data?.display_name || "",
    address: data?.address || {},
    sourceType: data?.type || data?.addresstype || "reverse",
    sourceProvider: "nominatim",
  });
}

export async function geocodePlace(query, signal, options = {}) {
  const normalizedQuery = String(query || "").trim();
  if (!normalizedQuery) {
    return null;
  }

  const knownLocation = resolveKnownLocation(normalizedQuery);
  if (knownLocation) {
    return knownLocation;
  }

  const explicitCoordinate = parseCoordinateInput(normalizedQuery);
  if (explicitCoordinate) {
    const reverseResult = await reverseGeocodeCoordinate(
      explicitCoordinate.lat,
      explicitCoordinate.lon,
      signal
    ).catch(() => null);
    return (
      reverseResult ||
      buildLocationSelection(explicitCoordinate, {
        label: formatCoordinateLabel(explicitCoordinate),
        sourceType: "coordinate",
        sourceProvider: "manual",
      })
    );
  }

  const plusCodeCoordinate = decodePlusCode(normalizedQuery, options.referenceLocation);
  if (plusCodeCoordinate) {
    const reverseResult = await reverseGeocodeCoordinate(
      plusCodeCoordinate.lat,
      plusCodeCoordinate.lon,
      signal
    ).catch(() => null);
    return (
      reverseResult ||
      buildLocationSelection(plusCodeCoordinate, {
        label: normalizedQuery.toUpperCase(),
        plusCode: normalizedQuery.toUpperCase(),
        sourceType: "plus-code",
        sourceProvider: "open-location-code",
      })
    );
  }

  const candidates = [];

  try {
    candidates.push(...(await searchNominatim(normalizedQuery, signal)));
  } catch {
    // Fallback below.
  }

  if (!candidates.length) {
    try {
      candidates.push(...(await searchPhoton(normalizedQuery, signal)));
    } catch {
      return null;
    }
  }

  if (!candidates.length) {
    return null;
  }

  candidates.sort((left, right) => right.score - left.score);
  return candidates[0];
}

export function buildRouteUrl(start, end) {
  return `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson&steps=false&alternatives=3`;
}

export async function fetchRouteSummary(start, end, signal, routePreference = "fastest") {
  const response = await fetch(buildRouteUrl(start, end), {
    signal,
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Unable to load route.");
  }

  const data = await response.json();
  const route = Array.isArray(data?.routes)
    ? [...data.routes]
        .filter((candidate) => Number(candidate?.duration) > 0)
        .sort((left, right) =>
          routePreference === "shortest"
            ? Number(left?.distance || 0) - Number(right?.distance || 0)
            : Number(left?.duration || 0) - Number(right?.duration || 0)
        )[0]
    : null;
  const coordinates = Array.isArray(route?.geometry?.coordinates) ? route.geometry.coordinates : [];

  return {
    distanceKm: Number(route?.distance || 0) / 1000,
    durationMin: Number(route?.duration || 0) / 60,
    path: coordinates
      .map(([lon, lat]) => [Number(lat), Number(lon)])
      .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1])),
  };
}

export function resolvePickupCoordinate(pickup, currentLocation) {
  const normalizedPickup = String(pickup || "").trim();
  if (normalizedPickup === LIVE_PICKUP_LABEL && currentLocation) {
    return buildLocationSelection(normalizeCoordinate(currentLocation.lat, currentLocation.lon), {
      label: LIVE_PICKUP_LABEL,
      sourceType: "live-location",
      sourceProvider: "browser",
    });
  }
  return null;
}

export function buildManualLocationLabel(baseLabel, landmark) {
  const location = String(baseLabel || "").trim();
  const nextLandmark = String(landmark || "").trim();
  if (!location) {
    return nextLandmark;
  }
  if (!nextLandmark) {
    return location;
  }
  return `${location} (${nextLandmark})`;
}

export { LIVE_PICKUP_LABEL, encodePlusCode };
