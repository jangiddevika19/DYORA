package com.dyora.dto;

import lombok.Data;

@Data
public class UpdateSettingsRequest {
    private String responseLength;
    private String personality;
    private String preferredLanguage;
    private String theme;
}
