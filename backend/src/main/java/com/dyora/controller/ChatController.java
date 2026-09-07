package com.dyora.controller;

import com.dyora.dto.ChatRequest;
import com.dyora.dto.ChatResponse;
import com.dyora.entity.User;
import com.dyora.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@AuthenticationPrincipal User user,
                                              @Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.chat(user, request));
    }
}
