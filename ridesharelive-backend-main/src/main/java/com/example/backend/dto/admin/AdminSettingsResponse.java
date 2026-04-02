package com.example.backend.dto.admin;

import java.time.Instant;
import java.util.List;

public record AdminSettingsResponse(List<SettingRow> items, Instant updatedAt) {
    public record SettingRow(
            Long id,
            String key,
            String value,
            String category,
            Instant updatedAt
    ) {
    }
}
