package com.dyora.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MoodRequest {
    @NotBlank
    private String text;
}
