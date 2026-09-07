package com.dyora.service;

import com.dyora.ai.AIMessage;
import com.dyora.ai.AIProviderFactory;
import com.dyora.document.ChunkingService;
import com.dyora.document.ExtractedDocument;
import com.dyora.document.PdfExtractionService;
import com.dyora.dto.DocumentDto;
import com.dyora.entity.Document;
import com.dyora.entity.DocumentChunk;
import com.dyora.exception.NotFoundException;
import com.dyora.exception.UnauthorizedException;
import com.dyora.repository.DocumentChunkRepository;
import com.dyora.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final PdfExtractionService pdfExtractionService;
    private final ChunkingService chunkingService;
    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final AIProviderFactory aiProviderFactory;

    @Transactional
    public DocumentDto upload(Long userId, MultipartFile file) {
        ExtractedDocument extracted = pdfExtractionService.extract(file);

        Document document = Document.builder()
                .userId(userId)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .pageCount(extracted.pageCount())
                .extractedText(extracted.text())
                .status("PROCESSED")
                .build();
        document = documentRepository.save(document);

        List<String> chunks = chunkingService.chunk(extracted.text());
        int idx = 0;
        for (String content : chunks) {
            documentChunkRepository.save(DocumentChunk.builder()
                    .documentId(document.getId())
                    .chunkIndex(idx++)
                    .content(content)
                    .build());
        }

        return toDto(document);
    }

    public List<DocumentDto> list(Long userId) {
        return documentRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList();
    }

    public DocumentDto get(Long userId, Long documentId) {
        return toDto(loadOwned(userId, documentId));
    }

    @Transactional
    public void delete(Long userId, Long documentId) {
        Document document = loadOwned(userId, documentId);
        documentChunkRepository.deleteByDocumentId(document.getId());
        documentRepository.delete(document);
    }

    public String answerQuestion(Long userId, Long documentId, String question) {
        Document document = loadOwned(userId, documentId);
        String context = buildRelevantContext(document, question);
        String system = """
                You are DYORA, an intelligent assistant answering questions strictly based on the
                provided document excerpt below. If the answer is not present in the excerpt, say so
                honestly instead of guessing or making something up. Be clear, concise and helpful.

                DOCUMENT: %s
                ---
                %s
                ---
                """.formatted(document.getFileName(), context);

        return aiProviderFactory.getProvider().complete(system, List.of(), question);
    }

    public String summarize(Long userId, Long documentId) {
        Document document = loadOwned(userId, documentId);
        String context = truncate(document.getExtractedText(), 9000);
        String system = "You are DYORA. Summarize the following document clearly, in a well-structured way with key sections and important points. Never invent facts not present in the text.\n\nDOCUMENT: " + context;
        return aiProviderFactory.getProvider().complete(system, List.of(), "Summarize this document for me.");
    }

    public String generateMcqs(Long userId, Long documentId, int count) {
        Document document = loadOwned(userId, documentId);
        String context = truncate(document.getExtractedText(), 9000);
        String system = "You are DYORA. Based only on the document content below, generate exactly " + count +
                " multiple choice questions (4 options each, mark the correct answer) covering the most important concepts. " +
                "Format clearly with numbering.\n\nDOCUMENT: " + context;
        return aiProviderFactory.getProvider().complete(system, List.of(), "Generate the MCQs now.");
    }

    public String generateFlashcards(Long userId, Long documentId) {
        Document document = loadOwned(userId, documentId);
        String context = truncate(document.getExtractedText(), 9000);
        String system = "You are DYORA. Create concise flashcards (Q: / A: pairs) covering the key concepts in this document only.\n\nDOCUMENT: " + context;
        return aiProviderFactory.getProvider().complete(system, List.of(), "Generate flashcards now.");
    }

    public String generateNotes(Long userId, Long documentId) {
        Document document = loadOwned(userId, documentId);
        String context = truncate(document.getExtractedText(), 9000);
        String system = "You are DYORA. Create clean, well-organized study notes (headings, bullet points) from this document only.\n\nDOCUMENT: " + context;
        return aiProviderFactory.getProvider().complete(system, List.of(), "Generate notes now.");
    }

    public String generateStudyPlan(Long userId, Long documentId, String timeframe) {
        Document document = loadOwned(userId, documentId);
        String context = truncate(document.getExtractedText(), 9000);
        String system = "You are DYORA. Create a realistic, day-by-day revision/study plan for the timeframe: " + timeframe +
                ", covering the important topics in this document only.\n\nDOCUMENT: " + context;
        return aiProviderFactory.getProvider().complete(system, List.of(), "Generate the study plan now.");
    }

    private String buildRelevantContext(Document document, String query) {
        List<DocumentChunk> chunks = documentChunkRepository.findByDocumentIdOrderByChunkIndexAsc(document.getId());
        if (chunks.isEmpty()) {
            return truncate(document.getExtractedText(), 6000);
        }
        List<String> contents = chunks.stream().map(DocumentChunk::getContent).toList();
        List<String> relevant = chunkingService.findRelevantChunks(contents, query, 5);
        return String.join("\n---\n", relevant);
    }

    private String truncate(String text, int max) {
        if (text == null) return "";
        return text.length() > max ? text.substring(0, max) : text;
    }

    Document loadOwned(Long userId, Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Document not found."));
        if (!document.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to this document.");
        }
        return document;
    }

    private DocumentDto toDto(Document d) {
        return DocumentDto.builder()
                .id(d.getId())
                .fileName(d.getFileName())
                .fileType(d.getFileType())
                .fileSize(d.getFileSize())
                .pageCount(d.getPageCount())
                .status(d.getStatus())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
