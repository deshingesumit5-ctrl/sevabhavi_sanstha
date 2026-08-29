package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;
import java.time.LocalDateTime;

@Entity
@Table(name = "shibir_masters")
@Data
public class ShibirMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Nationalized
    @Column(name = "shibir_name", nullable = false, length = 255, columnDefinition = "NVARCHAR(255)")
    private String shibirName;

    @Nationalized
    @Column(name = "shibir_date", length = 50, columnDefinition = "NVARCHAR(50)")
    private String shibirDate;

    @Nationalized
    @Column(name = "shibir_location", length = 255, columnDefinition = "NVARCHAR(255)")
    private String shibirLocation;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
