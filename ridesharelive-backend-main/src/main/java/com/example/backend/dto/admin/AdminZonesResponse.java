package com.example.backend.dto.admin;

import java.time.Instant;
import java.util.List;

public record AdminZonesResponse(List<ZoneRow> items, long total) {
    public record ZoneRow(
            Long id,
            String name,
            String city,
            String demandLevel,
            boolean serviceable,
            boolean ruralRouteSupport,
            int activeDrivers,
            int ongoingRides,
            String blockedRoads,
            String boundaryLabel,
            Instant updatedAt
    ) {
    }
}
