package com.dyora.service;

import com.dyora.dto.MoodResponse;
import com.dyora.mood.MoodDetector;
import com.dyora.mood.MoodResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MoodService {

    private final MoodDetector moodDetector;

    public MoodResponse analyze(String text) {
        MoodResult result = moodDetector.detect(text);
        return MoodResponse.builder()
                .mood(result.mood().name())
                .intensity(result.intensity())
                .suggestedTone(result.suggestedTone())
                .build();
    }
}
