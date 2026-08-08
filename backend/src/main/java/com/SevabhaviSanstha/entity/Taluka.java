package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "talukas")
@Data
public class Taluka {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @Column(name = "name_mr", nullable = false, length = 100)
    private String nameMr;

    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;
}
