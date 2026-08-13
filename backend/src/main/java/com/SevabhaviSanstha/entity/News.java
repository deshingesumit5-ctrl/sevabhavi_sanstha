package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDateTime;

@Entity
@Table(name = "news")
@Data
public class News {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Nationalized
    @Column(name = "title", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @Nationalized
    @Column(name = "content", nullable = false, columnDefinition = "NVARCHAR(2000)")
    private String content;

    @Nationalized
    @Column(name = "category", columnDefinition = "NVARCHAR(100)")
    private String category = "General";

    @Column(name = "status", columnDefinition = "NVARCHAR(50)")
    private String status = "PUBLISHED";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "PUBLISHED";
        }
        if (category == null) {
            category = "General";
        }
    }
}
