package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "donation_types")
@Data
public class DonationType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Nationalized
    @Column(name = "name_en", nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String nameEn;

    @Nationalized
    @Column(name = "name_mr", nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String nameMr;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
