package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "genders")
@Data
public class Gender {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "code", nullable = false, unique = true, length = 10)
    private String code;

    @Column(name = "label_mr", nullable = false, length = 20)
    private String labelMr;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
