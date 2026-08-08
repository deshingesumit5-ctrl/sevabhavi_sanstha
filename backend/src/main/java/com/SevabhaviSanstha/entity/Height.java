package com.SevabhaviSanstha.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "\"Height\"")
public class Height {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "\"HeightId\"")
    private Integer heightId;

    @Column(name = "\"HeightText\"", nullable = false, length = 20)
    private String heightText;

    public Height() {}

    public Integer getHeightId() { return heightId; }
    public void setHeightId(Integer heightId) { this.heightId = heightId; }
    public String getHeightText() { return heightText; }
    public void setHeightText(String heightText) { this.heightText = heightText; }
}