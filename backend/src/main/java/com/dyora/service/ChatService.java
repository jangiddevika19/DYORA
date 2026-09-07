package com.dyora.service;

import com.dyora.ai.AIMessage;
import com.dyora.ai.AIProviderFactory;
import com.dyora.dto.ChatRequest;
import com.dyora.dto.ChatResponse;
import com.dyora.entity.Conversation;
import com.dyora.entity.Document;
import com.dyora.entity.Message;
import com.dyora.entity.User;
import com.dyora.mood.MoodResult;
import com.dyora.mood.MoodDetector;
import com.dyora.repository.ConversationRepository;
import com.dyora.repository.DocumentRepository;
import com.dyora.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final DocumentRepository documentRepository;
    private final AIProviderFactory aiProviderFactory;
    private final MoodDetector moodDetector;
    private final MemoryService memoryService;
    private final ResponseTypeClassifier responseTypeClassifier;

    @Transactional
    public ChatResponse chat(User user, ChatRequest request) {
        Conversation conversation = resolveConversation(user.getId(), request);

        // 1. Mood detection on the current message (tone-only, never diagnostic)
        MoodResult mood = moodDetector.detect(request.getMessage());

        // 2. Persist the user's message
        Message userMessage = messageRepository.save(Message.builder()
                .conversationId(conversation.getId())
                .role(Message.Role.USER)
                .content(request.getMessage())
                .detectedMood(mood.mood().name())
                .build());

        // 3. Short-term memory: last N turns of this conversation
        List<AIMessage> history = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversation.getId())
                .stream()
                .filter(m -> !m.getId().equals(userMessage.getId()))
                .sorted(Comparator.comparing(Message::getCreatedAt))
                .map(m -> m.getRole() == Message.Role.USER
                        ? AIMessage.user(m.getContent())
                        : AIMessage.assistant(m.getContent()))
                .toList();

        // keep only last 20 turns to bound context size
        if (history.size() > 20) {
            history = history.subList(history.size() - 20, history.size());
        }

        // 4. Long-term memory context
        String memoryContext = memoryService.buildMemoryContext(user.getId());

        // 5. Optional linked document context
        String documentContext = "";
        Long effectiveDocId = request.getDocumentId() != null
                ? request.getDocumentId()
                : conversation.getLinkedDocumentId();

        if (effectiveDocId != null) {
            documentContext = documentRepository.findById(effectiveDocId)
                    .filter(d -> d.getUserId().equals(user.getId()))
                    .map(Document::getExtractedText)
                    .map(t -> t.length() > 6000 ? t.substring(0, 6000) : t)
                    .map(t -> "\n\nThe user has an uploaded document open. Use it when relevant:\n" + t)
                    .orElse("");
        }

        // 6. Build the DYORA personality system prompt
        String systemPrompt = buildSystemPrompt(
                user,
                mood,
                memoryContext,
                documentContext
        );

        // 7. Call the AI provider
        String reply = aiProviderFactory.getProvider()
                .complete(systemPrompt, history, request.getMessage());

        // 8. Classify the ideal response rendering type
        String responseType = responseTypeClassifier.classify(request.getMessage());

        // 9. Persist assistant reply
        Message assistantMessage = messageRepository.save(Message.builder()
                .conversationId(conversation.getId())
                .role(Message.Role.ASSISTANT)
                .content(reply)
                .responseType(responseType)
                .build());

        // 10. Auto-title new conversations from the first message
        if ("New conversation".equals(conversation.getTitle())) {
            conversation.setTitle(deriveTitle(request.getMessage()));
        }

        conversation.setUpdatedAt(java.time.LocalDateTime.now());
        conversationRepository.save(conversation);

        // 11. Passive long-term memory capture (explicit signals only)
        memoryService.captureFromMessage(
                user.getId(),
                request.getMessage()
        );

        return ChatResponse.builder()
                .conversationId(conversation.getId())
                .messageId(assistantMessage.getId())
                .content(reply)
                .responseType(responseType)
                .detectedMood(mood.mood().name())
                .build();
    }

    private Conversation resolveConversation(Long userId, ChatRequest request) {
        if (request.getConversationId() != null) {
            return conversationRepository.findById(request.getConversationId())
                    .filter(c -> c.getUserId().equals(userId))
                    .orElseGet(() -> createNewConversation(
                            userId,
                            request.getDocumentId()
                    ));
        }

        return createNewConversation(
                userId,
                request.getDocumentId()
        );
    }

    private Conversation createNewConversation(Long userId, Long documentId) {
        return conversationRepository.save(Conversation.builder()
                .userId(userId)
                .title("New conversation")
                .linkedDocumentId(documentId)
                .build());
    }

    private String deriveTitle(String message) {
        String cleaned = message.trim().replaceAll("\\s+", " ");
        return cleaned.length() > 48
                ? cleaned.substring(0, 48) + "..."
                : cleaned;
    }

    private String buildSystemPrompt(
            User user,
            MoodResult mood,
            String memoryContext,
            String documentContext
    ) {

        String personality = switch (
                user.getPersonality() == null
                        ? "BALANCED"
                        : user.getPersonality()
        ) {
            case "FRIENDLY" ->
                    "warm, casual, and encouraging, like a supportive friend who happens to be brilliant";

            case "PROFESSIONAL" ->
                    "polished, precise, and professional, while still being approachable";

            default ->
                    "calm, intelligent, warm and practical";
        };

        String length = switch (
                user.getResponseLength() == null
                        ? "BALANCED"
                        : user.getResponseLength()
        ) {
            case "SHORT" ->
                    "Keep answers brief and to the point unless the user clearly needs depth.";

            case "DETAILED" ->
                    "Provide thorough, well-structured, detailed answers with examples where useful.";

            default ->
                    "Be concise for simple questions, and detailed when the question genuinely requires it.";
        };

        String language = switch (
                user.getPreferredLanguage() == null
                        ? "AUTO"
                        : user.getPreferredLanguage()
        ) {
            case "ENGLISH" ->
                    "Always respond in English.";

            case "HINDI" ->
                    "Respond in Hindi (Devanagari) unless the user writes in English.";

            case "HINGLISH" ->
                    "Feel free to respond in natural Hinglish (mixed Hindi-English), matching the user's style.";

            default ->
                    "Mirror the user's language naturally — English, Hindi, or Hinglish — matching how they write to you.";
        };

        return """
                You are DYORA — an intelligent, emotionally aware personal AI assistant. Your tagline is
                "An AI that understands more than your words."

                CREATOR INFORMATION:
                DYORA was created and developed by Devika Jangid.
                If the user asks who created, built, developed, or made DYORA, clearly and naturally
                state that DYORA was created and developed by Devika Jangid.
                Do not claim that you personally created DYORA.
                Do not invent another creator or developer.

                PERSONALITY: You are %s. You never sound robotic or corporate. Avoid starting replies with
                "Sure!", "Certainly!", or similar filler. Avoid excessive repetition. Be encouraging without
                being fake, and never patronizing.

                RESPONSE LENGTH: %s

                LANGUAGE: %s

                CURRENT USER TONE: The user's message reads as %s (intensity: %s). Adapt your tone: %s.
                Never mention that you are "detecting mood" or label the user's emotions back at them —
                just naturally adjust how you respond. Never make mental-health diagnoses; you are reading
                conversational tone only, not psychological state.

                CAPABILITIES: You can explain concepts simply, help with coding/debugging, analyze uploaded
                documents, create study plans, interview preparation plans, roadmaps, notes, rewrite text,
                draft professional messages/emails, and help with career planning. When a structured format
                (steps, plan, list, table, code) truly fits the request, format your answer that way using
                clean Markdown. Do not force structure onto answers that are naturally conversational.

                %s
                %s

                Above all: sound like someone who understands what the user means, not just what they typed.
                """.formatted(
                personality,
                length,
                language,
                mood.mood().name().toLowerCase(),
                mood.intensity().toLowerCase(),
                mood.suggestedTone(),
                memoryContext.isBlank() ? "" : "\n" + memoryContext,
                documentContext
        );
    }
}