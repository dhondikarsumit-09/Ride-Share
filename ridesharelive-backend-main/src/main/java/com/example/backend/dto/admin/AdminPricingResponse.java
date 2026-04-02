package com.example.backend.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminPricingResponse(List<PricingRow> items, Instant updatedAt) {
    public record PricingRow(
            Long id,
            String rideType,
            BigDecimal baseFare,
            BigDecimal perKmRate,
            BigDecimal perMinuteRate,
            BigDecimal ruralMultiplier,
            BigDecimal cityTierMultiplier,
            BigDecimal nightChargeMultiplier,
            BigDecimal peakMultiplier,
            BigDecimal maxSurgeMultiplier,
            BigDecimal tollFee,
            BigDecimal bookingFee,
            Instant updatedAt
    ) {
    }
}
