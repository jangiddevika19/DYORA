package com.dyora.controller;

import com.dyora.dto.ConversationDto;
import com.dyora.dto.MessageDto;
import com.dyora.entity.User;
import com.dyora.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @GetMapping
    public ResponseEntity<List<ConversationDto>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(conversationService.listConversations(user.getId()));
    }

    @PostMapping
    public ResponseEntity<ConversationDto> create(@AuthenticationPrincipal User user,
                                                    @RequestBody(required = false) Map<String, String> body) {
        String title = body == null ? null : body.get("title");
        return ResponseEntity.ok(conversationService.createConversation(user.getId(), title));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConversationDto> get(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(conversationService.getConversation(user.getId(), id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ConversationDto> rename(@AuthenticationPrincipal User user, @PathVariable Long id,
                                                    @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(conversationService.renameConversation(user.getId(), id, body.get("title")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        conversationService.deleteConversation(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MessageDto>> messages(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(conversationService.getMessages(user.getId(), id));
    }
}
