package com.dyora.controller;

import com.dyora.dto.DocumentDto;
import com.dyora.dto.DocumentQuestionRequest;
import com.dyora.entity.User;
import com.dyora.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<DocumentDto> upload(@AuthenticationPrincipal User user,
                                               @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(documentService.upload(user.getId(), file));
    }

    @GetMapping
    public ResponseEntity<List<DocumentDto>> list(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(documentService.list(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDto> get(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(documentService.get(user.getId(), id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        documentService.delete(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/ask")
    public ResponseEntity<Map<String, String>> ask(@AuthenticationPrincipal User user, @PathVariable Long id,
                                                     @Valid @RequestBody DocumentQuestionRequest request) {
        String answer = documentService.answerQuestion(user.getId(), id, request.getQuestion());
        return ResponseEntity.ok(Map.of("answer", answer));
    }

    @PostMapping("/{id}/summary")
    public ResponseEntity<Map<String, String>> summary(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(Map.of("summary", documentService.summarize(user.getId(), id)));
    }

    @PostMapping("/{id}/mcqs")
    public ResponseEntity<Map<String, String>> mcqs(@AuthenticationPrincipal User user, @PathVariable Long id,
                                                      @RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(Map.of("mcqs", documentService.generateMcqs(user.getId(), id, count)));
    }

    @PostMapping("/{id}/flashcards")
    public ResponseEntity<Map<String, String>> flashcards(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(Map.of("flashcards", documentService.generateFlashcards(user.getId(), id)));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<Map<String, String>> notes(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(Map.of("notes", documentService.generateNotes(user.getId(), id)));
    }

    @PostMapping("/{id}/study-plan")
    public ResponseEntity<Map<String, String>> studyPlan(@AuthenticationPrincipal User user, @PathVariable Long id,
                                                           @RequestParam(defaultValue = "3 days") String timeframe) {
        return ResponseEntity.ok(Map.of("studyPlan", documentService.generateStudyPlan(user.getId(), id, timeframe)));
    }
}
