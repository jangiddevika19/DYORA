package com.dyora.mood;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Lightweight, explainable keyword/pattern based conversational-tone detector.
 *
 * IMPORTANT: this detects the TONE of the current message(s) only. It never attempts
 * to infer or diagnose mental health conditions - it purely adapts DYORA's response
 * style (shorter/calmer vs energetic vs detailed) to feel more human.
 */
@Component
public class MoodDetector {

    private static final Map<Mood, List<String>> KEYWORDS = Map.ofEntries(
            Map.entry(Mood.EXCITED, List.of("omg", "finally", "yay", "awesome", "!!", "cant wait", "can't wait", "so happy", "lets go", "let's go")),
            Map.entry(Mood.HAPPY, List.of("thank you", "thanks a lot", "great", "nice", "good news", "happy", "glad")),
            Map.entry(Mood.FRUSTRATED, List.of("kuch bhi sahi nahi", "not working", "ugh", "irritating", "frustrat", "why is this", "keeps failing", "so annoying", "isse pareshan")),
            Map.entry(Mood.ANGRY, List.of("angry", "furious", "gussa", "hate this", "so mad")),
            Map.entry(Mood.SAD, List.of("sad", "upset", "dukhi", "udaas", "feeling low", "not good", "depressed feeling")),
            Map.entry(Mood.STRESSED, List.of("stressed", "overwhelmed", "so much pressure", "deadline", "tension", "pareshan hu", "bahut tension")),
            Map.entry(Mood.CONFUSED, List.of("samajh nahi aa raha", "confused", "don't understand", "not clear", "kya matlab", "i'm lost")),
            Map.entry(Mood.TIRED, List.of("tired", "exhausted", "thak gaya", "thak gayi", "sleepy", "no energy")),
            Map.entry(Mood.CALM, List.of("all good", "sab theek", "relaxed", "chill"))
    );

    public MoodResult detect(String text) {
        if (text == null || text.isBlank()) {
            return new MoodResult(Mood.NEUTRAL, "LOW", "balanced");
        }

        String normalized = text.toLowerCase(Locale.ROOT);
        int exclaimCount = (int) text.chars().filter(c -> c == '!').count();

        for (Map.Entry<Mood, List<String>> entry : KEYWORDS.entrySet()) {
            for (String keyword : entry.getValue()) {
                if (normalized.contains(keyword)) {
                    String intensity = exclaimCount >= 2 ? "HIGH" : "MEDIUM";
                    return new MoodResult(entry.getKey(), intensity, toneFor(entry.getKey()));
                }
            }
        }

        if (exclaimCount >= 2) {
            return new MoodResult(Mood.EXCITED, "MEDIUM", toneFor(Mood.EXCITED));
        }

        return new MoodResult(Mood.NEUTRAL, "LOW", toneFor(Mood.NEUTRAL));
    }

    private String toneFor(Mood mood) {
        return switch (mood) {
            case FRUSTRATED, ANGRY, STRESSED, SAD, TIRED -> "calm, supportive, shorter, practical";
            case CONFUSED -> "extra simple, step-by-step, patient";
            case EXCITED, HAPPY -> "warm, matching positive energy, encouraging";
            case CALM, NEUTRAL -> "balanced, clear, natural";
        };
    }
}
