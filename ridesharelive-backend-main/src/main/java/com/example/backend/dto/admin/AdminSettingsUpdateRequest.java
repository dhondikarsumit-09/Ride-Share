package com.example.backend.dto.admin;

import java.util.List;

public record AdminSettingsUpdateRequest(List<SettingInput> items) {
    public record SettingInput(String key, String value, String category) {
    }
}
