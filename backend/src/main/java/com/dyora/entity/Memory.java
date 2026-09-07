package com.dyora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "memories", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "mem_key"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Memory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "mem_key", nullable = false, length = 120)
    private String key;

    @Column(name = "mem_value", nullable = false, length = 1000)
    private String value;

    @Column(name = "category", length = 60)
    private String category;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
