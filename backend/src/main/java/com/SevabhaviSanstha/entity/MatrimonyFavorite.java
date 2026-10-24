package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Table(name = "matrimony_favorites", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "favorite_profile_id"})
})
@Data
@Builder
public class MatrimonyFavorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "favorite_profile_id", nullable = false)
    private Integer favoriteProfileId;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public MatrimonyFavorite() {
    }

    public MatrimonyFavorite(Integer id, Integer userId, Integer favoriteProfileId, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.favoriteProfileId = favoriteProfileId;
        this.createdAt = createdAt;
    }
}
