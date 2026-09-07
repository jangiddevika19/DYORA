package com.dyora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {


@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(nullable = false, length = 120)
private String name;

@Column(nullable = false, unique = true, length = 180)
private String email;

@Column(name = "password_hash", nullable = false)
private String password;

@Builder.Default
@Column(name = "response_length")
private String responseLength = "BALANCED";

@Builder.Default
@Column(name = "personality")
private String personality = "BALANCED";

@Builder.Default
@Column(name = "preferred_language")
private String preferredLanguage = "AUTO";

@Builder.Default
@Column(name = "theme")
private String theme = "DARK";

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
