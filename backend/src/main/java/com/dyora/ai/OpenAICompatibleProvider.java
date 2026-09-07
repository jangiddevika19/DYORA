package com.dyora.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;

/**
 * Works with any OpenAI-compatible /chat/completions endpoint
 * (OpenAI, Azure OpenAI, OpenRouter, Groq, Together, local vLLM/Ollama gateways, etc).
 */
@Slf4j
@Component
public class OpenAICompatibleProvider implements AIProvider {

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${dyora.ai.api-key}")
    private String apiKey;

    @Value("${dyora.ai.base-url}")
    private String baseUrl;

    @Value("${dyora.ai.model}")
    private String model;

    public OpenAICompatibleProvider(RestClient aiRestClient) {
        this.restClient = aiRestClient;
    }

    @Override
    public String complete(String systemPrompt, List<AIMessage> history, String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AIProviderException("AI_API_KEY is not configured on the server.");
        }

        try {
            ObjectNode body = objectMapper.createObjectNode();
            body.put("model", model);
            body.put("temperature", 0.7);
            body.put("max_tokens", 1400);

            ArrayNode messages = body.putArray("messages");
            messages.add(objectMapper.createObjectNode().put("role", "system").put("content", systemPrompt));
            for (AIMessage m : history) {
                messages.add(objectMapper.createObjectNode().put("role", m.role()).put("content", m.content()));
            }
            messages.add(objectMapper.createObjectNode().put("role", "user").put("content", userMessage));

            String url = baseUrl.endsWith("/") ? baseUrl + "chat/completions" : baseUrl + "/chat/completions";

            String responseBody = restClient.post()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                throw new AIProviderException("AI provider returned no choices.");
            }
            return choices.get(0).path("message").path("content").asText();

        } catch (RestClientResponseException ex) {
            log.error("AI provider HTTP error: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            if (ex.getStatusCode().value() == 401) {
                throw new AIProviderException("AI provider rejected the API key.");
            }
            if (ex.getStatusCode().value() == 429) {
                throw new AIProviderException("AI provider rate limit reached. Please try again shortly.");
            }
            throw new AIProviderException("AI provider request failed.");
        } catch (AIProviderException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected AI provider error", ex);
            throw new AIProviderException("Unexpected error while contacting the AI provider.", ex);
        }
    }

    @Override
    public String providerName() {
        return "openai-compatible:" + model;
    }
}
