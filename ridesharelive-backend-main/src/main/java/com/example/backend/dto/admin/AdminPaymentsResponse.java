package com.example.backend.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminPaymentsResponse(List<PaymentRow> items, long total) {
    public record PaymentRow(
            Long rideId,
            String riderName,
            String driverName,
            BigDecimal amount,
            String paymentMode,
            String paymentStatus,
            String paymentReference,
            String settlementStatus,
            Instant createdAt
    ) {
    }
}
