package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "cities")
@Data
public class City {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @Nationalized
    @Column(name = "name_en", nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String nameEn;

    @Nationalized
    @Column(name = "name_mr", nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String nameMr;
}
