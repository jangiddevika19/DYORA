# DYORA — Architecture Notes

## Request flow (chat)

1. Frontend sends `POST /api/chat` with JWT in `Authorization` header.
2. `JwtAuthFilter` validates the token and sets the authenticated `User` as the security principal.
3. `ChatController` delegates to `ChatService`, which:
   - runs `MoodDetector` on the incoming message (tone only, not diagnostic),
   - persists the user message,
   - loads short-term memory (recent turns of the conversation),
   - loads long-term memory via `MemoryService.buildMemoryContext`,
   - optionally loads linked-document context,
   - builds a personality-driven system prompt (`ChatService.buildSystemPrompt`),
   - calls `AIProviderFactory.getProvider().complete(...)`,
   - classifies the ideal rendering type via `ResponseTypeClassifier`,
   - persists the assistant reply,
   - passively captures any new long-term memory signals.
4. Response returns to the frontend with `content`, `responseType`, and `detectedMood`.

## Swapping AI providers

Implement `com.dyora.ai.AIProvider`, annotate with `@Component`, and add a branch in
`AIProviderFactory.getProvider()` keyed off the `AI_PROVIDER` environment variable.
No controller, service, or frontend code needs to change.

## Document Q&A grounding

`DocumentService` restricts the model's context to the extracted document text (or the
most relevant chunks, scored by keyword overlap via `ChunkingService.findRelevantChunks`),
and instructs the model to say when an answer isn't present rather than inventing one.
This chunk-scoring step is the natural place to introduce embeddings + a vector database
later, without changing the calling code in `DocumentService` or `ChatService`.
