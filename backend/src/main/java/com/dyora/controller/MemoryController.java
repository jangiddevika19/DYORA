package com.dyora.controller;

import com.dyora.dto.MemoryDto;
import com.dyora.entity.User;
import com.dyora.service.MemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memory")
@RequiredArgsConstructor
public class MemoryController {

    private final MemoryService memoryService;

    @GetMapping
    public ResponseEntity<List<MemoryDto>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(memoryService.listMemories(user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        memoryService.deleteMemory(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAll(@AuthenticationPrincipal User user) {
        memoryService.clearAllMemories(user.getId());
        return ResponseEntity.noContent().build();
    }
}
