package com.example.backend.dto.admin;

import java.time.Instant;

public record AdminLiveUpdatePayload(
        String type,
        Object data,
        Instant timestamp
) {
}
