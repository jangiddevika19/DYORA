package com.dyora.ai;

import java.util.List;

/**
 * Abstraction over any LLM backend. New providers (Anthropic, Gemini, local models)
 * can be added by implementing this interface without touching business logic.
 */
public interface AIProvider {

    /**
     * Sends a chat completion request and returns the assistant's reply.
     *
     * @param systemPrompt   instructions describing DYORA's personality & context
     * @param history        prior turns of the conversation (short-term memory)
     * @param userMessage    the newest user message
     * @return the model-generated reply text
     */
    String complete(String systemPrompt, List<AIMessage> history, String userMessage);

    /**
     * Identifies which provider implementation is active (for logging/diagnostics).
     */
    String providerName();
}
