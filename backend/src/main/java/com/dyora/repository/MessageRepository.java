package com.dyora.repository;

import com.dyora.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
    List<Message> findTop20ByConversationIdOrderByCreatedAtDesc(Long conversationId);
    void deleteByConversationId(Long conversationId);
}
