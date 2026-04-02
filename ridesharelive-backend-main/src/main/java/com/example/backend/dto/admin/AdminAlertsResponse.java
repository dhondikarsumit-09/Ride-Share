package com.example.backend.dto.admin;

import java.time.Instant;
import java.util.List;

public record AdminAlertsResponse(List<AlertRow> items, long total) {
    public record AlertRow(
            String id,
            String type,
            String severity,
            String title,
            String subtitle,
            String status,
            Instant createdAt
    ) {
    }
}
