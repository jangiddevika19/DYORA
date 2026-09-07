package com.dyora.service;

import com.dyora.dto.ConversationDto;
import com.dyora.dto.MessageDto;
import com.dyora.entity.Conversation;
import com.dyora.entity.Message;
import com.dyora.exception.NotFoundException;
import com.dyora.exception.UnauthorizedException;
import com.dyora.repository.ConversationRepository;
import com.dyora.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public List<ConversationDto> listConversations(Long userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public ConversationDto createConversation(Long userId, String title) {
        Conversation conversation = Conversation.builder()
                .userId(userId)
                .title(title == null || title.isBlank() ? "New conversation" : title.trim())
                .build();
        return toDto(conversationRepository.save(conversation));
    }

    public ConversationDto getConversation(Long userId, Long conversationId) {
        return toDto(loadOwned(userId, conversationId));
    }

    @Transactional
    public ConversationDto renameConversation(Long userId, Long conversationId, String newTitle) {
        Conversation conversation = loadOwned(userId, conversationId);
        conversation.setTitle(newTitle.trim());
        return toDto(conversationRepository.save(conversation));
    }

    @Transactional
    public void deleteConversation(Long userId, Long conversationId) {
        Conversation conversation = loadOwned(userId, conversationId);
        messageRepository.deleteByConversationId(conversation.getId());
        conversationRepository.delete(conversation);
    }

    public List<MessageDto> getMessages(Long userId, Long conversationId) {
        loadOwned(userId, conversationId);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream().map(this::toDto).toList();
    }

    Conversation loadOwned(Long userId, Long conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("Conversation not found."));
        if (!conversation.getUserId().equals(userId)) {
            throw new UnauthorizedException("You do not have access to this conversation.");
        }
        return conversation;
    }

    private ConversationDto toDto(Conversation c) {
        return ConversationDto.builder()
                .id(c.getId())
                .title(c.getTitle())
                .linkedDocumentId(c.getLinkedDocumentId())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private MessageDto toDto(Message m) {
        return MessageDto.builder()
                .id(m.getId())
                .role(m.getRole().name())
                .content(m.getContent())
                .responseType(m.getResponseType())
                .detectedMood(m.getDetectedMood())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
