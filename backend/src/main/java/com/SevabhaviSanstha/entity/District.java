package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "districts")
@Data
public class District {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "state_id", nullable = false)
    private State state;

    @Nationalized
    @Column(name = "name_mr", nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String nameMr;

    @Nationalized
    @Column(name = "name_en", nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String nameEn;
}
