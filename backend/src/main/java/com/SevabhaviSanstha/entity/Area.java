package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "areas")
@Data
public class Area {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "taluka_id", nullable = false)
    private Taluka taluka;

    @Nationalized
    @Column(name = "name_mr", nullable = false, length = 200, columnDefinition = "NVARCHAR(200)")
    private String nameMr;

    @Nationalized
    @Column(name = "name_en", nullable = false, length = 200, columnDefinition = "NVARCHAR(200)")
    private String nameEn;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
