package com.example.backend.dto.admin;

import java.time.Instant;
import java.util.List;

public record AdminComplaintsResponse(List<ComplaintRow> items, long total) {
    public record ComplaintRow(
            Long id,
            String category,
            String severity,
            String status,
            String city,
            String subject,
            String userName,
            String driverName,
            Long rideId,
            String assignedTo,
            Instant createdAt,
            Instant updatedAt
    ) {
    }
}
