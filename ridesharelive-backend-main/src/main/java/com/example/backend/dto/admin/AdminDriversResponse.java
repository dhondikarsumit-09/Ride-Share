package com.example.backend.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminDriversResponse(List<DriverRow> items, long total) {
    public record DriverRow(
            Long id,
            String name,
            String email,
            String city,
            boolean online,
            boolean blocked,
            String kycStatus,
            String vehicleLabel,
            String assignedZone,
            BigDecimal ratingAverage,
            double acceptancePercentage,
            double cancellationPercentage,
            BigDecimal earningsToday,
            Instant lastActive,
            Double latitude,
            Double longitude
    ) {
    }
}
