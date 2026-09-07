package com.dyora.controller;

import com.dyora.dto.MoodRequest;
import com.dyora.dto.MoodResponse;
import com.dyora.service.MoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mood")
@RequiredArgsConstructor
public class MoodController {

    private final MoodService moodService;

    @PostMapping("/analyze")
    public ResponseEntity<MoodResponse> analyze(@Valid @RequestBody MoodRequest request) {
        return ResponseEntity.ok(moodService.analyze(request.getText()));
    }
}
