package com.example.backend.dto.admin;

public record AdminActionRequest(
        String action,
        String status,
        String note,
        Long driverId,
        String zoneName
) {
}
