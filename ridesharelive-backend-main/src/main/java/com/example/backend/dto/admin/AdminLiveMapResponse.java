package com.example.backend.dto.admin;

import java.time.Instant;
import java.util.List;

public record AdminLiveMapResponse(
        List<DriverMarker> drivers,
        List<RideMarker> rides,
        List<ZoneMarker> zones,
        List<SosMarker> sosAlerts,
        Instant generatedAt
) {
    public record DriverMarker(Long id, String name, double latitude, double longitude, boolean online, String zone) {
    }
    public record RideMarker(Long id, String status, String pickup, String destination, Double driverLat, Double driverLon) {
    }
    public record ZoneMarker(Long id, String name, String city, String demandLevel, int activeDrivers, int ongoingRides) {
    }
    public record SosMarker(String id, String title, String severity, String city, Instant createdAt) {
    }
}
