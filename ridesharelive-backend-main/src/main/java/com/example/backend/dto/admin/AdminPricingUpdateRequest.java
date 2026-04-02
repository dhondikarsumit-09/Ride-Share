package com.example.backend.dto.admin;

import java.math.BigDecimal;
import java.util.List;

public record AdminPricingUpdateRequest(List<PricingInput> items) {
    public record PricingInput(
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
            BigDecimal bookingFee
    ) {
    }
}
