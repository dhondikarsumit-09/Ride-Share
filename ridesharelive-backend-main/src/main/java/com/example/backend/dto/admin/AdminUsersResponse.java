package com.example.backend.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AdminUsersResponse(List<UserRow> items, long total) {
    public record UserRow(
            Long id,
            String name,
            String email,
            String city,
            boolean active,
            boolean blocked,
            BigDecimal walletBalance,
            long complaintsCount,
            Instant lastActive,
            BigDecimal totalSpending,
            long totalTrips
    ) {
    }
}
