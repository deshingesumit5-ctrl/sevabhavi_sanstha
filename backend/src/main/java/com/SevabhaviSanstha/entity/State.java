package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "states")
@Data
public class State {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name_mr", nullable = false, length = 100)
    private String nameMr;

    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;
}
