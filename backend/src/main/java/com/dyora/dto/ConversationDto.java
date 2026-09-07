package com.dyora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private Long id;
    private String title;
    private Long linkedDocumentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
