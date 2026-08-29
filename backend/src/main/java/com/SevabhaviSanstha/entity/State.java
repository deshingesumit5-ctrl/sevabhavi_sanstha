package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "states")
@Data
public class State {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Nationalized
    @Column(name = "name_mr", nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String nameMr;

    @Nationalized
    @Column(name = "name_en", nullable = false, length = 100, columnDefinition = "NVARCHAR(100)")
    private String nameEn;
}
