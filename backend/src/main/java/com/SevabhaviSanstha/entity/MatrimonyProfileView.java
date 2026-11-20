package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "matrimony_profile_views", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"viewer_id", "viewed_profile_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrimonyProfileView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "viewer_id", nullable = false)
    private Integer viewerId;

    @Column(name = "viewed_profile_id", nullable = false)
    private Integer viewedProfileId;

    @Builder.Default
    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt = LocalDateTime.now();
}
