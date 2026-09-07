package com.dyora.service;

import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Heuristically classifies what kind of structured response a user is asking for,
 * so the frontend can render it appropriately (plain text, checklist, roadmap,
 * study plan, interview set, table, code, notes, timeline, action plan).
 */
@Component
public class ResponseTypeClassifier {

    public String classify(String userMessage) {
        String m = userMessage.toLowerCase(Locale.ROOT);

        if (containsAny(m, "interview questions", "interview prep", "mock interview", "interview ke liye"))
            return "interview_set";
        if (containsAny(m, "study plan", "revision plan", "prepare for exam", "padhai ka plan"))
            return "study_plan";
        if (containsAny(m, "roadmap", "learning path", "career path"))
            return "roadmap";
        if (containsAny(m, "mcq", "quiz", "multiple choice"))
            return "notes";
        if (containsAny(m, "flashccard"))
            return "notes";
        if (containsAny(m, "checklist", "to-do", "todo list"))
            return "checklist";
        if (containsAny(m, "timeline", "schedule for the week", "day by day"))
            return "timeline";
        if (containsAny(m, "compare", "vs ", "difference between") && containsAny(m, "table"))
            return "table";
        if (containsAny(m, "write code", "debug", "fix this code", "function", "algorithm", "```"))
            return "code";
        if (containsAny(m, "notes on", "make notes", "summarize", "summary of", "key points"))
            return "notes";
        if (containsAny(m, "action plan", "plan of action", "steps to"))
            return "action_plan";

        return "text";
    }

    private boolean containsAny(String source, String... needles) {
        for (String n : needles) {
            if (source.contains(n)) return true;
        }
        return false;
    }
}
