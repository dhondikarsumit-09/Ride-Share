export const RIDE_OPTIONS = [
  {
    id: "bike",
    name: "Bike",
    type: "bike",
    ratePerKm: 2.83,
    minimumFare: 25,
    eta: 3,
    seats: 1,
    description: "Solo ride, fastest",
    icon: "BIKE",
  },
  {
    id: "auto",
    name: "Auto",
    type: "auto",
    ratePerKm: 4.5,
    minimumFare: 40,
    eta: 5,
    seats: 3,
    description: "Affordable local ride",
    icon: "AUTO",
  },
  {
    id: "electric-auto",
    name: "Electric Auto",
    type: "electric-auto",
    ratePerKm: 4.5,
    minimumFare: 60,
    eta: 6,
    seats: 3,
    description: "Quiet and eco friendly",
    icon: "EV",
  },
  {
    id: "hatchback",
    name: "Hatchback",
    type: "hatchback",
    ratePerKm: 7.0,
    minimumFare: 80,
    eta: 6,
    seats: 4,
    description: "Compact daily ride",
    icon: "HATCH",
  },
  {
    id: "sedan",
    name: "Sedan",
    type: "sedan",
    ratePerKm: 8.33,
    minimumFare: 100,
    eta: 7,
    seats: 4,
    description: "Comfort everyday car",
    icon: "SEDAN",
  },
  {
    id: "suv",
    name: "SUV",
    type: "suv",
    ratePerKm: 10.5,
    minimumFare: 140,
    eta: 8,
    seats: 6,
    description: "Spacious family ride",
    icon: "SUV",
  },
];

export function calculateRideFare(distanceInKm, vehicleType, roundTripEnabled = false) {
  const normalizedDistance = Number(distanceInKm);
  const selectedOption = RIDE_OPTIONS.find((item) => item.id === vehicleType || item.type === vehicleType);

  if (!selectedOption || !Number.isFinite(normalizedDistance) || normalizedDistance <= 0) {
    return 0;
  }

  const oneWayFare = Math.max(normalizedDistance * selectedOption.ratePerKm, selectedOption.minimumFare);
  let fare = oneWayFare;
  if (roundTripEnabled) {
    fare = oneWayFare * 2;
  }

  return Math.round(fare);
}

export function formatRideEta(baseMinutes, etaOffset = 0) {
  const totalMinutes = Math.max(2, Math.round(baseMinutes) + etaOffset);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${totalMinutes} min`;
  }

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}

export function getFareExamples() {
  const distances = [5, 10, 15, 30];
  return distances.map((distance) => ({
    distance,
    fares: RIDE_OPTIONS.map((item) => ({
      vehicle: item.name,
      fare: calculateRideFare(distance, item.id, false),
    })),
  }));
}
