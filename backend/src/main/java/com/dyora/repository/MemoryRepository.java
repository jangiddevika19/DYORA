package com.dyora.repository;

import com.dyora.entity.Memory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MemoryRepository extends JpaRepository<Memory, Long> {
    List<Memory> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<Memory> findByUserIdAndKey(Long userId, String key);
    void deleteByUserId(Long userId);
}
