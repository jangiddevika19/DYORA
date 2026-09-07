package com.dyora.service;

import com.dyora.dto.MemoryDto;
import com.dyora.entity.Memory;
import com.dyora.exception.NotFoundException;
import com.dyora.exception.UnauthorizedException;
import com.dyora.memory.MemoryExtractor;
import com.dyora.repository.MemoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MemoryService {

    private final MemoryRepository memoryRepository;
    private final MemoryExtractor memoryExtractor;

    public List<MemoryDto> listMemories(Long userId) {
        return memoryRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public void deleteMemory(Long userId, Long memoryId) {
        Memory memory = memoryRepository.findById(memoryId)
                .orElseThrow(() -> new NotFoundException("Memory not found."));
        if (!memory.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to this memory.");
        }
        memoryRepository.delete(memory);
    }

    @Transactional
    public void clearAllMemories(Long userId) {
        memoryRepository.deleteByUserId(userId);
    }

    /**
     * Scans a user message for explicit, non-sensitive long-term memory candidates
     * and stores/updates them. Called automatically after every chat turn.
     */
    @Transactional
    public void captureFromMessage(Long userId, String message) {
        Map<String, String> candidates = memoryExtractor.extract(message);
        candidates.forEach((key, value) -> upsert(userId, key, value, "auto-detected"));
    }

    @Transactional
    public void upsert(Long userId, String key, String value, String category) {
        Memory memory = memoryRepository.findByUserIdAndKey(userId, key)
                .orElse(Memory.builder().userId(userId).key(key).build());
        memory.setValue(value);
        memory.setCategory(category);
        memoryRepository.save(memory);
    }

    public String buildMemoryContext(Long userId) {
        List<Memory> memories = memoryRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        if (memories.isEmpty()) return "";

        StringBuilder sb = new StringBuilder("Known long-term facts about this user (use naturally, don't recite as a list):\n");
        for (Memory m : memories) {
            sb.append("- ").append(m.getKey().replace('_', ' ')).append(": ").append(m.getValue()).append("\n");
        }
        return sb.toString();
    }

    private MemoryDto toDto(Memory m) {
        return MemoryDto.builder()
                .id(m.getId())
                .key(m.getKey())
                .value(m.getValue())
                .category(m.getCategory())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
