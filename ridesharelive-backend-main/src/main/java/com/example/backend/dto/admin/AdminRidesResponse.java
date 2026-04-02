package com.example.backend.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminRidesResponse(List<RideRow> items, long total) {
    public record RideRow(
            Long id,
            String riderName,
            String driverName,
            String pickup,
            String destination,
            BigDecimal fare,
            String paymentMode,
            String paymentStatus,
            String status,
            String etaLabel,
            Instant createdAt
    ) {
    }
}
