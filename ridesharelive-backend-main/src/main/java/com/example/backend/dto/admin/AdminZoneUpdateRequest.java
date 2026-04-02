package com.example.backend.dto.admin;

public record AdminZoneUpdateRequest(
        String demandLevel,
        Boolean serviceable,
        Boolean ruralRouteSupport,
        Integer activeDrivers,
        Integer ongoingRides,
        String blockedRoads,
        String boundaryLabel
) {
}
