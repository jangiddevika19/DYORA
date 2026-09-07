package com.dyora.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Resolves the active AIProvider based on configuration (dyora.ai.provider).
 * Extend this with AnthropicProvider / GeminiProvider / LocalProvider as they are implemented,
 * each annotated as its own @Component and wired here.
 */
@Component
@RequiredArgsConstructor
public class AIProviderFactory {

    private final OpenAICompatibleProvider openAICompatibleProvider;

    @Value("${dyora.ai.provider}")
    private String configuredProvider;

    public AIProvider getProvider() {
        // Currently only "openai-compatible" is implemented. Future providers can be
        // switched here purely via the AI_PROVIDER environment variable.
        return switch (configuredProvider) {
            case "openai-compatible" -> openAICompatibleProvider;
            default -> openAICompatibleProvider;
        };
    }
}
