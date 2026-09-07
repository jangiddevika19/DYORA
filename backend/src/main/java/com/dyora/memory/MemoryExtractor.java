package com.dyora.memory;

import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Extracts explicit, non-sensitive long-term memory candidates from a user's message.
 * Deliberately conservative: only structured/explicit signals are captured
 * (preferred language, career goals, ongoing projects, learning goals) -
 * we never auto-store free-form personal or sensitive information.
 */
@Component
public class MemoryExtractor {

    private static final Pattern LANGUAGE_PREF = Pattern.compile(
            "(?i)i (?:prefer|like|want) (?:you to )?(?:answer|reply|respond|talk) in (java|python|javascript|c\\+\\+|hindi|hinglish|english)");

    private static final Pattern CAREER_GOAL = Pattern.compile(
            "(?i)i (?:want to become|am preparing for|want to be) (?:an? )?([a-zA-Z ]{3,40})");

    private static final Pattern LEARNING_GOAL = Pattern.compile(
            "(?i)i(?:'m| am) learning ([a-zA-Z0-9 .+#]{2,40})");

    private static final Pattern PROJECT = Pattern.compile(
            "(?i)i(?:'m| am) (?:building|working on) (?:a |an )?([a-zA-Z0-9 .+#]{3,60})");

    public Map<String, String> extract(String message) {
        Map<String, String> found = new LinkedHashMap<>();

        Matcher lang = LANGUAGE_PREF.matcher(message);
        if (lang.find()) {
            found.put("preferred_language_or_style", lang.group(1).toLowerCase(Locale.ROOT));
        }

        Matcher career = CAREER_GOAL.matcher(message);
        if (career.find()) {
            found.put("career_goal", career.group(1).trim());
        }

        Matcher learning = LEARNING_GOAL.matcher(message);
        if (learning.find()) {
            found.put("learning_goal", learning.group(1).trim());
        }

        Matcher project = PROJECT.matcher(message);
        if (project.find()) {
            found.put("ongoing_project", project.group(1).trim());
        }

        return found;
    }
}
