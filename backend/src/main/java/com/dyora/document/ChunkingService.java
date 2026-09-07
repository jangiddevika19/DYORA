package com.dyora.document;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Splits extracted document text into overlapping chunks. Kept deliberately simple
 * (character-window based) so it can later be swapped for a token-aware / embedding-based
 * chunker feeding a vector database without changing the calling code.
 */
@Service
public class ChunkingService {

    private static final int CHUNK_SIZE = 1800;
    private static final int OVERLAP = 200;

    public List<String> chunk(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return chunks;
        }

        String normalized = text.replaceAll("\\s+", " ").trim();
        int length = normalized.length();
        int start = 0;

        while (start < length) {
            int end = Math.min(start + CHUNK_SIZE, length);
            chunks.add(normalized.substring(start, end));
            if (end == length) break;
            start = end - OVERLAP;
        }

        return chunks;
    }

    /**
     * Naive relevance-based chunk retrieval used until a vector DB is introduced.
     * Scores chunks by keyword overlap with the query.
     */
    public List<String> findRelevantChunks(List<String> chunks, String query, int topN) {
        String[] queryWords = query.toLowerCase().split("\\W+");

        return chunks.stream()
                .map(c -> new Object[]{c, score(c.toLowerCase(), queryWords)})
                .sorted((a, b) -> Double.compare((double) b[1], (double) a[1]))
                .limit(topN)
                .map(o -> (String) o[0])
                .toList();
    }

    private double score(String chunkLower, String[] queryWords) {
        double s = 0;
        for (String w : queryWords) {
            if (w.length() < 3) continue;
            if (chunkLower.contains(w)) s += 1;
        }
        return s;
    }
}
