package com.dyora.controller;

import com.dyora.dto.UpdateSettingsRequest;
import com.dyora.entity.User;
import com.dyora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, String>> get(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "responseLength", user.getResponseLength(),
                "personality", user.getPersonality(),
                "preferredLanguage", user.getPreferredLanguage(),
                "theme", user.getTheme()
        ));
    }

    @PutMapping
    public ResponseEntity<Void> update(@AuthenticationPrincipal User user, @RequestBody UpdateSettingsRequest request) {
        if (request.getResponseLength() != null) user.setResponseLength(request.getResponseLength());
        if (request.getPersonality() != null) user.setPersonality(request.getPersonality());
        if (request.getPreferredLanguage() != null) user.setPreferredLanguage(request.getPreferredLanguage());
        if (request.getTheme() != null) user.setTheme(request.getTheme());
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }
}
