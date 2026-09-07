package com.dyora.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequest {
    private Long conversationId;

    @NotBlank(message = "Message cannot be empty")
    private String message;

    private Long documentId;
}
