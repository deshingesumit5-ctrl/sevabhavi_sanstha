package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
@Data
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Nationalized
    @Column(name = "name", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name;

    @Nationalized
    @Column(name = "mobile", nullable = false, columnDefinition = "NVARCHAR(20)")
    private String mobile;

    @Nationalized
    @Column(name = "email", columnDefinition = "NVARCHAR(100)")
    private String email;

    @Nationalized
    @Column(name = "message", nullable = false, columnDefinition = "NVARCHAR(2000)")
    private String message;

    @Nationalized
    @Column(name = "status", columnDefinition = "NVARCHAR(50)")
    private String status = "NEW";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "NEW";
        }
    }
}
