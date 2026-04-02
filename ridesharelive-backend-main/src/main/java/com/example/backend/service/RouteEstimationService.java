package com.example.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class RouteEstimationService {

    private final RestClient osrmClient;

    public RouteEstimationService(
            @Value("${app.routing.osrm.base-url:https://router.project-osrm.org}") String osrmBaseUrl
    ) {
        this.osrmClient = RestClient.create(osrmBaseUrl);
    }

    public RouteSnapshot resolveRoute(Double pickupLat, Double pickupLon, Double dropLat, Double dropLon, String routePreference) {
        if (!hasValidCoordinates(pickupLat, pickupLon, dropLat, dropLon)) {
            return null;
        }

        String normalizedPreference = normalizeRoutePreference(routePreference);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = osrmClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/route/v1/driving/{pickupLon},{pickupLat};{dropLon},{dropLat}")
                            .queryParam("overview", "full")
                            .queryParam("geometries", "geojson")
                            .queryParam("steps", "false")
                            .queryParam("alternatives", "3")
                            .build(pickupLon, pickupLat, dropLon, dropLat))
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return null;
            }

            Object routesValue = response.get("routes");
            if (!(routesValue instanceof List<?> routes) || routes.isEmpty()) {
                return null;
            }

            @SuppressWarnings("unchecked")
            Map<?, ?> route = routes.stream()
                    .filter(Map.class::isInstance)
                    .map(Map.class::cast)
                    .min((left, right) -> "shortest".equals(normalizedPreference)
                            ? Double.compare(toDouble(left.get("distance")), toDouble(right.get("distance")))
                            : Double.compare(toDouble(left.get("duration")), toDouble(right.get("duration"))))
                    .orElse(null);
            if (route == null) {
                return null;
            }

            double distanceKm = toDouble(route.get("distance")) / 1000.0;
            double durationMin = toDouble(route.get("duration")) / 60.0;
            List<List<Double>> path = extractPath(route.get("geometry"));
            if (!Double.isFinite(distanceKm) || distanceKm <= 0 || !Double.isFinite(durationMin) || durationMin <= 0) {
                return null;
            }

            return new RouteSnapshot(distanceKm, durationMin, path, "osrm");
        } catch (Exception ignored) {
            return null;
        }
    }

    public RouteSnapshot buildFallbackRoute(Double pickupLat, Double pickupLon, Double dropLat, Double dropLon, Double fallbackDistanceKm) {
        double distanceKm = fallbackDistanceKm == null ? 0 : fallbackDistanceKm;
        if ((!Double.isFinite(distanceKm) || distanceKm <= 0) && hasValidCoordinates(pickupLat, pickupLon, dropLat, dropLon)) {
            distanceKm = haversineKm(pickupLat, pickupLon, dropLat, dropLon) * 1.22;
        }
        if (!Double.isFinite(distanceKm) || distanceKm <= 0) {
            return null;
        }

        double durationMin = Math.max(4.0, (distanceKm / 28.0) * 60.0);
        List<List<Double>> path = new ArrayList<>();
        if (hasValidCoordinates(pickupLat, pickupLon, dropLat, dropLon)) {
            path.add(List.of(pickupLat, pickupLon));
            path.add(List.of(dropLat, dropLon));
        }
        return new RouteSnapshot(distanceKm, durationMin, path, "fallback");
    }

    private static boolean hasValidCoordinates(Double pickupLat, Double pickupLon, Double dropLat, Double dropLon) {
        return isFinite(pickupLat) && isFinite(pickupLon) && isFinite(dropLat) && isFinite(dropLon);
    }

    private static String normalizeRoutePreference(String routePreference) {
        return "shortest".equalsIgnoreCase(routePreference) ? "shortest" : "fastest";
    }

    private static boolean isFinite(Double value) {
        return value != null && Double.isFinite(value);
    }

    private static double toDouble(Object value) {
        if (value instanceof Number numberValue) {
            return numberValue.doubleValue();
        }
        if (value == null) {
            return Double.NaN;
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException ignored) {
            return Double.NaN;
        }
    }

    private static List<List<Double>> extractPath(Object geometryValue) {
        if (!(geometryValue instanceof Map<?, ?> geometry)) {
            return List.of();
        }
        Object coordinatesValue = geometry.get("coordinates");
        if (!(coordinatesValue instanceof List<?> coordinates)) {
            return List.of();
        }

        List<List<Double>> path = new ArrayList<>();
        for (Object pointValue : coordinates) {
            if (!(pointValue instanceof List<?> point) || point.size() < 2) {
                continue;
            }
            double lon = toDouble(point.get(0));
            double lat = toDouble(point.get(1));
            if (Double.isFinite(lat) && Double.isFinite(lon)) {
                path.add(List.of(lat, lon));
            }
        }
        return path;
    }

    private static double haversineKm(double startLat, double startLon, double endLat, double endLon) {
        double latDistance = Math.toRadians(endLat - startLat);
        double lonDistance = Math.toRadians(endLon - startLon);
        double startLatRad = Math.toRadians(startLat);
        double endLatRad = Math.toRadians(endLat);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(startLatRad) * Math.cos(endLatRad)
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        return 6371.0 * 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
    }

    public record RouteSnapshot(
            double distanceKm,
            double durationMin,
            List<List<Double>> path,
            String provider
    ) {
    }
}
