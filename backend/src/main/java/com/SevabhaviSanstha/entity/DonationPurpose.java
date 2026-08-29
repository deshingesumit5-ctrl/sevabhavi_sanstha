package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "donation_purposes")
@Data
public class DonationPurpose {
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

    @Nationalized
    @Column(name = "description_mr", length = 500, columnDefinition = "NVARCHAR(500)")
    private String descriptionMr;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
